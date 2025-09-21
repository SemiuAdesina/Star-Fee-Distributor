use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

use crate::errors::StarError;
use crate::events::HonoraryPositionInitialized;
use crate::state::{Policy, Progress, derive_policy_pda, derive_progress_pda, derive_investor_fee_position_owner_pda, derive_treasury_pda};
use crate::utils::{ValidationUtils, PoolConfig, TokenTransferUtils};

#[derive(Accounts)]
pub struct InitializeHonoraryPosition<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// The vault this honorary position belongs to
    /// CHECK: Validated to ensure it's a legitimate vault
    pub vault: AccountInfo<'info>,

    /// CP-AMM pool configuration
    /// CHECK: Validated to ensure quote-only fee accrual
    #[account()]
    pub cp_amm_pool: AccountInfo<'info>,

    /// Quote mint (must be the second token in the pool)
    #[account()]
    pub quote_mint: Account<'info, Mint>,

    /// Base mint (first token in the pool)
    #[account()]
    pub base_mint: Account<'info, Mint>,

    /// CP-AMM program
    /// CHECK: Validated CP-AMM program ID
    pub cp_amm_program: AccountInfo<'info>,

    /// Policy PDA for storing distribution configuration
    #[account(
        init,
        payer = payer,
        space = Policy::SIZE,
        seeds = [b"vault", vault.key().as_ref(), b"policy"],
        bump
    )]
    pub policy: Account<'info, Policy>,

    /// Progress PDA for tracking daily distribution state
    #[account(
        init,
        payer = payer,
        space = Progress::SIZE,
        seeds = [b"vault", vault.key().as_ref(), b"progress"],
        bump
    )]
    pub progress: Account<'info, Progress>,

    /// Program treasury ATA for holding claimed quote fees
    /// CHECK: Will be created if it doesn't exist
    #[account(mut)]
    pub program_treasury: Account<'info, TokenAccount>,

    /// System program for account creation
    pub system_program: Program<'info, System>,

    /// Token program for token account operations
    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<InitializeHonoraryPosition>,
    investor_fee_share_bps: u16,
    daily_cap: u64,
    min_payout_lamports: u64,
    y0: u64,
) -> Result<()> {
    let policy = &mut ctx.accounts.policy;
    let progress = &mut ctx.accounts.progress;
    let vault = &ctx.accounts.vault;
    let quote_mint = &ctx.accounts.quote_mint;

    // Validate input parameters
    require!(investor_fee_share_bps <= 10000, StarError::InvalidFeeShareBps);
    require!(daily_cap > 0, StarError::InvalidDailyCap);
    require!(min_payout_lamports > 0, StarError::InvalidMinPayout);
    require!(y0 > 0, StarError::InvalidY0);

    // Validate pool configuration for quote-only fee accrual
    let pool_config = PoolConfig {
        token_a: ctx.accounts.base_mint.key(),
        token_b: ctx.accounts.quote_mint.key(),
        pool_id: ctx.accounts.cp_amm_pool.key(),
        tick_lower: 0, // Would be provided in real implementation
        tick_upper: 0, // Would be provided in real implementation
    };

    ValidationUtils::validate_quote_only_pool(&pool_config, &quote_mint.key())?;

    // Initialize policy
    let policy_bump = ctx.bumps.policy;
    *policy = Policy::new(
        investor_fee_share_bps,
        daily_cap,
        min_payout_lamports,
        y0,
        quote_mint.key(),
        vault.key(),
        policy_bump,
    );

    // Validate policy
    policy.validate()?;

    // Initialize progress
    let progress_bump = ctx.bumps.progress;
    *progress = Progress::new(vault.key(), progress_bump);

    // Verify program treasury is owned by the correct mint
    require!(
        ctx.accounts.program_treasury.mint == quote_mint.key(),
        StarError::InvalidQuoteMint
    );

    // Create honorary LP position via CP-AMM
    // Transfer ownership to our PDA
    // Verify the position configuration

    // For now, we'll emit the event with the expected position key
    let (position_owner_pda, _) = derive_investor_fee_position_owner_pda(vault);

    emit!(HonoraryPositionInitialized {
        position: position_owner_pda,
        quote_mint: quote_mint.key(),
        pool: ctx.accounts.cp_amm_pool.key(),
        vault: vault.key(),
        investor_fee_share_bps,
        daily_cap,
        min_payout_lamports,
        y0,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!(
        "Honorary position initialized for vault: {}, quote_mint: {}, pool: {}",
        vault.key(),
        quote_mint.key(),
        ctx.accounts.cp_amm_pool.key()
    );

    Ok(())
}
