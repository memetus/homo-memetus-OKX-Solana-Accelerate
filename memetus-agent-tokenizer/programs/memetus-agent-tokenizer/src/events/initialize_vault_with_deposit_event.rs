use anchor_lang::prelude::*;
use crate::states::VaultStatus;

#[event]
pub struct InitializeVaultWithDepositEvent {
    pub id: u64,
    pub owner: Pubkey,
    pub vault_manager: Pubkey,
    pub vault_treasury: Pubkey,
    pub timestamp: i64,
    pub amount: u64,
    pub status: VaultStatus
}