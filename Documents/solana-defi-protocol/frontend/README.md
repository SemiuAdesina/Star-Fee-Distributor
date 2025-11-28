# Frontend Dashboard

Next.js application with wallet connectivity, registry dashboard, CI status board, and GraphQL explorer.

## Features

- Solana wallet adapter integration (Phantom)
- Registry metadata display
- CI status monitoring
- GraphQL query explorer
- Subsidy readiness checklist

## Setup

1. Copy `env.template` to `.env.local`
2. Set `NEXT_PUBLIC_SOLANA_RPC` (default: `http://localhost:8899`)
3. Set `NEXT_PUBLIC_BACKEND_URL` (default: `http://localhost:4000`)
4. Install dependencies: `pnpm install`
5. Run development server: `pnpm dev`
6. Build for production: `pnpm build`

## Environment Variables

- `NEXT_PUBLIC_SOLANA_RPC`: Solana RPC endpoint
- `NEXT_PUBLIC_BACKEND_URL`: Backend API URL

## Testing

```bash
pnpm test
pnpm test:coverage
```

## Docker

```bash
docker build -t solana-defi-frontend .
docker run -p 3000:3000 --env-file .env.local solana-defi-frontend
```

