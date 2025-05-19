use anchor_lang::prelude::*;

mod states;
mod events;
mod errors;

use instructions::*;

pub mod instructions;

use crate::states::{CreateInitializeMintArgs, VaultStatus};

declare_id!("C1Knh3YFfMwr2LLaoT9JXcVZHHH52YSm8gBNyCinGABg");

#[program]
pub mod memetus_agent_tokenizer {

    use super::*;

    pub fn initialize_factory(
        ctx: Context<InitializeFactory>
    ) -> Result<()> {
        let _ = ctx.accounts.initialize_factory(&ctx.bumps);
        Ok(())
    }

    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        target_amount: u64,
        metadata: CreateInitializeMintArgs,
    ) -> Result<()> {
        let _ = ctx.accounts.initialize_vault(target_amount, metadata, &ctx.bumps)?;
        Ok(())
    }

    pub fn initialize_vault_with_deposit(
        ctx: Context<InitializeVaultWithDeposit>,
        amount: u64,
        target_amount: u64,
        metadata: CreateInitializeMintArgs,
    ) -> Result<()> {
        let _ = ctx.accounts.initialize_vault_with_deposit(amount, target_amount, metadata, &ctx.bumps)?;
        Ok(())
    }

    pub fn update_owner(
        ctx: Context<UpdateOwner>,
        new_owner: Pubkey,
    ) -> Result<()> {
        let _ = ctx.accounts.update_owner(new_owner)?;
        Ok(())
    }

    pub fn withdraw_sol(
        ctx: Context<WithdrawSol>,
        id: u64,
    ) -> Result<()> {
        let _ = ctx.accounts.withdraw_sol(id)?;
        Ok(())
    }

    pub fn deposit_sol(ctx: Context<DepositSol>, id: u64, amount: u64) -> Result<()> {
        let _ = ctx.accounts.deposit_sol(id, amount)?;
        Ok(())
    }

    pub fn buy_token(ctx: Context<BuyToken>, amount_in: u64, minimum_amount_out: u64) -> Result<()> {
        let _ = instructions::buy_token(ctx, amount_in, minimum_amount_out);
        Ok(())
    }

    pub fn sell_token(ctx: Context<SellToken>, amount_out: u64, maximum_amount_oin: u64) -> Result<()> {
        let _ = instructions::sell_token(ctx, amount_out, maximum_amount_oin);
        Ok(())
    }

    pub fn set_vault_status(ctx: Context<SetVaultStatus>, status: VaultStatus) -> Result<()> {
        let _ = ctx.accounts.set_vault_state(status)?;
        Ok(())
    }

    pub fn transfer_token(ctx: Context<TransferToken>, amount: u64) -> Result<()> {
        let _ = ctx.accounts.transfer_token(amount)?;
        Ok(())
    }

    pub fn claim_token(ctx: Context<ClaimSol>, amount: u64) -> Result<()> {
        let _ = ctx.accounts.claim_sol(amount)?;
        Ok(())
    }
}