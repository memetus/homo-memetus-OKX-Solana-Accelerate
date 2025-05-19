use anchor_lang::prelude::*;

#[event]
pub struct CreateInitializeMintEvent {
  pub name: String,
  pub symbol: String,
  pub uri: String,
  pub decimals: u8,
  pub owner: Pubkey,
  pub authority: Pubkey,
  pub mint: Pubkey,
  pub metadata: Pubkey,
}