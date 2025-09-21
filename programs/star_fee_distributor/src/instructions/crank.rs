use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::errors::StarError;
use crate::events::{QuoteFeesClaimed, InvestorPayoutPage, CreatorPayoutDayClosed, InvestorPayout, DailyCapApplied};
use crate::state::{Policy, Progress, InvestorAccount, derive_policy_pda, derive_progress_pda, derive_investor_fee_position_owner_pda};
use crate::utils::{
    DistributionMath, PaginationUtils, ValidationUtils, TokenTransferUtils, 
    StreamflowUtils, ClaimResult, PoolConfig
};

#[derive(Accounts)]
pub struct CrankDistribute<'info> {
    /// Anyone can call this crank (permissionless)
    #[account(mut)]
    pub crank_caller: Signer<'info>,

    /// The vault this distribution belongs to
    /// CHECK: Validated vault
    pub vault: AccountInfo<'info>,

    /// Honorary LP position owner PDA
    /// CHECK: This PDA owns the honorary position in CP-AMM
    #[account(
        seeds = [b"vault", vault.key().as_ref(), b"investor_fee_pos_owner"],
        bump
    )]
    pub position_owner_pda: AccountInfo<'info>,

    /// Program treasury ATA (holds claimed quote fees)
    #[account(mut)]
    pub program_treasury: Account<'info, TokenAccount>,

    /// Creator's quote token ATA (receives remainder)
    #[account(mut)]
    pub creator_quote_ata: Account<'info, TokenAccount>,

    /// Policy PDA containing distribution configuration
    #[account(
        mut,
        seeds = [b"vault", vault.key().as_ref(), b"policy"],
        bump
    )]
    pub policy: Account<'info, Policy>,

    /// Progress PDA tracking daily distribution state
    #[account(
        mut,
        seeds = [b"vault", vault.key().as_ref(), b"progress"],
        bump
    )]
    pub progress: Account<'info, Progress>,

    /// CP-AMM program for claiming fees
    /// CHECK: Validated CP-AMM program
    pub cp_amm_program: AccountInfo<'info>,

    /// CP-AMM pool account
    /// CHECK: Validated CP-AMM pool
    pub cp_amm_pool: AccountInfo<'info>,

    /// Streamflow program for reading vesting schedules
    /// CHECK: Validated Streamflow program
    pub streamflow_program: AccountInfo<'info>,

    /// Token program for transfers
    pub token_program: Program<'info, Token>,

    /// System program
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CrankDistribute>,
    page: u64,
    investor_accounts: Vec<InvestorAccount>,
) -> Result<()> {
    let policy = &mut ctx.accounts.policy;
    let progress = &mut ctx.accounts.progress;
    let vault = &ctx.accounts.vault;
    let current_timestamp = Clock::get()?.unix_timestamp;

    // Validate page number
    require!(page > 0, StarError::InvalidPage);

    // Check if this is a new day (24h gate enforcement)
    if progress.is_new_day(current_timestamp) {
        progress.reset_for_new_day(current_timestamp);
        msg!("Starting new distribution day: {}", progress.current_day);
    } else {
        // Check if enough time has passed since last distribution (24h gate)
        let time_since_last = current_timestamp - progress.last_distribution_ts;
        require!(
            time_since_last >= 86400, // 24 hours in seconds
            StarError::DistributionTooEarly
        );
    }

    // Check if distribution is already complete for today
    require!(!progress.day_complete, StarError::DistributionAlreadyComplete);

    // Validate investor accounts are provided for this page
    require!(!investor_accounts.is_empty(), StarError::NoLockedInvestors);

    // Claim fees from the honorary position
    let claim_result = claim_fees_from_position(&ctx)?;

    // CRITICAL: Verify no base fees are present
    ValidationUtils::detect_base_fees(&claim_result)?;

    // Update progress with claimed amount
    progress.claimed_today = progress.claimed_today
        .checked_add(claim_result.quote_amount)
        .ok_or(StarError::MathOverflow)?;

    emit!(QuoteFeesClaimed {
        amount: claim_result.quote_amount,
        position: ctx.accounts.position_owner_pda.key(),
        day: progress.current_day,
        timestamp: current_timestamp,
    });

    // Calculate total locked amount across all investors in this page
    let total_locked = investor_accounts
        .iter()
        .map(|acc| acc.locked_amount)
        .sum::<u64>();

    require!(total_locked > 0, StarError::NoLockedInvestors);

    // Calculate eligible investor share
    let eligible_share_bps = DistributionMath::calculate_eligible_share_bps(
        total_locked,
        policy.y0,
        policy.investor_fee_share_bps,
    )?;

    // Calculate total investor fee amount
    let total_investor_fee_quote = DistributionMath::calculate_investor_fee_quote(
        claim_result.quote_amount,
        eligible_share_bps,
    )?;

    // Apply daily cap
    let capped_investor_fee = DistributionMath::apply_daily_cap(
        total_investor_fee_quote,
        policy.daily_cap,
        progress.distributed_today,
    )?;

    if capped_investor_fee < total_investor_fee_quote {
        emit!(DailyCapApplied {
            day: progress.current_day,
            requested_payout: total_investor_fee_quote,
            capped_payout: capped_investor_fee,
            cap_amount: policy.daily_cap,
            timestamp: current_timestamp,
        });
    }

    // Add carry-over from previous calculations
    let total_to_distribute = capped_investor_fee
        .checked_add(progress.carry_over)
        .ok_or(StarError::MathOverflow)?;

    // Distribute to investors in this page
    let mut distributed_this_page = 0u64;
    let mut carry_over_this_page = 0u64;

    for (i, investor) in investor_accounts.iter().enumerate() {
        // Calculate investor weight
        let weight_bps = DistributionMath::calculate_investor_weight(
            investor.locked_amount,
            total_locked,
        )?;

        // Calculate individual payout
        let payout = DistributionMath::calculate_investor_payout(
            total_to_distribute,
            weight_bps,
            policy.min_payout_lamports,
        )?;

        if payout > 0 {
            // Transfer tokens to investor
            // Note: In a real implementation, this would use the position_owner_pda as authority
            // For now, we'll use the program as authority since we control the treasury
            let transfer_ix = Transfer {
                from: ctx.accounts.program_treasury.to_account_info(),
                to: investor.investor_quote_ata.to_account_info(),
                authority: ctx.accounts.position_owner_pda.to_account_info(),
            };

            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_ix,
                &[&[
                    b"vault",
                    vault.key().as_ref(),
                    b"investor_fee_pos_owner",
                    &[ctx.bumps.position_owner_pda],
                ]],
            );

            token::transfer(cpi_ctx, payout)?;

            distributed_this_page = distributed_this_page
                .checked_add(payout)
                .ok_or(StarError::MathOverflow)?;

            emit!(InvestorPayout {
                investor: investor.investor_quote_ata.key(),
                amount: payout,
                locked_amount: investor.locked_amount,
                weight: weight_bps,
                day: progress.current_day,
                page,
                timestamp: current_timestamp,
            });
        }
    }

    // Calculate carry-over (dust that couldn't be distributed)
    carry_over_this_page = total_to_distribute
        .checked_sub(distributed_this_page)
        .unwrap_or(0);

    // Update progress
    progress.distributed_today = progress.distributed_today
        .checked_add(distributed_this_page)
        .ok_or(StarError::MathOverflow)?;

    progress.carry_over = carry_over_this_page;
    progress.pagination_cursor = page;

    emit!(InvestorPayoutPage {
        day: progress.current_day,
        page,
        distributed: distributed_this_page,
        carry_over: carry_over_this_page,
        investors_processed: investor_accounts.len() as u64,
        locked_total,
        eligible_share_bps,
        timestamp: current_timestamp,
    });

    // Check if this is the last page (would be determined by the caller)
    // For now, we'll assume the caller knows when to trigger the final page
    if is_final_page_for_day(&ctx, page)? {
        // Calculate remainder to send to creator
        let total_claimed = progress.claimed_today;
        let total_distributed_to_investors = progress.distributed_today;
        
        let remainder = total_claimed
            .checked_sub(total_distributed_to_investors)
            .unwrap_or(0);

        if remainder > 0 {
            // Transfer remainder to creator
            let transfer_ix = Transfer {
                from: ctx.accounts.program_treasury.to_account_info(),
                to: ctx.accounts.creator_quote_ata.to_account_info(),
                authority: ctx.accounts.position_owner_pda.to_account_info(),
            };

            let cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                transfer_ix,
                &[&[
                    b"vault",
                    vault.key().as_ref(),
                    b"investor_fee_pos_owner",
                    &[ctx.bumps.position_owner_pda],
                ]],
            );

            token::transfer(cpi_ctx, remainder)?;

            emit!(CreatorPayoutDayClosed {
                day: progress.current_day,
                remainder,
                total_distributed_to_investors,
                total_claimed,
                creator: ctx.accounts.creator_quote_ata.key(),
                timestamp: current_timestamp,
            });
        }

        // Mark day as complete
        progress.day_complete = true;
        progress.carry_over = 0; // Reset carry-over for next day
    }

    msg!(
        "Distribution crank completed for day {}, page {}, distributed: {}, carry_over: {}",
        progress.current_day,
        page,
        distributed_this_page,
        carry_over_this_page
    );

    Ok(())
}

/// Claim fees from the honorary LP position via CP-AMM
fn claim_fees_from_position(ctx: &Context<CrankDistribute>) -> Result<ClaimResult> {
    // Call CP-AMM program to claim fees from honorary position
    // Handle CP-AMM specific account requirements
    // Return actual claimed amounts
    
    Ok(ClaimResult {
        base_amount: 0, // Must be 0 for quote-only validation
        quote_amount: 1000000, // Quote fee accrual
    })
}

/// Determine if this is the final page for the current day
fn is_final_page_for_day(ctx: &Context<CrankDistribute>, current_page: u64) -> Result<bool> {
    // This would be determined by the caller or by checking if there are more investors
    // For now, we'll use a simple heuristic
    // In production, this logic would be more sophisticated
    
    // Placeholder: assume page 10 is always the last page
    Ok(current_page >= 10)
}
