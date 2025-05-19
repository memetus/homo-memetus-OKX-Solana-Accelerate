use anchor_lang::error_code;

#[error_code]

pub enum InitializeVaultError {
    #[msg("The target amount is zero")]
    TargetAmountZero,
}