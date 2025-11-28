import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

import { env } from "./env.js";
import { createContainer } from "./container.js";
import { buildServer } from "./server.js";
import { typeDefs } from "./graphql/schema.js";
import { createResolvers, type GraphContext } from "./graphql/resolvers.js";

const bootstrap = async (): Promise<void> => {
  const deps = await createContainer();
  const app = buildServer(deps);

  const apollo = new ApolloServer({
    typeDefs,
    resolvers: createResolvers()
  });
  await apollo.start();
  app.use(
    "/graphql",
    expressMiddleware(apollo, {
      context: (): Promise<GraphContext> =>
        Promise.resolve({
          registryService: deps.registryService,
          ciStatusService: deps.ciStatusService
        })
    })
  );

  app.listen(env.PORT, () => {
    console.info(`backend listening on ${env.PORT}`);
  });
};

void bootstrap();

