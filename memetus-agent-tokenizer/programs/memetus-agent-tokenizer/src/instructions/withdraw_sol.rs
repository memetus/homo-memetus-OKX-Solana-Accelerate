use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::states::vault_state::*;
use crate::events::withdraw_sol_event::WithdrawSolEvent;

#[derive(Accounts)]
#[instruction(id: u64)]

pub struct WithdrawSol<'info> {
  #[account(mut)]
  pub owner: Signer<'info>,

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

  pub system_program: Program<'info, System>,
}

impl<'info> WithdrawSol<'info> {
  pub fn withdraw_sol(
    &mut self,
    id: u64,
  ) -> Result<()> {
    // Transfer the SOL from the vault treasury to the owner
    let cpi_accounts = system_program::Transfer {
      from: self.vault_treasury.to_account_info(),
      to: self.owner.to_account_info(),
    };

    let amount = self.vault_manager.amount;
    let cpi_program = self.system_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    system_program::transfer(cpi_ctx, amount)?;

    emit!(WithdrawSolEvent {
      id: id,
      owner: self.owner.key(),
      vault_manager: self.vault_manager.key(),  
      vault_treasury: self.vault_treasury.key(),
      timestamp: Clock::get()?.unix_timestamp,
      status: VaultStatus::Settled,
      amount: amount,
    });

    msg!(
    "WithdrawSolEvent emitted: id={}, owner={}, amount={}",
    id,
    self.owner.key(),
    amount
    );

    Ok(())
  }
}