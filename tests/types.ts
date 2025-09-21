// Temporary type definitions for Star Fee Distributor
// These will be replaced by generated types after building the program

import * as anchor from "@coral-xyz/anchor";

export interface InvestorAccount {
  streamPubkey: anchor.web3.PublicKey;
  investorQuoteAta: anchor.web3.PublicKey;
  lockedAmount: anchor.BN;
  weight: anchor.BN;
}

export interface PolicyAccount {
  investorFeeShareBps: anchor.BN;
  dailyCap: anchor.BN;
  minPayoutLamports: anchor.BN;
  y0: anchor.BN;
  quoteMint: anchor.web3.PublicKey;
  vault: anchor.web3.PublicKey;
  createdAt: anchor.BN;
  bump: number;
}

export interface ProgressAccount {
  lastDistributionTs: anchor.BN;
  distributedToday: anchor.BN;
  carryOver: anchor.BN;
  paginationCursor: anchor.BN;
  currentDay: anchor.BN;
  claimedToday: anchor.BN;
  dayComplete: boolean;
  vault: anchor.web3.PublicKey;
  bump: number;
}

export interface StarFeeDistributor {
  methods: {
    initializeHonoraryPosition(
      investorFeeShareBps: anchor.BN,
      dailyCap: anchor.BN,
      minPayoutLamports: anchor.BN,
      y0: anchor.BN
    ): {
      accounts: (accounts: any) => any;
      signers: (signers: any[]) => any;
      rpc: () => Promise<string>;
    };
    crankDistribute(
      page: anchor.BN,
      investorAccounts: InvestorAccount[]
    ): {
      accounts: (accounts: any) => any;
      signers: (signers: any[]) => any;
      rpc: () => Promise<string>;
    };
  };
  account: {
    policy: {
      fetch: (pubkey: anchor.web3.PublicKey) => Promise<PolicyAccount>;
    };
    progress: {
      fetch: (pubkey: anchor.web3.PublicKey) => Promise<ProgressAccount>;
    };
  };
  programId: anchor.web3.PublicKey;
}
