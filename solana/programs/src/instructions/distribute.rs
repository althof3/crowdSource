use anchor_lang::prelude::*;
use crate::state::EscrowAccount;
use crate::CrowdRadarError;

#[derive(Accounts)]
pub struct Distribute<'info> {
    #[account(
        mut,
        seeds = [b"escrow", author.key().as_ref(), escrow.sayembara_id.as_bytes()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, EscrowAccount>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Distribute>, reporter_wallets: Vec<Pubkey>) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    let clock = Clock::get()?;

    require!(clock.unix_timestamp >= escrow.deadline, CrowdRadarError::DeadlineNotReached);
    require!(!escrow.distributed, CrowdRadarError::AlreadyDistributed);

    let total = escrow.to_account_info().lamports();

    if reporter_wallets.is_empty() {
        // Refund ke author
        **escrow.to_account_info().try_borrow_mut_lamports()? -= total;
        **ctx.accounts.author.to_account_info().try_borrow_mut_lamports()? += total;
    } else {
        let reward_each = total / reporter_wallets.len() as u64;
        let remainder = total % reporter_wallets.len() as u64;

        for reporter_key in reporter_wallets.iter() {
            let reporter_info = ctx.remaining_accounts.iter()
                .find(|a| a.key() == *reporter_key)
                .ok_or(CrowdRadarError::ReporterNotFound)?;

            **escrow.to_account_info().try_borrow_mut_lamports()? -= reward_each;
            **reporter_info.try_borrow_mut_lamports()? += reward_each;
        }

        // Sisa (pembagian tidak bulat) → refund ke author
        if remainder > 0 {
            **escrow.to_account_info().try_borrow_mut_lamports()? -= remainder;
            **ctx.accounts.author.to_account_info().try_borrow_mut_lamports()? += remainder;
        }
    }

    escrow.distributed = true;
    Ok(())
}
