import request from "supertest";
import { z } from "zod";
import { vi } from "vitest";

import { buildServer, type Dependencies } from "../server.js";

const healthSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string()
});

const createDeps = (): Dependencies => ({
  registryService: {
    getRegistryByAuthority: vi.fn()
  },
  ciStatusService: {
    getRecent: vi.fn(),
    addStatus: vi.fn()
  },
  apiKey: "test-key"
});

describe("health route", () => {
  it("returns ok payload", async () => {
    // Arrange
    const app = buildServer(createDeps());
    // Act
    const res = await request(app).get("/health");
    // Assert
    expect(res.status).toBe(200);
    const payload = healthSchema.parse(res.body);
    expect(payload.status).toBe("ok");
    expect(typeof payload.timestamp).toBe("string");
  });
});

