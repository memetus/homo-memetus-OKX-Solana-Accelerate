use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug, InitSpace)]
pub enum VaultStatus {
    Uninitialized,
    Fundraising,
    Operating,
    Settled,        
}

#[account]
#[derive(InitSpace)]

pub struct VaultState {
  pub id: u64,
  pub owner: Pubkey,
  pub mint: Pubkey,
  pub vault_treasury: Pubkey,
  pub timestamp: i64,
  pub status: VaultStatus, 
  pub bump: u8,
  pub amount: u64,
  pub target_amount: u64,
}