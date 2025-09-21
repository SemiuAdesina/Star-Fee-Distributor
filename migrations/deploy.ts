import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";

// Type definitions for the program (will be generated after build)
interface StarFeeDistributor {
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
  };
  programId: anchor.web3.PublicKey;
}
import { PublicKey } from "@solana/web3.js";

async function main() {
  console.log("Starting Star Fee Distributor deployment...");

  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();
  const program = anchor.workspace.StarFeeDistributor as Program<StarFeeDistributor>;

  console.log("Program ID:", program.programId.toString());
  console.log("Provider wallet:", provider.wallet.publicKey.toString());

  try {
    // Deploy the program
    console.log("Deploying program...");
    const deployTx = await program.methods
      .initializeHonoraryPosition(
        new anchor.BN(5000), // 50% investor fee share
        new anchor.BN(1000000000), // 1B daily cap
        new anchor.BN(1000), // 1000 minimum payout
        new anchor.BN(10000000000) // 10B total allocation
      )
      .rpc();

    console.log("Deployment successful!");
    console.log("Transaction signature:", deployTx);

    // Verify deployment
    const programAccount = await provider.connection.getAccountInfo(program.programId);
    if (programAccount) {
      console.log("Program account verified");
      console.log("Program data length:", programAccount.data.length);
    } else {
      console.log("Program account not found");
    }

    console.log("Star Fee Distributor deployed successfully!");

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
