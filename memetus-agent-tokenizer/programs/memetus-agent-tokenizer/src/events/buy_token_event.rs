use anchor_lang::prelude::*;

#[event]
pub struct BuyTokenEvent {
    pub owner: Pubkey,
    pub src_mint: Pubkey,
    pub dst_mint: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}