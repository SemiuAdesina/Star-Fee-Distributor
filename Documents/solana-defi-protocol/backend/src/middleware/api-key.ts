import { timingSafeEqual } from "crypto";
import type { RequestHandler } from "express";

export const createApiKeyGuard = (apiKey: string): RequestHandler => {
  return (req, res, next) => {
    if (!apiKey) {
      res.status(500).json({ error: "ApiKeyUnset" });
      return;
    }

    const providedKey = req.header("x-api-key");
    if (!providedKey) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const expected = Buffer.from(apiKey, "utf8");
    const received = Buffer.from(providedKey, "utf8");
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    next();
  };
};

