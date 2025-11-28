Solana Audit Subsidy Program – Cohort III
========================================

> **Quick Start**: Run `./scripts/verify-setup.sh` to verify your setup, or see `SETUP_GUIDE.md` for detailed instructions.

Overview
--------
This repository documents our readiness for the Solana Audit Subsidy Program (Cohort III). The objective is to operate with auditable engineering rigor so the review panel and partnered auditors can verify quality quickly.

Program Snapshot
----------------
- Pool size: 1,000,000 USD administered with Superteam, MonkeDAO, Jito, and Areta Market.
- Subsidy per project: 5,000–50,000 USD covering up to 30% of an audit booked via the marketplace.
- Deadline: 7 December 2025 for Cohort III applications.
- Marketplace partners: 15+ firms including Halborn, Quantstamp, Zellic, Certora.

Application Flow
----------------
1. Complete the Subsidy Program Application Form.
2. Submit on Superteam Earn with a link to the project website or X profile.
3. Expert panel scores using a standardized rubric.
4. Approved teams receive a voucher plus onboarding instructions.
5. Book an audit offer on the marketplace, apply the voucher (covers up to 30%), and schedule the engagement.

Repository Layout
-----------------
- `frontend`: Next.js + Tailwind dApp client with wallet connectivity, registry dashboard, CI board, GraphQL explorer, and subsidy readiness checklist.
- `backend`: TypeScript services handling REST, CI history, metadata projection, webhooks, and the Apollo GraphQL endpoint (Express + Vitest, Docker-ready).
- `blockchain`: Solana programs (currently the `audit_registry` Anchor program for storing audit metadata). All public items require doc comments.
- `.github`: CI workflows enforcing lint, tests, coverage, and security gates.
- `.cursor/rules`: Cursor rule files that encode engineering constraints.
- `pnpm-workspace.yaml`: Links frontend and backend packages for shared dependency governance.
- `rust-toolchain.toml`: Pins Rust 1.79.0 + BPF targets so Anchor builds remain reproducible. Install via `rustup toolchain install 1.79.0`.

Engineering Standards
---------------------
- Keep this README as the single source of truth for setup, architecture, testing, and deployment notes; update it whenever major components or dependencies change.
- Enforce SOLID separation: smart contracts remain independent from backend/frontend packages.
- Strong typing only—no `any` in TypeScript or unchecked `unwrap` in Rust without explicit justification comments.
- Comments explain intent, never implementation details, and must not reference AI tooling; no emojis anywhere in the project.

Quality and Testing
-------------------
- Minimum 80% coverage for Solana programs; surface coverage results in CI.
- Use the AAA (Arrange, Act, Assert) structure for every unit test covering public instructions or critical backend logic.
- Maintain dedicated `tests/` and `fuzz/` directories inside `blockchain`.
- Run static analyzers (e.g., custom Solana lint rules, Slither equivalents) on every PR.
- Guard against unchecked account ownership, signer validation gaps, PDA mismatches, and unchecked arithmetic.

CI/CD Expectations
------------------
- Workflow lives in `.github/workflows/ci.yml` and triggers on pushes to `main` plus every PR.
- Jobs: `audit-check` (cargo audit + npm audit), `lint` (clippy, rustfmt, eslint, static analysis), `test` (anchor test + backend/frontend suites with coverage reporting), `build` (release builds and production bundles).
- CI must enforce zero-warning linting and fail on any analyzer warning.
- Coverage reporting: Solana program coverage is measured and must meet 80% threshold. Results are uploaded to Codecov.
- CI webhook integration: Build job automatically posts CI status to backend webhook endpoint.
- Rust toolchain: Pinned to 1.79.0 to match `rust-toolchain.toml` for reproducible builds.
- Anchor CLI: Automatically installed in CI before running blockchain tests.

