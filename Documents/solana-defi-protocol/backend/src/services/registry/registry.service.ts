import { Connection, PublicKey } from "@solana/web3.js";
import { createHash } from "crypto";

import type { RegistryService, RegistryState } from "./types.js";

const PROGRAM_ID = new PublicKey("DZejfnpxWTyfX6XziQoCHUJgvksMhVPzDRnY9Gj3FTgt");

const DISCRIMINATOR = createHash("sha256")
  .update("account:Registry")
  .digest()
  .subarray(0, 8);

const ACCOUNT_SIZE = 8 + 32 + 8 + 1 + 4 + 200 + 32;

export type RegistryServiceDeps = {
  connection: Connection;
};

export const createRegistryService = ({ connection }: RegistryServiceDeps): RegistryService => {
  const decodeAccount = (data: Buffer): RegistryState | null => {
    if (data.length < ACCOUNT_SIZE) {
      return null;
    }
    const discriminator = data.subarray(0, 8);
    if (!discriminator.equals(DISCRIMINATOR)) {
      return null;
    }
    const authorityBytes = data.subarray(8, 40);
    const authority = new PublicKey(authorityBytes).toBase58();
    const version = Number(data.readBigUInt64LE(40));
    const bump = data.readUInt8(48);
    const uriLength = data.readUInt32LE(49);
    const metadataUri = data.toString("utf8", 53, 53 + uriLength);
    const checksumStart = 53 + 200;
    const metadataChecksum = Array.from(data.subarray(checksumStart, checksumStart + 32));
    return { authority, version, bump, metadataUri, metadataChecksum };
  };

  return {
    async getRegistryByAuthority(authority: string): Promise<RegistryState | null> {
      const authorityKey = new PublicKey(authority);
      const [registryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("registry"), authorityKey.toBuffer()],
        PROGRAM_ID
      );
      const accountInfo = await connection.getAccountInfo(registryPda);
      if (!accountInfo?.data) {
        return null;
      }
      return decodeAccount(Buffer.from(accountInfo.data));
    }
  };
};

