use anchor_lang::error_code;

#[error_code]

pub enum WithdrawSolError {
    #[msg("The vault is not active")]
    VaultNotActive,
    #[msg("The vault is not initialized")]
    VaultNotInitialized,
}