import { config as loadEnv } from "dotenv";
import { z } from "zod";

loadEnv();

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  SOLANA_RPC_URL: z.string().url().default("http://validator:8899"),
  API_KEY: z.string().min(16)
});

export type Env = z.infer<typeof schema>;

export const env: Env = schema.parse(process.env);

