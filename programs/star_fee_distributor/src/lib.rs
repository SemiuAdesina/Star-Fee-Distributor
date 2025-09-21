use anchor_lang::prelude::*;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;
pub mod utils;

use instructions::*;

declare_id!("FEEd1str1but0r1111111111111111111111111111");

#[program]
pub mod star_fee_distributor {
    use super::*;

    /// Initialize an honorary DAMM v2 LP position for quote-only fee accrual
    pub fn initialize_honorary_position(
        ctx: Context<InitializeHonoraryPosition>,
        investor_fee_share_bps: u16,
        daily_cap: u64,
        min_payout_lamports: u64,
        y0: u64,
    ) -> Result<()> {
        instructions::initialize::handler(ctx, investor_fee_share_bps, daily_cap, min_payout_lamports, y0)
    }

    /// Permissionless 24h distribution crank for quote fees
    pub fn crank_distribute(
        ctx: Context<CrankDistribute>,
        page: u64,
        investor_accounts: Vec<InvestorAccount>,
    ) -> Result<()> {
        instructions::crank::handler(ctx, page, investor_accounts)
    }
}
