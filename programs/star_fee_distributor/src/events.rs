use anchor_lang::prelude::*;

/// Emitted when an honorary LP position is successfully initialized
#[event]
pub struct HonoraryPositionInitialized {
    pub position: Pubkey,
    pub quote_mint: Pubkey,
    pub pool: Pubkey,
    pub vault: Pubkey,
    pub investor_fee_share_bps: u16,
    pub daily_cap: u64,
    pub min_payout_lamports: u64,
    pub y0: u64,
    pub timestamp: i64,
}

/// Emitted when quote fees are claimed from the honorary position
#[event]
pub struct QuoteFeesClaimed {
    pub amount: u64,
    pub position: Pubkey,
    pub day: i64,
    pub timestamp: i64,
}

/// Emitted for each page of investor payouts during distribution
#[event]
pub struct InvestorPayoutPage {
    pub day: i64,
    pub page: u64,
    pub distributed: u64,
    pub carry_over: u64,
    pub investors_processed: u64,
    pub locked_total: u64,
    pub eligible_share_bps: u16,
    pub timestamp: i64,
}

/// Emitted when the final page of a day's distribution is completed
#[event]
pub struct CreatorPayoutDayClosed {
    pub day: i64,
    pub remainder: u64,
    pub total_distributed_to_investors: u64,
    pub total_claimed: u64,
    pub creator: Pubkey,
    pub timestamp: i64,
}

/// Emitted when distribution fails due to base fee detection
#[event]
pub struct DistributionAborted {
    pub reason: String,
    pub day: i64,
    pub base_fee_amount: u64,
    pub timestamp: i64,
}

/// Emitted when an investor receives a payout
#[event]
pub struct InvestorPayout {
    pub investor: Pubkey,
    pub amount: u64,
    pub locked_amount: u64,
    pub weight: u64,
    pub day: i64,
    pub page: u64,
    pub timestamp: i64,
}

/// Emitted when daily cap is applied to limit payouts
#[event]
pub struct DailyCapApplied {
    pub day: i64,
    pub requested_payout: u64,
    pub capped_payout: u64,
    pub cap_amount: u64,
    pub timestamp: i64,
}
