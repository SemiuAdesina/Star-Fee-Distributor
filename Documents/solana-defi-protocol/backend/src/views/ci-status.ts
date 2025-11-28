import { Router, type Request, type Response } from "express";
import { z } from "zod";

import { createApiKeyGuard } from "../middleware/api-key.js";
import type { CiStatusService, CiStatusInput } from "../services/ci-status/types.js";

const bodySchema = z.object({
  pipeline: z.string().min(1),
  status: z.enum(["success", "failed", "running"]),
  commit: z.string().min(1),
  runId: z.string().min(1),
  triggeredBy: z.string().min(1),
  timestamp: z.string().datetime().optional()
});

const querySchema = z.object({
  limit: z
    .string()
    .transform((value) => Number(value))
    .pipe(z.number().int().positive())
    .optional()
});

export type CiStatusRouterDeps = {
  ciStatusService: CiStatusService;
  apiKey: string;
};

export const createCiStatusRouter = ({ ciStatusService, apiKey }: CiStatusRouterDeps): Router => {
  const router = Router();
  const guard = createApiKeyGuard(apiKey);

  const handleGet = async (req: Request, res: Response): Promise<void> => {
    const parseResult = querySchema.safeParse(req.query);
    if (!parseResult.success) {
      res.status(400).json({ error: "InvalidQuery" });
      return;
    }

    const limit = parseResult.data.limit ?? 10;
    const statuses = await ciStatusService.getRecent(limit);
    res.json(statuses);
  };

  const handlePost = async (req: Request, res: Response): Promise<void> => {
    const parseResult = bodySchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: "InvalidPayload" });
      return;
    }

    const payload: CiStatusInput = parseResult.data;
    await ciStatusService.addStatus(payload);
    res.status(202).json({ status: "accepted" });
  };

  router.get("/", (req, res) => {
    void handleGet(req, res);
  });

  router.post("/webhook", guard, (req, res) => {
    void handlePost(req, res);
  });

  return router;
};

