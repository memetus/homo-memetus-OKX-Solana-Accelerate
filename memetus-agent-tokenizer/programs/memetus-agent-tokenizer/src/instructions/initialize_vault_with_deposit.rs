use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::{
    token::{Mint, Token, TokenAccount},
    associated_token::AssociatedToken,
    metadata::{
        Metadata as Metaplex,
    },
};

use crate::instructions::create_initialize_mint;
use crate::instructions::mint_token;
use crate::{events::InitializeVaultWithDepositEvent, states::{CreateInitializeMintArgs, MINT_AMOUNT}};
use crate::states::vault_state::*;
use crate::states::program_state::*;
use crate::instructions::transfer_token;

use crate::instructions as custom_instructions;

#[derive(Accounts)]

pub struct InitializeVaultWithDeposit<'info> {
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
    init,
    payer = owner,
    associated_token::mint = mint,
    associated_token::authority = authority,
  )]
  pub destination: Account<'info, TokenAccount>,

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
    init_if_needed,
    payer = owner,
    associated_token::mint = mint,
    associated_token::authority = owner
  )]
  pub from_ata: Account<'info, TokenAccount>,

  #[account(
    init_if_needed,
    payer = owner,
    associated_token::mint = mint,
    associated_token::authority = owner,
  )]
  pub to_ata: Account<'info, TokenAccount>,

  pub program_state: Account<'info, ProgramState>,

  pub token_program: Program<'info, Token>,

  pub rent: Sysvar<'info, Rent>,

  pub system_program: Program<'info, System>,

  pub token_metadata_program: Program<'info, Metaplex>,

  pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> InitializeVaultWithDeposit<'info> {
  pub fn initialize_vault_with_deposit(
    &mut self,
    amount: u64,
    target_amount: u64,
    metadata_arg: CreateInitializeMintArgs,
    bumps: &InitializeVaultWithDepositBumps,
  ) -> Result<()> {
    let vault_manager = &mut self.vault_manager;
    let vault_treasury = &mut self.vault_treasury;
    let program_state = &mut self.program_state;

    vault_manager.set_inner(VaultState {
      id: program_state.total + 1,
      owner: self.owner.key(),
      vault_treasury: vault_treasury.key(),
      timestamp: Clock::get()?.unix_timestamp,
      amount,
      target_amount,
      mint: self.mint.key(),
      status: VaultStatus::Uninitialized,
      bump: bumps.vault_manager,
    });


    let cpi_accounts = system_program::Transfer {
      from: self.owner.to_account_info(),
      to: vault_treasury.to_account_info(),
    };

    let cpi_program = self.system_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    
    
    let is_over = vault_manager.amount + amount > vault_manager.target_amount;

    let timestamp = Clock::get()?.unix_timestamp;

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

    let mut transfer_ctx = transfer_token::TransferToken {
      owner: self.owner.clone(),
      user: self.owner.clone(),
      mint: self.mint.clone(),
      program_state: program_state.clone(),
      from_ata: self.from_ata.clone(),
      to_ata: self.to_ata.clone(),
      token_program: self.token_program.clone(),
      system_program: self.system_program.clone(),
      associated_token_program: self.associated_token_program.clone(),
    };

    if is_over {
      let fixed_amount = vault_manager.target_amount - vault_manager.amount;
      system_program::transfer(cpi_ctx, fixed_amount)?;

      let ratio = (vault_manager.target_amount / fixed_amount) * 100;
      let transfer_amount = MINT_AMOUNT * ratio;
      custom_instructions::TransferToken::transfer_token(&mut transfer_ctx, transfer_amount);

      vault_manager.amount += fixed_amount;
      vault_manager.status = VaultStatus::Operating;
    } else {
      system_program::transfer(cpi_ctx, amount)?;

      let ratio = (vault_manager.target_amount / amount) * 100;
      let transfer_amount = MINT_AMOUNT * ratio;
      custom_instructions::TransferToken::transfer_token(&mut transfer_ctx, transfer_amount);

      vault_manager.amount += amount;
      vault_manager.status = VaultStatus::Fundraising;
    }

    
    emit!(InitializeVaultWithDepositEvent {
      id: vault_manager.id,
      owner: self.owner.key(),
      vault_manager: vault_manager.key(),
      vault_treasury: vault_treasury.key(),
      timestamp,
      status: vault_manager.status.clone(),
      amount,
    });

    msg!("InitializeVaultWithDepositEvent emitted: id={}, owner={} vault_manager={}, vault_treasury={}, amount={}, status={:?}", 
      vault_manager.id,
      self.owner.key(),
      vault_manager.key(),
      vault_treasury.key(),
      amount,
      vault_manager.status.clone());

    program_state.total += 1;

    Ok(())
  }
}