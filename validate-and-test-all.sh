#!/bin/bash
set -euo pipefail

# Full validation pipeline: check → bootstrap → build → deploy → test.
#
# Flags:
#   --clean              Clean build artifacts first
#   --skip-checks        Skip lint/format/typecheck phase
#   --skip-bootstrap     Reuse existing local network
#   --skip-acceptance    Skip acceptance tests
#   --skip-e2e           Skip E2E tests
#   --include-vite-e2e   Include Vite dev server E2E tests
#
# Behavior:
#   Vite E2E tests are excluded by default. Pass --include-vite-e2e to run them.

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
SKIP_ACCEPTANCE_FLAG=""
SKIP_E2E_FLAG=""
INCLUDE_VITE_E2E_FLAG=""

for arg in "$@"; do
    case $arg in
        --clean) CLEAN_FLAG="true" ;;
        --skip-checks) SKIP_CHECKS_FLAG="true" ;;
        --skip-bootstrap) SKIP_BOOTSTRAP_FLAG="true" ;;
        --skip-acceptance) SKIP_ACCEPTANCE_FLAG="true" ;;
        --skip-e2e) SKIP_E2E_FLAG="true" ;;
        --include-vite-e2e) INCLUDE_VITE_E2E_FLAG="true" ;;
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

# Pre-compile acceptance test binaries in background while deploy runs
echo "Pre-compiling acceptance test binaries..."
cargo build -p my-canister-dapp-cli -p demos-test &
pid_cdt=$!

# --- Phase 4: Deploy ---
./scripts/04-deploy.sh

# --- Phase 5: Test ---
echo "Waiting for acceptance test compilation..."
wait $pid_cdt
echo "Acceptance test binaries compiled"

TEST_ARGS=""
if [ "$SKIP_ACCEPTANCE_FLAG" = "true" ]; then
    TEST_ARGS="$TEST_ARGS --skip-acceptance"
fi
if [ "$SKIP_E2E_FLAG" = "true" ]; then
    TEST_ARGS="$TEST_ARGS --skip-e2e"
elif [ "$INCLUDE_VITE_E2E_FLAG" = "true" ]; then
    TEST_ARGS="$TEST_ARGS --include-vite-e2e"
fi
./scripts/05-test.sh $TEST_ARGS

# Print local canister URLs
echo ""
echo "Local canister URLs:"
icp canister status -e local --json 2>/dev/null | while IFS= read -r line; do
    name=$(echo "$line" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['name'])")
    id=$(echo "$line" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['id'])")
    printf "  %-25s http://%s.localhost:8080\n" "$name" "$id"
    printf "  %-25s http://%s.local.localhost:8080\n" "" "$name"
done

echo ""
echo "Validation finished correctly!"
