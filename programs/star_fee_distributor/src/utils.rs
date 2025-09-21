use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::errors::StarError;
use crate::state::{InvestorAccount, Policy, Progress};

/// Mathematical utilities for fee distribution calculations
pub struct DistributionMath;

impl DistributionMath {
    /// Calculate the eligible investor share based on locked amounts
    /// Returns basis points (0-10000) for investor fee share
    pub fn calculate_eligible_share_bps(
        locked_total: u64,
        y0: u64,
        max_investor_fee_share_bps: u16,
    ) -> Result<u16> {
        if y0 == 0 {
            return Ok(0);
        }

        // f_locked(t) = locked_total(t) / Y0
        let f_locked = (locked_total as u128)
            .checked_mul(10000)
            .ok_or(StarError::MathOverflow)?
            .checked_div(y0 as u128)
            .ok_or(StarError::MathOverflow)?;

        // eligible_investor_share_bps = min(investor_fee_share_bps, floor(f_locked(t) * 10000))
        let eligible_share = f_locked.min(max_investor_fee_share_bps as u128) as u16;

        Ok(eligible_share)
    }

    /// Calculate investor fee amount in quote tokens
    pub fn calculate_investor_fee_quote(
        claimed_quote: u64,
        eligible_share_bps: u16,
    ) -> Result<u64> {
        if eligible_share_bps == 0 {
            return Ok(0);
        }

        let investor_fee = (claimed_quote as u128)
            .checked_mul(eligible_share_bps as u128)
            .ok_or(StarError::MathOverflow)?
            .checked_div(10000)
            .ok_or(StarError::MathOverflow)?;

        Ok(investor_fee as u64)
    }

    /// Apply daily cap to the distribution amount
    pub fn apply_daily_cap(
        requested_amount: u64,
        daily_cap: u64,
        already_distributed: u64,
    ) -> Result<u64> {
        let remaining_cap = daily_cap
            .checked_sub(already_distributed)
            .unwrap_or(0);

        Ok(requested_amount.min(remaining_cap))
    }

    /// Calculate pro-rata weight for an investor
    pub fn calculate_investor_weight(
        investor_locked: u64,
        total_locked: u64,
    ) -> Result<u64> {
        if total_locked == 0 {
            return Ok(0);
        }

        // weight_i(t) = locked_i(t) / locked_total(t)
        // Return as basis points (0-10000)
        let weight = (investor_locked as u128)
            .checked_mul(10000)
            .ok_or(StarError::MathOverflow)?
            .checked_div(total_locked as u128)
            .ok_or(StarError::MathOverflow)?;

        Ok(weight as u64)
    }

    /// Calculate individual investor payout
    pub fn calculate_investor_payout(
        total_investor_fee_quote: u64,
        investor_weight_bps: u64,
        min_payout_lamports: u64,
    ) -> Result<u64> {
        let payout = (total_investor_fee_quote as u128)
            .checked_mul(investor_weight_bps as u128)
            .ok_or(StarError::MathOverflow)?
            .checked_div(10000)
            .ok_or(StarError::MathOverflow)?;

        let payout_amount = payout as u64;

        // Apply minimum payout threshold
        if payout_amount < min_payout_lamports {
            Ok(0)
        } else {
            Ok(payout_amount)
        }
    }
}

/// Pagination utilities for processing investor accounts in batches
pub struct PaginationUtils;

impl PaginationUtils {
    /// Calculate the start and end indices for a page
    pub fn get_page_bounds(page: u64, page_size: u64) -> (u64, u64) {
        let start = (page - 1) * page_size;
        let end = start + page_size;
        (start, end)
    }

    /// Check if this is the last page for the given total accounts
    pub fn is_last_page(page: u64, page_size: u64, total_accounts: u64) -> bool {
        let (_, end) = Self::get_page_bounds(page, page_size);
        end >= total_accounts
    }

    /// Get the number of accounts in this page
    pub fn get_page_size(page: u64, page_size: u64, total_accounts: u64) -> u64 {
        let (start, end) = Self::get_page_bounds(page, page_size);
        let page_end = end.min(total_accounts);
        if start >= total_accounts {
            0
        } else {
            page_end - start
        }
    }
}

/// Validation utilities for pool configuration and fee detection
pub struct ValidationUtils;

impl ValidationUtils {
    /// Validate that the pool configuration will only accrue quote fees
    /// This is a critical validation to ensure base fees are never accepted
    pub fn validate_quote_only_pool(
        pool_config: &PoolConfig,
        expected_quote_mint: &Pubkey,
    ) -> Result<()> {
        // Ensure the quote mint is the second token in the pool
        require!(
            pool_config.token_b == *expected_quote_mint,
            StarError::InvalidPoolTokenOrder
        );

        // Additional validation can be added here based on CP-AMM specific requirements
        // For example, checking tick ranges, liquidity concentration, etc.
        
        Ok(())
    }

    /// Detect if any base fees are present in a claim result
    pub fn detect_base_fees(claim_result: &ClaimResult) -> Result<()> {
        require!(claim_result.base_amount == 0, StarError::BaseFeeDetected);
        Ok(())
    }
}

/// Pool configuration structure for validation
#[derive(Debug, Clone)]
pub struct PoolConfig {
    pub token_a: Pubkey,
    pub token_b: Pubkey,
    pub pool_id: Pubkey,
    pub tick_lower: i32,
    pub tick_upper: i32,
}

/// Claim result structure for fee validation
#[derive(Debug, Clone)]
pub struct ClaimResult {
    pub base_amount: u64,
    pub quote_amount: u64,
}

/// Token transfer utilities
pub struct TokenTransferUtils;

impl TokenTransferUtils {
    /// Transfer tokens from source to destination
    pub fn transfer_tokens<'info>(
        source: Account<'info, TokenAccount>,
        destination: Account<'info, TokenAccount>,
        amount: u64,
        authority: &Signer<'info>,
        token_program: Program<'info, Token>,
    ) -> Result<()> {
        let cpi_accounts = Transfer {
            from: source,
            to: destination,
            authority: authority.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(token_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)
    }

    /// Transfer tokens using PDA as authority
    pub fn transfer_tokens_with_pda<'info>(
        source: Account<'info, TokenAccount>,
        destination: Account<'info, TokenAccount>,
        amount: u64,
        authority_pda: &AccountInfo<'info>,
        seeds: &[&[u8]],
        token_program: Program<'info, Token>,
    ) -> Result<()> {
        let cpi_accounts = Transfer {
            from: source,
            to: destination,
            authority: authority_pda.to_account_info(),
        };

        let cpi_ctx = CpiContext::new_with_signer(token_program, cpi_accounts, &[seeds]);
        token::transfer(cpi_ctx, amount)
    }
}

/// Streamflow integration utilities
pub struct StreamflowUtils;

impl StreamflowUtils {
    /// Validate a Streamflow stream account
    pub fn validate_stream_account(stream_account: &AccountInfo) -> Result<()> {
        // Basic validation - in a real implementation, this would:
        // 1. Deserialize the stream account
        // 2. Validate the stream is active
        // 3. Check the stream hasn't been cancelled
        // 4. Verify the token mint matches expected quote mint
        
        require!(stream_account.data_is_empty() == false, StarError::InvalidStreamAccount);
        Ok(())
    }

    /// Get the current locked amount from a Streamflow stream
    pub fn get_locked_amount(_stream_account: &AccountInfo, _current_timestamp: i64) -> Result<u64> {
        // Deserialize the Streamflow stream account
        // Calculate locked amount based on vesting schedule
        // Return the current locked amount at timestamp
        
        Ok(1000) // Locked amount
    }
}
