#!/bin/bash

# Verification script for Solana Audit Subsidy Program setup
# Run this script to verify your local setup before pushing to GitHub

set -e

echo "🔍 Verifying Solana Audit Subsidy Program Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Rust version
echo "1. Checking Rust toolchain..."
if command -v rustc &> /dev/null; then
    RUST_VERSION=$(rustc --version | cut -d' ' -f2)
    echo "   ✅ Rust installed: $RUST_VERSION"
    if [[ "$RUST_VERSION" == "1.79.0"* ]]; then
        echo "   ✅ Correct version (1.79.0)"
    else
        echo "   ${YELLOW}⚠️  Warning: Expected 1.79.0, found $RUST_VERSION${NC}"
        echo "   Run: rustup toolchain install 1.79.0"
    fi
else
    echo "   ${RED}❌ Rust not found${NC}"
    exit 1
fi

# Check Solana CLI
echo ""
echo "2. Checking Solana CLI..."
if command -v solana &> /dev/null; then
    SOLANA_VERSION=$(solana --version | cut -d' ' -f2)
    echo "   ✅ Solana CLI installed: $SOLANA_VERSION"
else
    echo "   ${YELLOW}⚠️  Solana CLI not found (will be installed in CI)${NC}"
fi

# Check Anchor CLI
echo ""
echo "3. Checking Anchor CLI..."
if command -v anchor &> /dev/null; then
    ANCHOR_VERSION=$(anchor --version | cut -d' ' -f2)
    echo "   ✅ Anchor CLI installed: $ANCHOR_VERSION"
    if [[ "$ANCHOR_VERSION" == "0.30.1"* ]]; then
        echo "   ✅ Correct version (0.30.1)"
    else
        echo "   ${YELLOW}⚠️  Warning: Expected 0.30.1, found $ANCHOR_VERSION${NC}"
    fi
else
    echo "   ${YELLOW}⚠️  Anchor CLI not found (will be installed in CI)${NC}"
    echo "   Install locally: cargo install --git https://github.com/coral-xyz/anchor avm --locked --force"
fi

# Check cargo-llvm-cov
echo ""
echo "4. Checking coverage tools..."
if command -v cargo-llvm-cov &> /dev/null; then
    echo "   ✅ cargo-llvm-cov installed"
else
    echo "   ${YELLOW}⚠️  cargo-llvm-cov not found${NC}"
    echo "   Install: cargo install cargo-llvm-cov --locked"
fi

# Check backend API key
echo ""
echo "5. Checking backend configuration..."
if [ -f "backend/.env" ]; then
    API_KEY=$(grep "^API_KEY=" backend/.env | cut -d'=' -f2)
    if [ -n "$API_KEY" ] && [ ${#API_KEY} -ge 16 ]; then
        echo "   ✅ Backend API_KEY configured (length: ${#API_KEY})"
    else
        echo "   ${RED}❌ Backend API_KEY is missing or too short (<16 chars)${NC}"
        echo "   Update backend/.env with: API_KEY=<at-least-16-chars>"
    fi
else
    echo "   ${YELLOW}⚠️  backend/.env not found${NC}"
    echo "   Copy backend/env.template to backend/.env and configure"
fi

# Check GitHub Secrets (informational)
echo ""
echo "6. GitHub Secrets (verify manually on GitHub):"
echo "   - CI_WEBHOOK_API_KEY: Set in repository settings"
echo "   - BACKEND_URL: Optional, set if using remote backend"
echo "   ${YELLOW}⚠️  Go to: Settings → Secrets and variables → Actions${NC}"

# Check CI workflow
echo ""
echo "7. Checking CI workflow..."
if [ -f ".github/workflows/ci.yml" ]; then
    echo "   ✅ CI workflow file exists"
    
    # Check for required components
    if grep -q "toolchain: 1.79.0" .github/workflows/ci.yml; then
        echo "   ✅ Rust 1.79.0 pinned"
    fi
    
    if grep -q "avm install 0.30.1" .github/workflows/ci.yml; then
        echo "   ✅ Anchor 0.30.1 installation configured"
    fi
    
    if grep -q "cargo llvm-cov" .github/workflows/ci.yml; then
        echo "   ✅ Coverage reporting configured"
    fi
    
    if grep -q "CI_WEBHOOK_API_KEY" .github/workflows/ci.yml; then
        echo "   ✅ Webhook integration configured"
    fi
else
    echo "   ${RED}❌ CI workflow not found${NC}"
fi

# Check fuzz directory
echo ""
echo "8. Checking directory structure..."
if [ -d "blockchain/fuzz" ]; then
    echo "   ✅ blockchain/fuzz/ directory exists"
else
    echo "   ${RED}❌ blockchain/fuzz/ directory missing${NC}"
fi

# Check documentation
echo ""
echo "9. Checking documentation..."
DOCS=("README.md" "SETUP_GUIDE.md" "blockchain/README.md" "backend/README.md" "frontend/README.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo "   ✅ $doc exists"
    else
        echo "   ${YELLOW}⚠️  $doc missing${NC}"
    fi
done

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Set GitHub Secrets (see .github/SECRETS_SETUP.md)"
echo "2. Test CI workflow: Push to main or create a PR"
echo "3. Verify coverage: cd blockchain && cargo llvm-cov --locked --all-features --workspace"
echo "4. Test webhook: See SETUP_GUIDE.md for curl command"
echo ""
echo "For detailed instructions, see:"
echo "  - SETUP_GUIDE.md (comprehensive setup guide)"
echo "  - .github/SECRETS_SETUP.md (GitHub secrets setup)"
echo ""

