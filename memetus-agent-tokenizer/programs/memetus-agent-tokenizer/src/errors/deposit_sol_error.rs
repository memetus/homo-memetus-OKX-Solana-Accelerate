use anchor_lang::error_code;

#[error_code]

pub enum DepositSolError {
    #[msg("The vault is not active")]
    VaultNotActive,
    #[msg("The vault is already initialized")]
    VaultAlreadyInitialized,
    #[msg("The vault is not empty")]
    VaultAlreadyEmpty,
}