Local Environment
-----------------
Use Docker Compose to bring up the validator, backend, and frontend stacks:
1. `docker compose up --build`
2. Frontend available on `http://localhost:3000`, backend REST on `http://localhost:4000`, GraphQL endpoint on `http://localhost:4000/graphql`, validator RPC on `http://localhost:8899`.
3. Copy environment templates (`backend/env.template`, `frontend/env.template`) before running compose to ensure runtime configuration is explicit. The backend requires a strong `API_KEY` (>=16 chars) for CI/webhook authentication.
4. `frontend/env.template` exposes `NEXT_PUBLIC_SOLANA_RPC` (default `http://localhost:8899`) and `NEXT_PUBLIC_BACKEND_URL` (default `http://localhost:4000`) so the dashboard, SWR hooks, and GraphQL explorer all target the same backend whether running locally or in staging.
5. Install Anchor CLI (v0.30.1) plus Solana CLI locally before running blockchain tests; ensure `PATH="$HOME/.cargo/bin:$PATH"`.
6. Install the pinned Rust toolchain (`rustup toolchain install 1.79.0`) and let `rustup` honor `rust-toolchain.toml`.

Frontend Dashboard (Next.js)
---------------------------
- Phantom wallet adapter + manual authority override keep the UI strictly tied to whichever registry the reviewer wants to inspect.
- Registry metadata card reads `/metadata/:authority` and surfaces version, checksum preview, and URI.
- CI status board streams `/ci/status` (or GraphQL) to show pipeline health, commit SHA, and author per run.
- GraphQL explorer (`/graphql` proxied through Next rewrites) ships with a default query that fetches registry state plus the latest CI entries.
- Subsidy readiness checklist summarizes on-chain metadata, CI health, and GraphQL exposure so reviewers have a single-glance audit readiness snapshot.

Quickstart (to expand as code lands)
------------------------------------
1. `pnpm install` inside `frontend` and `backend` (root workspace uses pnpm).
2. Install blockchain test deps with `pnpm --filter solana-protocol-blockchain install`.
3. Build Solana programs inside `blockchain` using `cargo build` or `anchor build`.
4. Run tests: `pnpm --filter frontend lint && pnpm --filter frontend test`, `pnpm --filter backend lint && pnpm --filter backend test`, `PATH="$HOME/.cargo/bin:$PATH" pnpm --filter solana-protocol-blockchain test` (requires anchor CLI + Solana CLI), `cargo test` plus coverage for Solana logic.
5. We vendor `anchor-syn` 0.30.1 with span-path resolution disabled (`vendor/anchor-syn`) to avoid relying on unstable `proc_macro2` APIs; see `[patch.crates-io]` entry in `blockchain/Cargo.toml`.

Deployment Procedures
---------------------
- **Staging/Devnet Deployment**: Before production, deploy to devnet for integration testing.
  1. Build release artifacts: `cargo build --release` in `blockchain/`, `pnpm build` in `frontend/` and `backend/`.
  2. Deploy program to devnet: `anchor deploy --provider.cluster devnet`.
  3. Update environment variables for staging backend/frontend.
  4. Verify GraphQL endpoint and CI webhook integration.
  5. Run smoke tests: Verify wallet connection, metadata fetching, and CI status display.

- **Rollback Procedure**: If deployment fails:
  1. **Program Rollback**: Revert to previous program version:
     ```bash
     anchor deploy --provider.cluster devnet --program-id <previous-program-id>
     ```
  2. **Backend Rollback**: Restore previous backend build from CI artifacts:
     - Download previous Docker image or build artifact from GitHub Actions
     - Update environment variables to point to previous version
     - Restart backend service
  3. **Frontend Rollback**: Restore previous frontend build:
     - Deploy previous build artifact or Docker image
     - Verify frontend connects to rolled-back backend
  4. **Verification Steps**:
     - Check health endpoint: `curl http://<backend-url>/health` returns 200
     - Verify GraphQL endpoint responds: `curl -X POST http://<backend-url>/graphql -H "Content-Type: application/json" -d '{"query":"{ __typename }"}'`
     - Check CI status board shows correct status
     - Test wallet connection and metadata display
  5. **Post-Rollback Monitoring**:
     - Monitor CI status board for any failed runs
     - Check application logs for errors
     - Verify all services are healthy before attempting new deployment

