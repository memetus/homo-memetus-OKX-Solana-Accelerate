use anchor_lang::prelude::*;

#[event]
pub struct UpdateOwnerEvent {
    pub owner: Pubkey,
    pub new_owner: Pubkey,
    pub timestamp: i64,
}