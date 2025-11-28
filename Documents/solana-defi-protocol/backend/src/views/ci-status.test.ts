import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { buildServer, type Dependencies } from "../server.js";
import type {
  CiStatusService,
  CiStatus,
  CiStatusInput
} from "../services/ci-status/types.js";

const createDeps = (overrides: Partial<Dependencies> = {}): {
  app: ReturnType<typeof buildServer>;
  deps: Dependencies;
} => {
  const ciStatusService: CiStatusService = {
    getRecent: vi.fn().mockResolvedValue([]),
    addStatus: vi.fn()
  };

  const deps: Dependencies = {
    registryService: {
      getRegistryByAuthority: vi.fn()
    },
    ciStatusService,
    apiKey: "test-key",
    ...overrides
  };

  return { app: buildServer(deps), deps };
};

describe("ci status routes", () => {
  it("returns recent statuses", async () => {
    const statuses: CiStatus[] = [
      {
        pipeline: "ci",
        status: "success",
        commit: "abc123",
        runId: "run-1",
        triggeredBy: "main",
        timestamp: new Date().toISOString()
      }
    ];
    const ciStatusService: CiStatusService = {
      getRecent: vi.fn().mockResolvedValue(statuses),
      addStatus: vi.fn()
    };
    const { app } = createDeps({ ciStatusService });

    const res = await request(app).get("/ci/status");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(statuses);
  });

  it("rejects webhook without API key", async () => {
    const { app } = createDeps();
    const res = await request(app).post("/ci/status/webhook").send({});
    expect(res.status).toBe(401);
  });

  it("accepts valid webhook payload and stores status", async () => {
    const addStatus = vi.fn();
    const { app } = createDeps({
      ciStatusService: {
        getRecent: vi.fn().mockResolvedValue([]),
        addStatus
      }
    });
    const payload: CiStatusInput = {
      pipeline: "ci",
      status: "failed",
      commit: "def456",
      runId: "run-2",
      triggeredBy: "feature-branch",
      timestamp: new Date().toISOString()
    };

    const res = await request(app)
      .post("/ci/status/webhook")
      .set("x-api-key", "test-key")
      .send(payload);

    expect(res.status).toBe(202);
    expect(addStatus).toHaveBeenCalledWith(payload);
  });
});

