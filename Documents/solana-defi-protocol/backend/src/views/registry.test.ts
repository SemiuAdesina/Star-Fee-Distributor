import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { buildServer, type Dependencies } from "../server.js";
import type { RegistryService, RegistryState } from "../services/registry/types.js";

const authority = "9dB1q2UQ3Uwa1jFhb8JzXX3zdZkniQXnhgypKekJy5bT";

type RegistryServiceMock = RegistryService & {
  getRegistryByAuthority: ReturnType<
    typeof vi.fn<[string], ReturnType<RegistryService["getRegistryByAuthority"]>>
  >;
};

const createApp = (overrides: Partial<Dependencies> = {}): {
  app: ReturnType<typeof buildServer>;
  registryService: RegistryServiceMock;
} => {
  const registryService: RegistryServiceMock = {
    getRegistryByAuthority: vi.fn<[string], Promise<RegistryState | null>>()
  };
  const deps: Dependencies = {
    registryService,
    ...overrides
  };
  return {
    app: buildServer(deps),
    registryService
  };
};

describe("registry route", () => {
  it("returns registry payload when authority exists", async () => {
    // Arrange
    const { app, registryService } = createApp();
    registryService.getRegistryByAuthority.mockResolvedValue({
      authority,
      version: 1,
      bump: 255
    });
    // Act
    const res = await request(app).get(`/registry/${authority}`);
    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      authority,
      version: 1,
      bump: 255
    });
  });

  it("returns 404 when registry absent", async () => {
    // Arrange
    const { app, registryService } = createApp();
    registryService.getRegistryByAuthority.mockResolvedValue(null);
    // Act
    const res = await request(app).get(`/registry/${authority}`);
    // Assert
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      error: "RegistryNotFound"
    });
  });

  it("rejects invalid authority", async () => {
    const { app } = createApp();
    const res = await request(app).get("/registry/not-a-key");
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: "InvalidAuthority" });
  });
});

