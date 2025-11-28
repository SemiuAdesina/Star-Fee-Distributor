import { Router, type Request, type Response } from "express";
import { z } from "zod";

import type { RegistryService } from "../services/registry/types.js";

const paramsSchema = z.object({
  authority: z
    .string()
    .refine(
      (value) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value),
      "InvalidAuthority"
    )
});

export const createRegistryRouter = (registryService: RegistryService): Router => {
  const router = Router();

  const handleGet = async (req: Request, res: Response): Promise<void> => {
    const parseResult = paramsSchema.safeParse(req.params);
    if (!parseResult.success) {
      res.status(400).json({ error: "InvalidAuthority" });
      return;
    }

    const { authority } = parseResult.data;
    try {
      const registry = await registryService.getRegistryByAuthority(authority);
      if (!registry) {
        res.status(404).json({ error: "RegistryNotFound" });
        return;
      }
      res.json(registry);
    } catch (error) {
      console.error("registry lookup failure", error);
      res.status(500).json({ error: "RegistryLookupFailed" });
    }
  };

  router.get("/:authority", (req, res) => {
    void handleGet(req, res);
  });

  return router;
};

