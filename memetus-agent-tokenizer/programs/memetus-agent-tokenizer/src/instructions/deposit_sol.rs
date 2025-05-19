use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token::{Mint, TokenAccount, Token};
use anchor_spl::associated_token::AssociatedToken;

use crate::errors::deposit_sol_error::DepositSolError;
use crate::instructions::transfer_token;
use crate::states::vault_state::*;
use crate::events::deposit_sol_event::DepositSolEvent;

use crate::instructions as custom_instructions;
use crate::states::ProgramState;
use crate::states::MINT_AMOUNT;

#[derive(Accounts)]
#[instruction(id: u64)]

pub struct DepositSol<'info> {
  #[account(mut)]
  pub owner: Signer<'info>,

  #[account(mut)]
  pub user: Signer<'info>,

  #[account(mut)]
  pub mint: Account<'info, Mint>,

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
    associated_token::authority = user,
  )]
  pub to_ata: Account<'info, TokenAccount>,

  #[account(
    init,
    payer = owner,
    space = VaultState::INIT_SPACE,
    seeds = [
      b"vault_manager", 
      id.to_le_bytes().as_ref(),
      owner.key().as_ref()
    ],
    bump
  )]
  pub vault_manager: Account<'info, VaultState>,

  #[account(
    seeds = [
      b"vault_treasury", 
      id.to_le_bytes().as_ref(),
      owner.key().as_ref()
    ],
    bump
  )]
  pub vault_treasury: SystemAccount<'info>,

  pub program_state: Account<'info, ProgramState>,

  pub token_program: Program<'info, Token>,

  pub system_program: Program<'info, System>,

  pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> DepositSol<'info> {
  pub fn deposit_sol(
    &mut self,
    id: u64,
    amount: u64,
  ) -> Result <()> {
    // require!(
    //   self.vault_manager.status == VaultStatus::Active,
    //   DepositSolError::VaultAlreadyInitialized
    // );

    require!(
      self.vault_manager.status != VaultStatus::Settled && self.vault_manager.status != VaultStatus::Operating,
      DepositSolError::VaultNotActive
    );

    let cpi_accounts = system_program::Transfer {
      from: self.owner.to_account_info(),
      to: self.vault_treasury.to_account_info(),
    };

    let cpi_program = self.system_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    let is_over = self.vault_manager.amount + amount > self.vault_manager.target_amount;

    let timestamp = Clock::get()?.unix_timestamp;

    let mut transfer_ctx = transfer_token::TransferToken {
      owner: self.owner.clone(),
      user: self.user.clone(),
      mint: self.mint.clone(),
      program_state: self.program_state.clone(),
      from_ata: self.from_ata.clone(),
      to_ata: self.to_ata.clone(),
      token_program: self.token_program.clone(),
      system_program: self.system_program.clone(),
      associated_token_program: self.associated_token_program.clone(),
    };


    if is_over {
      let fixed_amount = self.vault_manager.target_amount - self.vault_manager.amount;
      system_program::transfer(cpi_ctx, fixed_amount)?;
      let ratio = (self.vault_manager.target_amount / fixed_amount) * 100;
      let transfer_amount = MINT_AMOUNT * ratio;

      custom_instructions::TransferToken::transfer_token(&mut transfer_ctx, transfer_amount);
      
      self.vault_manager.amount += fixed_amount;
      self.vault_manager.status = VaultStatus::Operating;
    } else {
      system_program::transfer(cpi_ctx, amount)?;
      let ratio = (self.vault_manager.target_amount / amount) * 100;
      let transfer_amount = MINT_AMOUNT * ratio;
      custom_instructions::TransferToken::transfer_token(&mut transfer_ctx, transfer_amount);

      self.vault_manager.amount += amount;
      self.vault_manager.status = VaultStatus::Fundraising;
    }
    
    emit!(DepositSolEvent {
      id: id,
      owner: self.owner.key(),
      vault_manager: self.vault_manager.key(),  
      vault_treasury: self.vault_treasury.key(),
      timestamp,
      status: self.vault_manager.status.clone(),
      amount: amount,
    });

    msg!(
    "DepositSolEvent emitted: id={}, owner={}, amount={}",
    id,
    self.owner.key(),
    amount
    );

    Ok(())
  }
}