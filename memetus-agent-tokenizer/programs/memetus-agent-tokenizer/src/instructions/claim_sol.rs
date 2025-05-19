use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::associated_token::AssociatedToken;
use crate::states::{vault_state::*, ProgramState, MINT_AMOUNT};
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer as SplTransfer};

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct ClaimSol<'info> {
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
    associated_token::authority = user,
  )]
  pub from_ata: Account<'info, TokenAccount>,


  #[account(
    init_if_needed,
    payer = owner,
    associated_token::mint = mint,
    associated_token::authority = owner,
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

  pub associated_token_program: Program<'info, AssociatedToken>,

  pub token_program: Program<'info, Token>,

  pub system_program: Program<'info, System>,
}

impl<'info> ClaimSol<'info> {
  pub fn claim_sol(
    &mut self,
    amount: u64,
  ) -> Result<()> {
    let destination = &mut self.to_ata;
    let source = &mut self.from_ata;
    let token_program = &mut self.token_program;
    let authority = &mut self.owner;

    let cpi_accounts = SplTransfer {
      from: source.to_account_info().clone(),
      to: destination.to_account_info().clone(),
      authority: authority.to_account_info().clone(),
    };

    let cpi_program = token_program.to_account_info();
    token::transfer(
      CpiContext::new(cpi_program, cpi_accounts),
      amount)?;
    
    let ratio = (MINT_AMOUNT / amount) * 100;

    let transfer_amount = self.vault_manager.target_amount * ratio;

    let transfer_sol_cpi_accounts = system_program::Transfer {
      from: self.vault_treasury.to_account_info(),
      to: self.user.to_account_info()
    };

    let transfer_sol_cpi_program = self.system_program.to_account_info();
    system_program::transfer(CpiContext::new(transfer_sol_cpi_program, transfer_sol_cpi_accounts), transfer_amount)?;

    Ok(())
  }
}