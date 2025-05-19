use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]

pub struct ProgramState {
  pub owner: Pubkey,
  pub total: u64,
  pub bump: u8,
  pub initialized: bool,
}