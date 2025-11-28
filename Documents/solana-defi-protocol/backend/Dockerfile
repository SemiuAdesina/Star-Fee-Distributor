# syntax=docker/dockerfile:1.7
FROM node:20.18-alpine3.20 AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM deps AS build
COPY tsconfig.json tsconfig.build.json vitest.config.ts ./
COPY src ./src
RUN pnpm build

FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/index.js"]

