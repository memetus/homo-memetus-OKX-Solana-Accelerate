use anchor_lang::prelude::*;

#[event]

pub struct MintTokenEvent {
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}