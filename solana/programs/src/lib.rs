use anchor_lang::prelude::*;

pub mod state;
pub mod instructions;

use instructions::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod crowdradar {
    use super::*;

    pub fn initialize_sayembara(
        ctx: Context<InitializeSayembara>,
        sayembara_id: String,
        deadline: i64,
        amount: u64,
    ) -> Result<()> {
        instructions::initialize_sayembara::handler(ctx, sayembara_id, deadline, amount)
    }

    pub fn distribute_rewards(
        ctx: Context<Distribute>,
        reporter_wallets: Vec<Pubkey>,
    ) -> Result<()> {
        instructions::distribute::handler(ctx, reporter_wallets)
    }
}

#[error_code]
pub enum CrowdRadarError {
    #[msg("Deadline not reached")]
    DeadlineNotReached,
    #[msg("Already distributed")]
    AlreadyDistributed,
    #[msg("Reporter not found in remaining accounts")]
    ReporterNotFound,
}
