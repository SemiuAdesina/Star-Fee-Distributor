import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { buildServer, type Dependencies } from "../server.js";

const authority = "9dB1q2UQ3Uwa1jFhb8JzXX3zdZkniQXnhgypKekJy5bT";

const createDeps = (): {
  deps: Dependencies;
  app: ReturnType<typeof buildServer>;
  mocks: {
    getRegistryByAuthority: ReturnType<typeof vi.fn<Parameters<Dependencies["registryService"]["getRegistryByAuthority"]>, ReturnType<Dependencies["registryService"]["getRegistryByAuthority"]>>>;
  };
} => {
  const getRegistryByAuthority = vi.fn<
    Parameters<Dependencies["registryService"]["getRegistryByAuthority"]>,
    ReturnType<Dependencies["registryService"]["getRegistryByAuthority"]>
  >();
  const registryService: Dependencies["registryService"] = {
    getRegistryByAuthority
  };
  const ciStatusService: Dependencies["ciStatusService"] = {
    getRecent: vi.fn(),
    getStatus: vi.fn(),
    addStatus: vi.fn()
  };

  const deps: Dependencies = {
    registryService,
    ciStatusService,
    apiKey: "test-key"
  };

  return { deps, app: buildServer(deps), mocks: { getRegistryByAuthority } };
};

describe("metadata route", () => {
  it("returns metadata for known authority", async () => {
    const { app, mocks } = createDeps();
    mocks.getRegistryByAuthority.mockResolvedValue({
      authority,
      version: 1,
      bump: 255,
      metadataUri: "https://example.com/meta.json",
      metadataChecksum: Array(32).fill(1)
    });
    const res = await request(app).get(`/metadata/${authority}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ metadataUri: "https://example.com/meta.json" });
  });

  it("responds 404 when registry not found", async () => {
    const { app, mocks } = createDeps();
    mocks.getRegistryByAuthority.mockResolvedValue(null);
    const res = await request(app).get(`/metadata/${authority}`);
    expect(res.status).toBe(404);
  });
});

