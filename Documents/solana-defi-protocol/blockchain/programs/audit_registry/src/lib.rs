#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("DZejfnpxWTyfX6XziQoCHUJgvksMhVPzDRnY9Gj3FTgt");

/// AuditRegistry program stores immutable metadata proving readiness posture.
#[program]
pub mod audit_registry {
    use super::*;

    /// Initializes the registry PDA for the authority to anchor audit metadata.
    pub fn initialize_registry(ctx: Context<InitializeRegistry>, version: u64) -> Result<()> {
        require!(version > 0, AuditRegistryError::InvalidVersion);
        let registry = &mut ctx.accounts.registry;
        registry.authority = ctx.accounts.authority.key();
        registry.version = version;
        registry.bump = ctx.bumps.registry;
        registry.metadata_uri = String::new();
        registry.metadata_checksum = [0; 32];
        Ok(())
    }

    /// Updates metadata URI and checksum for the registry.
    pub fn update_metadata(ctx: Context<UpdateMetadata>, payload: MetadataInput) -> Result<()> {
        require!(
            payload.uri.len() <= Registry::URI_LIMIT,
            AuditRegistryError::UriTooLong
        );
        let registry = &mut ctx.accounts.registry;
        registry.metadata_uri = payload.uri;
        registry.metadata_checksum = payload.checksum;
        Ok(())
    }
}

/// Accounts required to bootstrap the registry state.
#[derive(Accounts)]
pub struct InitializeRegistry<'info> {
    /// Authority initializing the registry, paying rent.
    #[account(mut)]
    pub authority: Signer<'info>,
    /// Registry PDA derived from authority to avoid collisions.
    #[account(
        init,
        seeds = [b"registry", authority.key().as_ref()],
        bump,
        payer = authority,
        space = Registry::LEN
    )]
    pub registry: Account<'info, Registry>,
    /// System program for CPI.
    pub system_program: Program<'info, System>,
}

/// Accounts required for updating metadata.
#[derive(Accounts)]
pub struct UpdateMetadata<'info> {
    /// Authority updating metadata.
    pub authority: Signer<'info>,
    /// Registry PDA derived from authority to avoid collisions.
    #[account(
        mut,
        seeds = [b"registry", authority.key().as_ref()],
        bump = registry.bump,
        has_one = authority
    )]
    pub registry: Account<'info, Registry>,
}

/// User-supplied metadata payload.
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MetadataInput {
    pub uri: String,
    pub checksum: [u8; 32],
}

/// Registry stores the on-chain audit readiness metadata authority controls.
#[account]
pub struct Registry {
    /// Authority that controls registry configuration updates.
    pub authority: Pubkey,
    /// Semantic version for off-chain consumers.
    pub version: u64,
    /// Bump seed protecting the PDA.
    pub bump: u8,
    /// Metadata URI describing audit artifacts.
    pub metadata_uri: String,
    /// Optional checksum for metadata verification.
    pub metadata_checksum: [u8; 32],
}

impl Registry {
    pub const URI_LIMIT: usize = 200;
    /// Calculates the minimum space for the account.
    pub const LEN: usize = 8 + 32 + 8 + 1 + 4 + Self::URI_LIMIT + 32;
}

/// Custom program errors.
#[error_code]
pub enum AuditRegistryError {
    /// Version zero is invalid; guard ensures monotonic increments.
    #[msg("Version must be greater than zero")]
    InvalidVersion,
    /// Metadata URI is too long.
    #[msg("Metadata URI exceeds limit")]
    UriTooLong,
}
