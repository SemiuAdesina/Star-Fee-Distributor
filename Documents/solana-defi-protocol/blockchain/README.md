# Blockchain Programs

This directory contains Solana programs built with Anchor framework.

## Structure

- `programs/audit_registry/`: Main audit registry program for storing on-chain metadata
- `tests/`: Integration tests using Anchor test framework
- `fuzz/`: Fuzz testing targets (to be implemented)

## Building

```bash
anchor build
```

## Testing

```bash
anchor test
```

## Coverage

Run coverage analysis:

```bash
cargo install cargo-llvm-cov --locked
cargo llvm-cov --locked --all-features --workspace
```

Coverage must meet the 80% threshold requirement for the audit subsidy program.

## Deployment

### Localnet
```bash
anchor deploy --provider.cluster localnet
```

### Devnet
```bash
anchor deploy --provider.cluster devnet
```

### Mainnet
```bash
anchor deploy --provider.cluster mainnet
```

## Program ID

The audit registry program ID is: `DZejfnpxWTyfX6XziQoCHUJgvksMhVPzDRnY9Gj3FTgt`

