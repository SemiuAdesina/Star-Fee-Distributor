import type { CiStatusService } from "../services/ci-status/types.js";
import type { RegistryService } from "../services/registry/types.js";

export type GraphContext = {
  registryService: RegistryService;
  ciStatusService: CiStatusService;
};

type Resolvers = {
  Query: {
    registry: (
      parent: unknown,
      args: { authority: string },
      ctx: GraphContext
    ) => Promise<Awaited<ReturnType<RegistryService["getRegistryByAuthority"]>>>;
    ciStatuses: (
      parent: unknown,
      args: { limit?: number },
      ctx: GraphContext
    ) => Promise<Awaited<ReturnType<CiStatusService["getRecent"]>>>;
    ciStatus: (
      parent: unknown,
      args: { runId: string },
      ctx: GraphContext
    ) => Promise<Awaited<ReturnType<CiStatusService["getStatus"]>>>;
  };
};

export const createResolvers = (): Resolvers => ({
  Query: {
    registry: async (_parent, args, ctx) => {
      return ctx.registryService.getRegistryByAuthority(args.authority);
    },
    ciStatuses: async (_parent, args, ctx) => {
      return ctx.ciStatusService.getRecent(args.limit);
    },
    ciStatus: async (_parent, args, ctx) => {
      return ctx.ciStatusService.getStatus(args.runId);
    }
  }
});

