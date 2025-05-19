use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken, metadata::Metadata as Metaplex, token::{Mint, Token, TokenAccount}
};

use crate::{instructions::{self as custom_instructions, create_initialize_mint, mint_token}, states::CreateInitializeMintArgs};
use crate::errors::InitializeVaultError;
use crate::events::initialize_vault_event::InitializeVaultEvent;
use crate::states::{vault_state::*, MINT_AMOUNT};
use crate::states::program_state::*;

#[derive(Accounts)]

pub struct InitializeVault<'info> {
  #[account(mut)]
  pub owner: Signer<'info>,

  #[account(mut)]
  pub authority: Signer<'info>,

  #[account(
    init,
    payer = owner,
    mint::decimals = 9,
    mint::authority = owner,
    seeds = [
      b"mint",
      (program_state.total + 1).to_le_bytes().as_ref(),
      owner.key().as_ref()
    ],
    bump
  )]
  pub mint: Account<'info, Mint>,


  #[account(
    init,
    payer = owner,
    space = VaultState::INIT_SPACE,
    seeds = [
      b"vault_manager", 
      (program_state.total + 1).to_le_bytes().as_ref(), 
      owner.key().as_ref()
    ],
    bump
  )]
  pub vault_manager: Account<'info, VaultState>,

  /// CHECK: This is used as raw account info for mint metadata; validation is handled manually
  #[account(mut)]
  pub metadata: UncheckedAccount<'info>,

  #[account(
    seeds = [
      b"vault_treasury", 
      (program_state.total + 1).to_le_bytes().as_ref(), 
      owner.key().as_ref()
    ],
    bump
  )]
  pub vault_treasury: SystemAccount<'info>,

  #[account(
    init,
    payer = owner,
    associated_token::mint = mint,
    associated_token::authority = authority,
  )]
  pub destination: Account<'info, TokenAccount>,

  pub program_state: Account<'info, ProgramState>,

  pub token_program: Program<'info, Token>,

  pub rent: Sysvar<'info, Rent>,

  pub system_program: Program<'info, System>,

  pub token_metadata_program: Program<'info, Metaplex>,

  pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> InitializeVault<'info> {
  pub fn initialize_vault(
    &mut self,
    target_amount: u64,
    metadata_arg: CreateInitializeMintArgs,
    bumps: &InitializeVaultBumps,
  ) -> Result<()> {
    let vault_manager = &mut self.vault_manager;
    let vault_treasury = &mut self.vault_treasury;
    let program_state = &mut self.program_state;

    require!(target_amount > 0, InitializeVaultError::TargetAmountZero);

    let timestamp = Clock::get()?.unix_timestamp;

    vault_manager.set_inner(VaultState {
      id: program_state.total + 1,
      owner: self.owner.key(),
      vault_treasury: vault_treasury.key(),
      timestamp,
      target_amount,
      amount: 0,
      mint: self.mint.key(),
      status: VaultStatus::Uninitialized,
      bump: bumps.vault_manager,
    });


    let mut create_initialize_mint_ctx = create_initialize_mint::CreateInitializeMint {
      owner: self.owner.clone(),
      authority: self.authority.clone(),
      vault_manager: vault_manager.clone(),
      mint: self.mint.clone(),
      program_state: program_state.clone(),
      token_program: self.token_program.clone(),
      rent: self.rent.clone(),
      system_program: self.system_program.clone(),
      token_metadata_program: self.token_metadata_program.clone(),
      metadata: self.metadata.clone(),
    };

    let mut mint_token_ctx = mint_token::MintToken {
      owner: self.owner.clone(),
      authority: self.authority.clone(),
      mint: self.mint.clone(),
      destination: self.destination.clone(),
      program_state: program_state.clone(),
      token_program: self.token_program.clone(),
      rent: self.rent.clone(),
      system_program: self.system_program.clone(),
      associated_token_program: self.associated_token_program.clone(),
    };

    custom_instructions::CreateInitializeMint::create_initialize_mint(&mut create_initialize_mint_ctx, metadata_arg.clone());
    custom_instructions::MintToken::mint_token(&mut mint_token_ctx, MINT_AMOUNT);

    emit!(InitializeVaultEvent {
      id: vault_manager.id,
      owner: self.owner.key(),
      vault_manager: vault_manager.key(),
      vault_treasury: vault_treasury.key(),
      timestamp,
      status: VaultStatus::Uninitialized,
      amount: 0,
    });

    msg!("InitializeVault emitted: id={}, owner={} vault_manager={}, vault_treasury={}, amount={}, status={:?}", 
      vault_manager.id,
      self.owner.key(),
      vault_manager.key(),
      vault_treasury.key(),
      0,
      VaultStatus::Uninitialized);

    program_state.total += 1;

    Ok(())
  }
}