use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer as SplTransfer};
use anchor_spl::associated_token::AssociatedToken;

use crate::states::ProgramState;

#[derive(Accounts)]
pub struct TransferToken<'info> {
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

  pub token_program: Program<'info, Token>,

  pub program_state: Account<'info, ProgramState>,

  pub associated_token_program: Program<'info, AssociatedToken>,

  pub system_program: Program<'info, System>,
}

impl<'info> TransferToken<'info> {
  pub fn transfer_token(
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

    Ok(())
  }
}