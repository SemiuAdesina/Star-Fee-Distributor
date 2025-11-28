import { Router, type Request, type Response } from "express";
import { z } from "zod";

import type { RegistryService } from "../services/registry/types.js";

const paramsSchema = z.object({
  authority: z
    .string()
    .min(32)
    .max(44)
});

export const createMetadataRouter = (registryService: RegistryService): Router => {
  const router = Router();

  const handler = async (req: Request, res: Response): Promise<void> => {
    const parseResult = paramsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res.status(400).json({ error: "InvalidAuthority" });
      return;
    }

    const registry = await registryService.getRegistryByAuthority(parseResult.data.authority);
    if (!registry) {
      res.status(404).json({ error: "RegistryNotFound" });
      return;
    }

    res.json({
      authority: registry.authority,
      metadataUri: registry.metadataUri ?? null,
      metadataChecksum: registry.metadataChecksum ?? null,
      version: registry.version
    });
  };

  router.get("/:authority", (req, res) => {
    void handler(req, res);
  });

  return router;
};

