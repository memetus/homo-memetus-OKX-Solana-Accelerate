use anchor_lang::error_code;

#[error_code]

pub enum SetVaultStatusError {
    #[msg("The vault is not active")]
    VaultNotActive,
    #[msg("The vault is already initialized")]
    VaultAlreadyInitialized,
    #[msg("The vault is not empty")]
    VaultAlreadyEmpty,
    #[msg("The vault is already settled")]
    VaultAlreadySettled,
    #[msg("The owner is invalid")]
    InvalidOwner,
}