use anchor_lang::prelude::*;

use crate::events::update_owner_event::UpdateOwnerEvent;
use crate::errors::update_owner_error::UpdateOwnerError;
use crate::states::ProgramState;

#[derive(Accounts)]

pub struct UpdateOwner<'info> {
  #[account(mut)]
  pub owner: Signer<'info>,

  pub program_state: Box<Account<'info, ProgramState>>,
}

impl<'info> UpdateOwner<'info> {
  pub fn update_owner(&mut self, new_owner: Pubkey) -> Result<()> {
    require!(self.program_state.owner.key() == self.owner.key(), UpdateOwnerError::Unauthorized);
  
    self.program_state.owner = new_owner;

    emit!(UpdateOwnerEvent {
      owner: self.owner.key(),
      new_owner: new_owner.key()  ,
      timestamp: Clock::get()?.unix_timestamp,
    });

    msg!(
    "UpdateOwnerEvent emitted: owner={}, new_owner={}, timestamp={}",
      self.owner.key(),
      new_owner,
      Clock::get()?.unix_timestamp
    );

    Ok(())
  }
}