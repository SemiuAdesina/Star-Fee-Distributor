use anchor_lang::prelude::*;

#[error_code]
pub enum StarError {
    #[msg("Base-denominated fees detected, aborting distribution.")]
    BaseFeeDetected,
    
    #[msg("Distribution crank called too early. Must wait 24 hours.")]
    DistributionTooEarly,
    
    #[msg("No locked investors found at this time.")]
    NoLockedInvestors,
    
    #[msg("Invalid pool configuration: cannot guarantee quote-only fee accrual.")]
    InvalidQuoteOnlyConfig,
    
    #[msg("Invalid pool token order. Quote mint must be the second token in the pool.")]
    InvalidPoolTokenOrder,
    
    #[msg("Investor fee share basis points cannot exceed 10000 (100%).")]
    InvalidFeeShareBps,
    
    #[msg("Daily cap must be greater than zero.")]
    InvalidDailyCap,
    
    #[msg("Minimum payout must be greater than zero.")]
    InvalidMinPayout,
    
    #[msg("Y0 (total allocation) must be greater than zero.")]
    InvalidY0,
    
    #[msg("Pagination page must be greater than zero.")]
    InvalidPage,
    
    #[msg("Invalid CP-AMM pool configuration provided.")]
    InvalidCpAmmConfig,
    
    #[msg("Failed to create token account.")]
    TokenAccountCreationFailed,
    
    #[msg("Insufficient quote fees to distribute.")]
    InsufficientQuoteFees,
    
    #[msg("Streamflow stream account is invalid or not found.")]
    InvalidStreamAccount,
    
    #[msg("Investor ATA account is invalid or not found.")]
    InvalidInvestorAta,
    
    #[msg("Creator ATA account is invalid or not found.")]
    InvalidCreatorAta,
    
    #[msg("Program treasury ATA account is invalid or not found.")]
    InvalidTreasuryAta,
    
    #[msg("Math overflow occurred during fee distribution calculation.")]
    MathOverflow,
    
    #[msg("PDA bump seed is invalid.")]
    InvalidBump,
    
    #[msg("Account ownership verification failed.")]
    InvalidOwner,
    
    #[msg("Account is not initialized.")]
    NotInitialized,
    
    #[msg("Account is already initialized.")]
    AlreadyInitialized,
    
    #[msg("Invalid mint for the expected quote token.")]
    InvalidQuoteMint,
    
    #[msg("CP-AMM position claim failed.")]
    CpAmmClaimFailed,
    
    #[msg("Token transfer failed.")]
    TokenTransferFailed,
    
    #[msg("Distribution is already complete for this day.")]
    DistributionAlreadyComplete,
}
