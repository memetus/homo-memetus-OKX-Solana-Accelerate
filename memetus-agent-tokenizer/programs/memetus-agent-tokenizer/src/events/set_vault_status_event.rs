use anchor_lang::prelude::*;

use crate::states::VaultStatus;

#[event]
pub struct SetVaultStatusEvent {
  pub status: VaultStatus
}