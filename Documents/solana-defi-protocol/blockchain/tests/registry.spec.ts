// @ts-nocheck
import * as anchor from "@coral-xyz/anchor";
import { AnchorError, BN, Program } from "@coral-xyz/anchor";
import { expect } from "chai";
import { PublicKey } from "@solana/web3.js";

type AuditRegistry = {
  address: string;
};

const deriveRegistryPda = (authority: PublicKey, programId: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("registry"), authority.toBuffer()],
    programId
  );
};

describe("audit registry", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AuditRegistry as Program<AuditRegistry>;
  const authority = provider.wallet.publicKey;
  const targetVersion = new BN(1);

  it("initializes registry state", async () => {
    // Arrange
    const [registryPda] = deriveRegistryPda(authority, program.programId);
    // Act
    await program.methods
      .initializeRegistry(targetVersion)
      .accounts({
        authority,
        registry: registryPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
    // Assert
    const registry = await program.account.registry.fetch(registryPda);
    expect(registry.authority.toBase58()).to.equal(authority.toBase58());
    expect(registry.version.toNumber()).to.equal(1);
  });

  it("rejects reinitialization attempts", async () => {
    // Arrange
    const [registryPda] = deriveRegistryPda(authority, program.programId);
    // Act
    const attempt = program.methods
      .initializeRegistry(targetVersion)
      .accounts({
        authority,
        registry: registryPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();
    // Assert
    await expect(attempt).to.be.rejectedWith(AnchorError);
  });

  it("updates metadata", async () => {
    const [registryPda] = deriveRegistryPda(authority, program.programId);
    await program.methods
      .updateMetadata({
        uri: "https://example.com/metadata.json",
        checksum: Array(32).fill(1)
      })
      .accounts({
        authority,
        registry: registryPda
      })
      .rpc();
    const registry = await program.account.registry.fetch(registryPda);
    expect(registry.metadataUri).to.equal("https://example.com/metadata.json");
    expect(registry.metadataChecksum).to.deep.equal(Array(32).fill(1));
  });
});

