# Backend Service

Express.js backend providing REST API, GraphQL endpoint, and CI status webhooks.

## Features

- REST API for registry metadata and CI status
- Apollo GraphQL server at `/graphql`
- CI status webhook endpoint at `/ci/status/webhook`
- Health check endpoint at `/health`

## Setup

1. Copy `env.template` to `.env`
2. Set `API_KEY` (minimum 16 characters) for webhook authentication
3. Install dependencies: `pnpm install`
4. Build: `pnpm build`
5. Start: `pnpm start`

## Environment Variables

- `API_KEY`: Required for CI webhook authentication (>=16 chars)
- `PORT`: Server port (default: 4000)
- `NODE_ENV`: Environment mode (development/production)

## API Endpoints

- `GET /health`: Health check
- `GET /metadata/:authority`: Fetch registry metadata
- `GET /ci/status`: Get recent CI statuses
- `POST /ci/status/webhook`: Receive CI status updates (requires `x-api-key` header)
- `POST /graphql`: GraphQL endpoint

## Testing

```bash
pnpm test
pnpm test:coverage
```

## Docker

```bash
docker build -t solana-defi-backend .
docker run -p 4000:4000 --env-file .env solana-defi-backend
```

