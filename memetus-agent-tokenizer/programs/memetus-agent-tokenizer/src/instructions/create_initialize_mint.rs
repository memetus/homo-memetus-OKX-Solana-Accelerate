use anchor_lang::prelude::*;
use anchor_spl::{
    token::{Mint, Token},
    metadata::{
        create_metadata_accounts_v3,
        mpl_token_metadata::types::DataV2,
        CreateMetadataAccountsV3, 
        Metadata as Metaplex,
    },
};

use crate::{events::CreateInitializeMintEvent, states::{ProgramState, VaultState}};
use crate::states::metadata_state::CreateInitializeMintArgs;

#[derive(Accounts)]
#[instruction(params: CreateInitializeMintArgs)]

pub struct CreateInitializeMint<'info> {
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

  /// CHECK: This is used as raw account info for mint metadata; validation is handled manually
  #[account(mut)]
  pub metadata: UncheckedAccount<'info>,

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

  pub program_state: Account<'info, ProgramState>,

  pub token_program: Program<'info, Token>,

  pub rent: Sysvar<'info, Rent>,

  pub system_program: Program<'info, System>,

  pub token_metadata_program: Program<'info, Metaplex>,
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct CreateV1Args {
  pub name: String,
  pub symbol: String,
  pub uri: String,
}

impl<'info> CreateInitializeMint<'info> {
  pub fn create_initialize_mint(
    &mut self,
    metadata: CreateInitializeMintArgs
  ) -> Result<()> {
    let token_data: DataV2 = DataV2 {
      name: metadata.name.clone(),
      symbol: metadata.symbol.clone(),
      uri: metadata.uri.clone(),
      seller_fee_basis_points: 0,
      creators: None,
      collection: None,
      uses: None,
    };

    let metadata_ctx = CpiContext::new(
      self.token_metadata_program.to_account_info(),
      CreateMetadataAccountsV3 {
        payer: self.owner.to_account_info(),
        update_authority: self.authority.to_account_info(),
        mint: self.mint.to_account_info(),
        metadata: self.metadata.to_account_info(),
        mint_authority: self.authority.to_account_info(),
        system_program: self.system_program.to_account_info(),
        rent: self.rent.to_account_info(),
      },
    );

    create_metadata_accounts_v3(
      metadata_ctx,
      token_data,
      false,
      true,
      None,
    )?;

    emit!(CreateInitializeMintEvent {
      name: metadata.name.clone(),
      symbol: metadata.symbol.clone(),
      uri: metadata.uri.clone(),
      decimals: metadata.decimals,
      owner: self.owner.key(),
      authority: self.authority.key(),
      mint: self.mint.key(),
      metadata: self.metadata.key(),
    });
    let vault_manager = &mut self.vault_manager;

    vault_manager.mint = self.mint.key();

    msg!("CreateInitializeMintEvent emitted: name={}, symbol={}, uri={}, decimals={}, owner={}, authority={}, mint={}, metadata={}", 
      metadata.name,
      metadata.symbol,
      metadata.uri,
      metadata.decimals,
      self.owner.key(),
      self.authority.key(),
      self.mint.key(),
      self.metadata.key(),
    );

    Ok(())
  }


}
