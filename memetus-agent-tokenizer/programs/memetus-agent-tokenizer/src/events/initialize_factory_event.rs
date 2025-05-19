use anchor_lang::prelude::*;

#[event]

pub struct InitializeFactoryEvent {
    pub owner: Pubkey,
    pub factory: Pubkey,
    pub initialized: bool,
    pub timestamp: i64,
}