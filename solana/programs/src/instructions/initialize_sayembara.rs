use anchor_lang::prelude::*;
use crate::state::EscrowAccount;

#[derive(Accounts)]
#[instruction(sayembara_id: String)]
pub struct InitializeSayembara<'info> {
    #[account(
        init,
        payer = author,
        space = 8 + EscrowAccount::SIZE,
        seeds = [b"escrow", author.key().as_ref(), sayembara_id.as_bytes()],
        bump
    )]
    pub escrow: Account<'info, EscrowAccount>,
    #[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeSayembara>,
    sayembara_id: String,
    deadline: i64,
    amount: u64,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    escrow.author = ctx.accounts.author.key();
    escrow.sayembara_id = sayembara_id;
    escrow.deadline = deadline;
    escrow.total_deposit = amount;
    escrow.confirmed_count = 0;
    escrow.distributed = false;
    escrow.bump = *ctx.bumps.get("escrow").unwrap();

    // Transfer SOL to escrow PDA
    let cpi_context = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.author.key(),
        &ctx.accounts.escrow.key(),
        amount,
    );
    anchor_lang::solana_program::program::invoke(
        &cpi_context,
        &[
            ctx.accounts.author.to_account_info(),
            ctx.accounts.escrow.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    Ok(())
}
