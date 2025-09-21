use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

/// Policy configuration for fee distribution
#[account]
pub struct Policy {
    /// Maximum basis points (0-10000) for investor fee share
    pub investor_fee_share_bps: u16,
    /// Optional daily maximum payout in lamports
    pub daily_cap: u64,
    /// Minimum payout threshold in lamports (dust filter)
    pub min_payout_lamports: u64,
    /// Total investor allocation minted at TGE (Y0)
    pub y0: u64,
    /// Quote mint for this vault
    pub quote_mint: Pubkey,
    /// Vault this policy belongs to
    pub vault: Pubkey,
    /// Timestamp when policy was created
    pub created_at: i64,
    /// PDA bump seed
    pub bump: u8,
}

/// Daily distribution progress tracking
#[account]
pub struct Progress {
    /// Unix timestamp of last distribution day
    pub last_distribution_ts: i64,
    /// Total amount distributed today (in lamports)
    pub distributed_today: u64,
    /// Undistributed dust carried over from previous calculations
    pub carry_over: u64,
    /// Current pagination cursor for investor accounts
    pub pagination_cursor: u64,
    /// Current day being processed
    pub current_day: i64,
    /// Total amount claimed today from honorary position
    pub claimed_today: u64,
    /// Whether distribution is complete for current day
    pub day_complete: bool,
    /// Vault this progress belongs to
    pub vault: Pubkey,
    /// PDA bump seed
    pub bump: u8,
}

/// Investor account information for distribution
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct InvestorAccount {
    /// Streamflow stream public key
    pub stream_pubkey: Pubkey,
    /// Investor's quote token ATA
    pub investor_quote_ata: Pubkey,
    /// Current locked amount (fetched from Streamflow)
    pub locked_amount: u64,
    /// Investor's weight in this page
    pub weight: u64,
}

/// PDA seeds constants
pub const VAULT_SEED: &[u8] = b"vault";
pub const POLICY_SEED: &[u8] = b"policy";
pub const PROGRESS_SEED: &[u8] = b"progress";
pub const INVESTOR_FEE_POS_OWNER_SEED: &[u8] = b"investor_fee_pos_owner";
pub const TREASURY_SEED: &[u8] = b"treasury";

/// PDA derivation helpers
pub fn derive_policy_pda(vault: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[VAULT_SEED, vault.as_ref(), POLICY_SEED], &crate::ID)
}

pub fn derive_progress_pda(vault: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[VAULT_SEED, vault.as_ref(), PROGRESS_SEED], &crate::ID)
}

pub fn derive_investor_fee_position_owner_pda(vault: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[VAULT_SEED, vault.as_ref(), INVESTOR_FEE_POS_OWNER_SEED],
        &crate::ID,
    )
}

pub fn derive_treasury_pda(vault: &Pubkey, quote_mint: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[VAULT_SEED, vault.as_ref(), TREASURY_SEED, quote_mint.as_ref()],
        &crate::ID,
    )
}

impl Policy {
    pub const SIZE: usize = 8 + // discriminator
        2 + // investor_fee_share_bps
        8 + // daily_cap
        8 + // min_payout_lamports
        8 + // y0
        32 + // quote_mint
        32 + // vault
        8 + // created_at
        1; // bump

    pub fn new(
        investor_fee_share_bps: u16,
        daily_cap: u64,
        min_payout_lamports: u64,
        y0: u64,
        quote_mint: Pubkey,
        vault: Pubkey,
        bump: u8,
    ) -> Self {
        Self {
            investor_fee_share_bps,
            daily_cap,
            min_payout_lamports,
            y0,
            quote_mint,
            vault,
            created_at: Clock::get().unwrap().unix_timestamp,
            bump,
        }
    }

    pub fn validate(&self) -> Result<()> {
        require!(self.investor_fee_share_bps <= 10000, crate::StarError::InvalidFeeShareBps);
        require!(self.daily_cap > 0, crate::StarError::InvalidDailyCap);
        require!(self.min_payout_lamports > 0, crate::StarError::InvalidMinPayout);
        require!(self.y0 > 0, crate::StarError::InvalidY0);
        Ok(())
    }
}

impl Progress {
    pub const SIZE: usize = 8 + // discriminator
        8 + // last_distribution_ts
        8 + // distributed_today
        8 + // carry_over
        8 + // pagination_cursor
        8 + // current_day
        8 + // claimed_today
        1 + // day_complete
        32 + // vault
        1; // bump

    pub fn new(vault: Pubkey, bump: u8) -> Self {
        Self {
            last_distribution_ts: 0,
            distributed_today: 0,
            carry_over: 0,
            pagination_cursor: 0,
            current_day: 0,
            claimed_today: 0,
            day_complete: false,
            vault,
            bump,
        }
    }

    pub fn is_new_day(&self, current_ts: i64) -> bool {
        current_ts >= self.last_distribution_ts + 86400 // 24 hours
    }

    pub fn reset_for_new_day(&mut self, current_ts: i64) {
        self.last_distribution_ts = current_ts;
        self.distributed_today = 0;
        self.claimed_today = 0;
        self.pagination_cursor = 0;
        self.current_day = current_ts / 86400; // Day number
        self.day_complete = false;
        // carry_over persists across days
    }
}
