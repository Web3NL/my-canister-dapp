#!/bin/bash
set -euo pipefail

# Full validation pipeline: check → bootstrap → build → deploy → test.
#
# Flags:
#   --clean           Clean build artifacts first
#   --skip-checks     Skip lint/format/typecheck phase
#   --skip-bootstrap  Reuse existing local network
#   --skip-e2e        Skip E2E tests
#
# Behavior:
#   Local:  runs all phases including Vite E2E tests
#   CI:     auto-skips Vite E2E (CI=true detected)

source "$(dirname "$0")/scripts/constants.sh"

# Runtime reporting (MM:SS)
SCRIPT_START_TIME=$(date +%s)
print_total_time() {
    local duration=$(( $(date +%s) - SCRIPT_START_TIME ))
    printf "Total time: %02d:%02d\n" $(( duration / 60 )) $(( duration % 60 ))
}
trap print_total_time EXIT

CLEAN_FLAG=""
SKIP_CHECKS_FLAG=""
SKIP_BOOTSTRAP_FLAG=""
SKIP_E2E_FLAG=""

for arg in "$@"; do
    case $arg in
        --clean) CLEAN_FLAG="true" ;;
        --skip-checks) SKIP_CHECKS_FLAG="true" ;;
        --skip-bootstrap) SKIP_BOOTSTRAP_FLAG="true" ;;
        --skip-e2e) SKIP_E2E_FLAG="true" ;;
    esac
done

if [ "$CLEAN_FLAG" = "true" ]; then
    icp network stop local 2>/dev/null || true
    ./scripts/clean.sh
fi

# --- Phase 1: Static analysis ---
if [ "$SKIP_CHECKS_FLAG" != "true" ]; then
    ./scripts/01-check.sh
fi

# --- Phase 2: Bootstrap local network ---
if [ "$SKIP_BOOTSTRAP_FLAG" != "true" ]; then
    ./scripts/02-bootstrap.sh
fi

# --- Phase 3: Build ---
./scripts/03-build.sh

# Pre-compile acceptance test binary in background while deploy runs
echo "Pre-compiling canister-dapp-test..."
cargo build -p canister-dapp-test &
pid_cdt=$!

# --- Phase 4: Deploy ---
./scripts/04-deploy.sh

# --- Phase 5: Test ---
echo "Waiting for canister-dapp-test compilation..."
wait $pid_cdt
echo "canister-dapp-test compiled"

TEST_ARGS=""
if [ "$SKIP_E2E_FLAG" = "true" ]; then
    TEST_ARGS="--skip-e2e"
elif [ "${CI:-}" != "true" ]; then
    # Local runs include Vite E2E; CI skips it
    TEST_ARGS="--include-vite-e2e"
fi
./scripts/05-test.sh $TEST_ARGS

echo "Validation finished correctly!"
