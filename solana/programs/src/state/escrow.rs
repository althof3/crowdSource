use anchor_lang::prelude::*;

#[account]
pub struct EscrowAccount {
    pub author: Pubkey,        // 32
    pub sayembara_id: String,  // 4 + 36
    pub total_deposit: u64,    // 8 — lamports
    pub deadline: i64,         // 8 — unix timestamp
    pub confirmed_count: u32,  // 4
    pub distributed: bool,     // 1
    pub bump: u8,              // 1
}

impl EscrowAccount {
    pub const SIZE: usize = 32 + (4 + 36) + 8 + 8 + 4 + 1 + 1;
}
