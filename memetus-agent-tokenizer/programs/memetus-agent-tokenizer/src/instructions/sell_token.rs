use anchor_lang::prelude::*;
use anchor_spl::token::Token;
use raydium_amm_cpi::SwapBaseOut;

use crate::events::SellTokenEvent;

#[derive(Accounts, Clone)]

pub struct SellToken<'info> {
    /// CHECK: Safe
    pub amm_program: AccountInfo<'info>,
    /// CHECK: Safe. amm Account
    #[account(mut)]
    pub amm: UncheckedAccount<'info>,
    /// CHECK: Safe. Amm authority Account
    #[account()]
    pub amm_authority: UncheckedAccount<'info>,
    /// CHECK: Safe. amm open_orders Account
    #[account(mut)]
    pub amm_open_orders: UncheckedAccount<'info>,
    /// CHECK: Safe. amm_coin_vault Amm Account to swap FROM or To,
    #[account(mut)]
    pub amm_coin_vault: UncheckedAccount<'info>,
    /// CHECK: Safe. amm_pc_vault Amm Account to swap FROM or To,
    #[account(mut)]
    pub amm_pc_vault: UncheckedAccount<'info>,
    /// CHECK: Safe. OpenBook program id
    pub market_program: UncheckedAccount<'info>,
    /// CHECK: Safe. OpenBook market Account. OpenBook program is the owner.
    #[account(mut)]
    pub market: UncheckedAccount<'info>,
    /// CHECK: Safe. bids Account
    #[account(mut)]
    pub market_bids: UncheckedAccount<'info>,
    /// CHECK: Safe. asks Account
    #[account(mut)]
    pub market_asks: UncheckedAccount<'info>,
    /// CHECK: Safe. event_q Account
    #[account(mut)]
    pub market_event_queue: UncheckedAccount<'info>,
    /// CHECK: Safe. coin_vault Account
    #[account(mut)]
    pub market_coin_vault: UncheckedAccount<'info>,
    /// CHECK: Safe. pc_vault Account
    #[account(mut)]
    pub market_pc_vault: UncheckedAccount<'info>,
    /// CHECK: Safe. vault_signer Account
    #[account(mut)]
    pub market_vault_signer: UncheckedAccount<'info>,
    /// CHECK: Safe. user source token Account. user Account to swap from.
    #[account(mut)]
    pub user_token_source: UncheckedAccount<'info>,
    /// CHECK: Safe. user destination token Account. user Account to swap to.
    #[account(mut)]
    pub user_token_destination: UncheckedAccount<'info>,
    /// CHECK: Safe. user owner Account
    #[account(mut)]
    pub user_source_owner: Signer<'info>,
    /// CHECK: Safe. The spl token program
    pub token_program: Program<'info, Token>,
}

impl<'a, 'b, 'c, 'info> From<&mut SellToken<'info>>
    for CpiContext<'a, 'b, 'c, 'info, SwapBaseOut<'info>>
{
    fn from(
        accounts: &mut SellToken<'info>,
    ) -> CpiContext<'a, 'b, 'c, 'info, SwapBaseOut<'info>> {
        let cpi_accounts = SwapBaseOut {
            amm: accounts.amm.clone(),
            amm_authority: accounts.amm_authority.clone(),
            amm_open_orders: accounts.amm_open_orders.clone(),
            amm_coin_vault: accounts.amm_coin_vault.clone(),
            amm_pc_vault: accounts.amm_pc_vault.clone(),
            market_program: accounts.market_program.clone(),
            market: accounts.market.clone(),
            market_bids: accounts.market_bids.clone(),
            market_asks: accounts.market_asks.clone(),
            market_event_queue: accounts.market_event_queue.clone(),
            market_coin_vault: accounts.market_coin_vault.clone(),
            market_pc_vault: accounts.market_pc_vault.clone(),
            market_vault_signer: accounts.market_vault_signer.clone(),
            user_token_source: accounts.user_token_source.clone(),
            user_token_destination: accounts.user_token_destination.clone(),
            user_source_owner: accounts.user_source_owner.clone(),
            token_program: accounts.token_program.clone(),
        };
        let cpi_program = accounts.amm_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}


pub fn sell_token(
    ctx: Context<SellToken>,
    max_amount_in: u64,
    amount_out: u64,
) -> Result<()> {
    emit!(SellTokenEvent {
      owner: ctx.accounts.user_source_owner.key(),
      src_mint: ctx.accounts.user_token_source.key(),
      dst_mint: ctx.accounts.user_token_destination.key(),
      amount: amount_out,
      timestamp: Clock::get()?.unix_timestamp,
    });

    msg!(
        "SellTokenEvent emitted: owner={}, src_mint={}, dst_mint={}, amount={}, timestamp={}",
        ctx.accounts.user_source_owner.key(),
        ctx.accounts.user_token_source.key(),
        ctx.accounts.user_token_destination.key(),
        amount_out,
        Clock::get()?.unix_timestamp
    );

    raydium_amm_cpi::swap_base_out(ctx.accounts.into(), max_amount_in, amount_out)
}
