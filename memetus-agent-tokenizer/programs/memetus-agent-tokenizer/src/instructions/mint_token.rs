use anchor_lang::prelude::*;
use anchor_spl::{
  associated_token::AssociatedToken, 
  token::{self, mint_to, Mint, MintTo, SetAuthority, Token, TokenAccount}
};

use crate::{events::MintTokenEvent, states::ProgramState};


#[derive(Accounts)]

pub struct MintToken<'info> {
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
    associated_token::mint = mint,
    associated_token::authority = authority,
  )]
  pub destination: Account<'info, TokenAccount>,

  pub rent: Sysvar<'info, Rent>,

  pub system_program: Program<'info, System>,
  
  pub token_program: Program<'info, Token>,
  
  pub program_state: Account<'info, ProgramState>,
 
  pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> MintToken<'info> {
  pub fn mint_token(
    &mut self,
    amount: u64
  ) -> Result<()> {
    let mint_ctx = CpiContext::new(
      self.token_program.to_account_info(),
      MintTo {
          authority: self.mint.to_account_info(),
          to: self.destination.to_account_info(),
          mint: self.mint.to_account_info(),
      }
    );

    mint_to(mint_ctx, amount)?;

    let cpi_accounts = SetAuthority {
      current_authority: self.owner.to_account_info(),
      account_or_mint: self.mint.to_account_info(),
    };

    let authority_ctx = CpiContext::new(self.token_program.to_account_info(), cpi_accounts);

    token::set_authority(
      authority_ctx, 
      token::spl_token::instruction::AuthorityType::MintTokens,
      None);

    let cpi_accounts = SetAuthority {
      current_authority: self.owner.to_account_info(),
      account_or_mint: self.mint.to_account_info(),
    };


    let authority_ctx = CpiContext::new(self.token_program.to_account_info(), cpi_accounts);
    token::set_authority(
      authority_ctx, 
      token::spl_token::instruction::AuthorityType::FreezeAccount,
    None);

    // self.mint.freeze_authority = None.into();
    // self.mint.mint_authority = None.into();
    
    emit!(MintTokenEvent {
      mint: self.mint.key(),
      owner: self.owner.key(),
      amount,
      timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("MintTokenEvent emitted: owner={} mint={} amount={}", 
      self.owner.key(), 
      self.mint.key(), 
      amount
    );

    Ok(())
  }
}