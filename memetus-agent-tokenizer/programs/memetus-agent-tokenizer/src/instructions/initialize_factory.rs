use anchor_lang::prelude::*;

use crate::states::program_state::*;
use crate::events::initialize_factory_event::InitializeFactoryEvent;

#[derive(Accounts)]

pub struct InitializeFactory<'info> {
  #[account(mut)]
  pub owner: Signer<'info>,

  #[account(
    init,
    payer = owner,
    space = ProgramState::INIT_SPACE,
    seeds = [b"seed".as_ref(), owner.key().as_ref()],
    bump
  )]
  pub program_state: Box<Account<'info, ProgramState>>,
  pub system_program: Program<'info, System>,
}

impl<'info> InitializeFactory<'info> {
  pub fn initialize_factory(&mut self, bumps: &InitializeFactoryBumps) -> Result<()> {
    self.program_state.set_inner(ProgramState {
      owner: self.owner.key(),
      total: 0,
      bump: bumps.program_state,
      initialized: true,
    });

    emit!(InitializeFactoryEvent {
      owner: self.owner.key(),
      factory: self.program_state.key(),
      initialized: true,
      timestamp: Clock::get()?.unix_timestamp,
    });

    msg!(
    "InitializeFactoryEvent emitted: program_state={}, owner={}",
    self.program_state.key(),
    self.owner.key()
    );

    Ok(())
  }
}