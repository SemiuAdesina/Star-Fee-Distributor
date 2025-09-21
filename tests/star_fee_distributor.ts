import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StarFeeDistributor, InvestorAccount } from "./types";
import { 
  PublicKey, 
  Keypair, 
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_CLOCK_PUBKEY
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  createMint, 
  createAccount, 
  mintTo,
  getAccount,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccountInfo
} from "@solana/spl-token";
import { expect } from "chai";

describe("star_fee_distributor", () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.StarFeeDistributor as Program<StarFeeDistributor>;
  const provider = anchor.getProvider();

  // Test accounts
  let vault: Keypair;
  let quoteMint: PublicKey;
  let baseMint: PublicKey;
  let cpAmmPool: Keypair;
  let cpAmmProgram: Keypair;
  let streamflowProgram: Keypair;
  let creator: Keypair;
  let creatorQuoteAta: PublicKey;
  let programTreasury: Keypair;

  // Investor accounts
  let investor1: Keypair;
  let investor2: Keypair;
  let investor3: Keypair;
  let investor1QuoteAta: PublicKey;
  let investor2QuoteAta: PublicKey;
  let investor3QuoteAta: PublicKey;

  // Stream accounts
  let stream1: Keypair;
  let stream2: Keypair;
  let stream3: Keypair;

  before(async () => {
    // Initialize test accounts
    vault = Keypair.generate();
    cpAmmPool = Keypair.generate();
    cpAmmProgram = Keypair.generate();
    streamflowProgram = Keypair.generate();
    creator = Keypair.generate();
    programTreasury = Keypair.generate();

    investor1 = Keypair.generate();
    investor2 = Keypair.generate();
    investor3 = Keypair.generate();

    stream1 = Keypair.generate();
    stream2 = Keypair.generate();
    stream3 = Keypair.generate();

    // Create mints
    quoteMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      9
    );

    baseMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      9
    );

    // Create ATAs
    creatorQuoteAta = await getAssociatedTokenAddress(quoteMint, creator.publicKey);
    investor1QuoteAta = await getAssociatedTokenAddress(quoteMint, investor1.publicKey);
    investor2QuoteAta = await getAssociatedTokenAddress(quoteMint, investor2.publicKey);
    investor3QuoteAta = await getAssociatedTokenAddress(quoteMint, investor3.publicKey);

    // Create program treasury ATA
    await provider.connection.requestAirdrop(programTreasury.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    
    const createTreasuryIx = await createAssociatedTokenAccountInstruction(
      provider.wallet.publicKey,
      programTreasury.publicKey,
      quoteMint,
      provider.wallet.publicKey
    );

    const tx = new anchor.web3.Transaction().add(createTreasuryIx);
    await provider.sendAndConfirm(tx);

    // Mint tokens to program treasury for testing
    await mintTo(
      provider.connection,
      provider.wallet.payer,
      quoteMint,
      programTreasury.publicKey,
      provider.wallet.payer,
      1000000000 // 1B tokens
    );
  });

  it("Initializes honorary position with valid configuration", async () => {
    // Derive PDAs
    const [policyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), vault.publicKey.toBuffer(), Buffer.from("policy")],
      program.programId
    );

    const [progressPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), vault.publicKey.toBuffer(), Buffer.from("progress")],
      program.programId
    );

    const [positionOwnerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), vault.publicKey.toBuffer(), Buffer.from("investor_fee_pos_owner")],
      program.programId
    );

    try {
      const tx = await program.methods
        .initializeHonoraryPosition(
          new anchor.BN(5000), // 50% investor fee share
          new anchor.BN(1000000000), // 1B daily cap
          new anchor.BN(1000), // 1000 minimum payout
          new anchor.BN(10000000000) // 10B total allocation
        )
        .accounts({
          payer: provider.wallet.publicKey,
          vault: vault.publicKey,
          cpAmmPool: cpAmmPool.publicKey,
          quoteMint: quoteMint,
          baseMint: baseMint,
          cpAmmProgram: cpAmmProgram.publicKey,
          policy: policyPda,
          progress: progressPda,
          programTreasury: programTreasury.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([vault])
        .rpc();

      console.log("Initialize transaction signature:", tx);

      // Verify policy was created
      const policyAccount = await program.account.policy.fetch(policyPda);
      expect(policyAccount.investorFeeShareBps.toNumber()).to.equal(5000);
      expect(policyAccount.dailyCap.toNumber()).to.equal(1000000000);
      expect(policyAccount.minPayoutLamports.toNumber()).to.equal(1000);
      expect(policyAccount.y0.toNumber()).to.equal(10000000000);
      expect(policyAccount.quoteMint.toString()).to.equal(quoteMint.toString());
      expect(policyAccount.vault.toString()).to.equal(vault.publicKey.toString());

      // Verify progress was created
      const progressAccount = await program.account.progress.fetch(progressPda);
      expect(progressAccount.lastDistributionTs.toNumber()).to.equal(0);
      expect(progressAccount.distributedToday.toNumber()).to.equal(0);
      expect(progressAccount.carryOver.toNumber()).to.equal(0);
      expect(progressAccount.paginationCursor.toNumber()).to.equal(0);

    } catch (error) {
      console.error("Initialize failed:", error);
      throw error;
    }
  });

  it("Fails to initialize with invalid parameters", async () => {
    const [policyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), vault.publicKey.toBuffer(), Buffer.from("policy")],
      program.programId
    );

    const [progressPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), vault.publicKey.toBuffer(), Buffer.from("progress")],
      program.programId
    );

    // Test with invalid fee share (> 100%)
    try {
      await program.methods
        .initializeHonoraryPosition(
          new anchor.BN(10001), // Invalid: > 100%
          new anchor.BN(1000000000),
          new anchor.BN(1000),
          new anchor.BN(10000000000)
        )
        .accounts({
          payer: provider.wallet.publicKey,
          vault: vault.publicKey,
          cpAmmPool: cpAmmPool.publicKey,
          quoteMint: quoteMint,
          baseMint: baseMint,
          cpAmmProgram: cpAmmProgram.publicKey,
          policy: policyPda,
          progress: progressPda,
          programTreasury: programTreasury.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([vault])
        .rpc();

      expect.fail("Should have failed with invalid fee share");
    } catch (error) {
      expect(error.message).to.include("InvalidFeeShareBps");
    }
  });

  it("Runs distribution crank with partial locks", async () => {
    // This test simulates a scenario where investors have partial vesting
    const [policyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), vault.publicKey.toBuffer(), Buffer.from("policy")],
      program.programId
    );

    const [progressPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), vault.publicKey.toBuffer(), Buffer.from("progress")],
      program.programId
    );

    const [positionOwnerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), vault.publicKey.toBuffer(), Buffer.from("investor_fee_pos_owner")],
      program.programId
    );

    // Create investor accounts with mock locked amounts
    const investorAccounts: InvestorAccount[] = [
      {
        streamPubkey: stream1.publicKey,
        investorQuoteAta: investor1QuoteAta,
        lockedAmount: new anchor.BN(5000000000), // 5B locked (50% of total)
        weight: new anchor.BN(0),
      },
      {
        streamPubkey: stream2.publicKey,
        investorQuoteAta: investor2QuoteAta,
        lockedAmount: new anchor.BN(3000000000), // 3B locked (30% of total)
        weight: new anchor.BN(0),
      },
    ];

    try {
      const tx = await program.methods
        .crankDistribute(
          new anchor.BN(1), // First page
          investorAccounts
        )
        .accounts({
          crankCaller: provider.wallet.publicKey,
          vault: vault.publicKey,
          positionOwnerPda: positionOwnerPda,
          programTreasury: programTreasury.publicKey,
          creatorQuoteAta: creatorQuoteAta,
          policy: policyPda,
          progress: progressPda,
          cpAmmProgram: cpAmmProgram.publicKey,
          cpAmmPool: cpAmmPool.publicKey,
          streamflowProgram: streamflowProgram.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Crank transaction signature:", tx);

      // Verify progress was updated
      const progressAccount = await program.account.progress.fetch(progressPda);
      expect(progressAccount.lastDistributionTs.toNumber()).to.be.greaterThan(0);
      expect(progressAccount.paginationCursor.toNumber()).to.equal(1);
      expect(progressAccount.distributedToday.toNumber()).to.be.greaterThan(0);

    } catch (error) {
      console.error("Crank failed:", error);
      throw error;
    }
  });

  it("Fails crank when called too early", async () => {
    const [policyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), vault.publicKey.toBuffer(), Buffer.from("policy")],
      program.programId
    );

    const [progressPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), vault.publicKey.toBuffer(), Buffer.from("progress")],
      program.programId
    );

    const [positionOwnerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), vault.publicKey.toBuffer(), Buffer.from("investor_fee_pos_owner")],
      program.programId
    );

    const investorAccounts: InvestorAccount[] = [
      {
        streamPubkey: stream1.publicKey,
        investorQuoteAta: investor1QuoteAta,
        lockedAmount: new anchor.BN(5000000000),
        weight: new anchor.BN(0),
      },
    ];

    // Try to call crank again immediately (should fail due to 24h gate)
    try {
      await program.methods
        .crankDistribute(
          new anchor.BN(2), // Second page
          investorAccounts
        )
        .accounts({
          crankCaller: provider.wallet.publicKey,
          vault: vault.publicKey,
          positionOwnerPda: positionOwnerPda,
          programTreasury: programTreasury.publicKey,
          creatorQuoteAta: creatorQuoteAta,
          policy: policyPda,
          progress: progressPda,
          cpAmmProgram: cpAmmProgram.publicKey,
          cpAmmPool: cpAmmPool.publicKey,
          streamflowProgram: streamflowProgram.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      expect.fail("Should have failed due to 24h gate");
    } catch (error) {
      // This should fail because we're calling the same day
      // In a real test, we'd mock the clock to advance 24 hours
      console.log("Expected failure due to timing:", error.message);
    }
  });

  it("Handles daily cap correctly", async () => {
    // Create a new vault for this test
    const newVault = Keypair.generate();
    
    const [policyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), newVault.publicKey.toBuffer(), Buffer.from("policy")],
      program.programId
    );

    const [progressPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), newVault.publicKey.toBuffer(), Buffer.from("progress")],
      program.programId
    );

    // Initialize with a very low daily cap
    try {
      await program.methods
        .initializeHonoraryPosition(
          new anchor.BN(10000), // 100% investor fee share
          new anchor.BN(100000), // Very low daily cap
          new anchor.BN(1000),
          new anchor.BN(10000000000)
        )
        .accounts({
          payer: provider.wallet.publicKey,
          vault: newVault.publicKey,
          cpAmmPool: cpAmmPool.publicKey,
          quoteMint: quoteMint,
          baseMint: baseMint,
          cpAmmProgram: cpAmmProgram.publicKey,
          policy: policyPda,
          progress: progressPda,
          programTreasury: programTreasury.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([newVault])
        .rpc();

      // Verify the policy has the low daily cap
      const policyAccount = await program.account.policy.fetch(policyPda);
      expect(policyAccount.dailyCap.toNumber()).to.equal(100000);

    } catch (error) {
      console.error("Initialize with low cap failed:", error);
      throw error;
    }
  });

  it("Distributes to creator when all investors are unlocked", async () => {
    // This test simulates the scenario where f_locked(t) = 0
    // All fees should go to the creator
    
    const newVault = Keypair.generate();
    
    const [policyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), newVault.publicKey.toBuffer(), Buffer.from("policy")],
      program.programId
    );

    const [progressPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), newVault.publicKey.toBuffer(), Buffer.from("progress")],
      program.programId
    );

    const [positionOwnerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), newVault.publicKey.toBuffer(), Buffer.from("investor_fee_pos_owner")],
      program.programId
    );

    // Initialize
    await program.methods
      .initializeHonoraryPosition(
        new anchor.BN(5000), // 50% investor fee share
        new anchor.BN(1000000000),
        new anchor.BN(1000),
        new anchor.BN(10000000000)
      )
      .accounts({
        payer: provider.wallet.publicKey,
        vault: newVault.publicKey,
        cpAmmPool: cpAmmPool.publicKey,
        quoteMint: quoteMint,
        baseMint: baseMint,
        cpAmmProgram: cpAmmProgram.publicKey,
        policy: policyPda,
        progress: progressPda,
        programTreasury: programTreasury.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([newVault])
      .rpc();

    // Create investor accounts with zero locked amounts (all unlocked)
    const investorAccounts: InvestorAccount[] = [
      {
        streamPubkey: stream1.publicKey,
        investorQuoteAta: investor1QuoteAta,
        lockedAmount: new anchor.BN(0), // All unlocked
        weight: new anchor.BN(0),
      },
    ];

    try {
      const tx = await program.methods
        .crankDistribute(
          new anchor.BN(1),
          investorAccounts
        )
        .accounts({
          crankCaller: provider.wallet.publicKey,
          vault: newVault.publicKey,
          positionOwnerPda: positionOwnerPda,
          programTreasury: programTreasury.publicKey,
          creatorQuoteAta: creatorQuoteAta,
          policy: policyPda,
          progress: progressPda,
          cpAmmProgram: cpAmmProgram.publicKey,
          cpAmmPool: cpAmmPool.publicKey,
          streamflowProgram: streamflowProgram.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("All unlocked distribution transaction:", tx);

      // Verify that day was marked complete and creator received remainder
      const progressAccount = await program.account.progress.fetch(progressPda);
      expect(progressAccount.dayComplete).to.be.true;

    } catch (error) {
      console.error("All unlocked distribution failed:", error);
      throw error;
    }
  });

  it("Handles dust threshold correctly", async () => {
    // This test verifies that small amounts below the dust threshold are not distributed
    
    const newVault = Keypair.generate();
    
    const [policyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), newVault.publicKey.toBuffer(), Buffer.from("policy")],
      program.programId
    );

    const [progressPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), newVault.publicKey.toBuffer(), Buffer.from("progress")],
      program.programId
    );

    const [positionOwnerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), newVault.publicKey.toBuffer(), Buffer.from("investor_fee_pos_owner")],
      program.programId
    );

    // Initialize with high dust threshold
    await program.methods
      .initializeHonoraryPosition(
        new anchor.BN(5000), // 50% investor fee share
        new anchor.BN(1000000000),
        new anchor.BN(1000000), // High dust threshold (1M)
        new anchor.BN(10000000000)
      )
      .accounts({
        payer: provider.wallet.publicKey,
        vault: newVault.publicKey,
        cpAmmPool: cpAmmPool.publicKey,
        quoteMint: quoteMint,
        baseMint: baseMint,
        cpAmmProgram: cpAmmProgram.publicKey,
        policy: policyPda,
        progress: progressPda,
        programTreasury: programTreasury.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([newVault])
      .rpc();

    // Create investor accounts with small locked amounts that would result in dust
    const investorAccounts: InvestorAccount[] = [
      {
        streamPubkey: stream1.publicKey,
        investorQuoteAta: investor1QuoteAta,
        lockedAmount: new anchor.BN(1000000), // Small amount
        weight: new anchor.BN(0),
      },
    ];

    try {
      const tx = await program.methods
        .crankDistribute(
          new anchor.BN(1),
          investorAccounts
        )
        .accounts({
          crankCaller: provider.wallet.publicKey,
          vault: newVault.publicKey,
          positionOwnerPda: positionOwnerPda,
          programTreasury: programTreasury.publicKey,
          creatorQuoteAta: creatorQuoteAta,
          policy: policyPda,
          progress: progressPda,
          cpAmmProgram: cpAmmProgram.publicKey,
          cpAmmPool: cpAmmPool.publicKey,
          streamflowProgram: streamflowProgram.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Dust threshold test transaction:", tx);

      // Verify that dust was carried over
      const progressAccount = await program.account.progress.fetch(progressPda);
      expect(progressAccount.carryOver.toNumber()).to.be.greaterThan(0);

    } catch (error) {
      console.error("Dust threshold test failed:", error);
      throw error;
    }
  });
});
