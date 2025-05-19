use anchor_lang::error_code;

#[error_code]


pub enum UpdateOwnerError {
  #[msg("The given pubkey is already the owner")]
  OwnerAlreadySet,

  #[msg("The signer is not the owner")]
  Unauthorized
}