import { Connection } from "@solana/web3.js";

import { env } from "./env.js";
import { createCiStatusService } from "./services/ci-status/ci-status.service.js";
import { createRegistryService } from "./services/registry/registry.service.js";
import type { Dependencies } from "./server.js";

export const createContainer = async (): Promise<Dependencies> => {
  const connection = new Connection(env.SOLANA_RPC_URL, "confirmed");
  const registryService = createRegistryService({ connection });
  const ciStatusService = await createCiStatusService();

  return {
    registryService,
    ciStatusService,
    apiKey: env.API_KEY
  };
};

