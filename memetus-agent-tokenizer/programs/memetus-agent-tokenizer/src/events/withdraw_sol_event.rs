use anchor_lang::prelude::*;

use crate::states::VaultStatus;

#[event]
pub struct WithdrawSolEvent {
    pub id: u64,
    pub owner: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
    pub vault_treasury: Pubkey,
    pub vault_manager: Pubkey,
    pub status: VaultStatus,
}