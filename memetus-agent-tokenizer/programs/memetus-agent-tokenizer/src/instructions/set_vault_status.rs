use anchor_lang::prelude::*;

use crate::events::SetVaultStatusEvent;
use crate::states::ProgramState;
use crate::states::VaultStatus;
use crate::states::vault_state::*;
use crate::errors::SetVaultStatusError;

#[derive(Accounts)]

pub struct SetVaultStatus<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
      mut,
      seeds = [
        b"vault_manager",
        vault_manager.id.to_le_bytes().as_ref(),
        owner.key().as_ref()
      ],
      bump
    )]
    pub vault_manager: Account<'info, VaultState>,

    pub program_state: Account<'info, ProgramState>,
}

impl<'info> SetVaultStatus<'info> {
  pub fn set_vault_state(
    &mut self,
    status: VaultStatus,
  ) -> Result<()> {
    require!(
      self.vault_manager.status != VaultStatus::Settled,
      SetVaultStatusError::VaultAlreadySettled
    );

    require!(
      self.owner.key() == self.vault_manager.owner,
      SetVaultStatusError::InvalidOwner
    );

    self.vault_manager.status = status.clone();

    emit!(SetVaultStatusEvent {
      status,
    });

    Ok(())
  }
}