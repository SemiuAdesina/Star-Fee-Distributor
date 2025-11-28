import { describe, expect, it, vi } from "vitest";

import { createResolvers, type GraphContext } from "./resolvers.js";

const resolvers = createResolvers();

const createContext = (): {
  ctx: GraphContext;
  mocks: {
    getRegistryByAuthority: ReturnType<typeof vi.fn>;
    getRecent: ReturnType<typeof vi.fn>;
    getStatus: ReturnType<typeof vi.fn>;
  };
} => {
  const getRegistryByAuthority = vi.fn<
    Parameters<GraphContext["registryService"]["getRegistryByAuthority"]>,
    ReturnType<GraphContext["registryService"]["getRegistryByAuthority"]>
  >();
  const getRecent = vi.fn<
    Parameters<GraphContext["ciStatusService"]["getRecent"]>,
    ReturnType<GraphContext["ciStatusService"]["getRecent"]>
  >();
  const getStatus = vi.fn<
    Parameters<GraphContext["ciStatusService"]["getStatus"]>,
    ReturnType<GraphContext["ciStatusService"]["getStatus"]>
  >();

  return {
    ctx: {
      registryService: {
        getRegistryByAuthority
      },
      ciStatusService: {
        getRecent,
        getStatus,
        addStatus: vi.fn()
      }
    },
    mocks: { getRegistryByAuthority, getRecent, getStatus }
  };
};

describe("Graph resolvers", () => {
  it("fetches registry metadata", async () => {
    const { ctx, mocks } = createContext();
    mocks.getRegistryByAuthority.mockResolvedValue({
      authority: "auth",
      version: 1,
      bump: 1
    });
    const result = await resolvers.Query.registry({}, { authority: "auth" }, ctx);
    expect(result?.authority).toBe("auth");
  });

  it("returns CI statuses list", async () => {
    const { ctx, mocks } = createContext();
    mocks.getRecent.mockResolvedValue([]);
    const result = await resolvers.Query.ciStatuses({}, { limit: 5 }, ctx);
    expect(Array.isArray(result)).toBe(true);
  });
});

