use anchor_lang::{AnchorDeserialize, AnchorSerialize};

#[derive(AnchorDeserialize, AnchorSerialize, Debug, Clone)]

pub struct CreateInitializeMintArgs {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub decimals: u8,
}