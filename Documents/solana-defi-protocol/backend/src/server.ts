import express, { type Express } from "express";
import helmet from "helmet";

import type { CiStatusService } from "./services/ci-status/types.js";
import type { RegistryService } from "./services/registry/types.js";
import { healthRouter } from "./views/health.js";
import { createCiStatusRouter } from "./views/ci-status.js";
import { createMetadataRouter } from "./views/metadata.js";
import { createRegistryRouter } from "./views/registry.js";

export type Dependencies = {
  registryService: RegistryService;
  ciStatusService: CiStatusService;
  apiKey: string;
};

export const buildServer = (deps: Dependencies): Express => {
  const app = express();

  app.disable("x-powered-by");
  // CORS middleware
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, x-api-key");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  app.use(express.json({ limit: "64kb" }));

  app.use("/health", healthRouter);
  app.use("/registry", createRegistryRouter(deps.registryService));
  app.use("/metadata", createMetadataRouter(deps.registryService));
  app.use(
    "/ci/status",
    createCiStatusRouter({ ciStatusService: deps.ciStatusService, apiKey: deps.apiKey })
  );

  return app;
};

