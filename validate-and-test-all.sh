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

# ⏱️ Per-step timing
SCRIPT_START_TIME=$(date +%s)
T_STATIC=0
T_BOOTSTRAP=0
T_BUILD=0
T_CARGO=0
T_DEPLOY=0
T_TEST=0

print_summary() {
    local total=$(( $(date +%s) - SCRIPT_START_TIME ))
    echo ""
    echo "┌──────────────────────────────────────┬─────────┐"
    echo "│ Step                                 │ Time    │"
    echo "├──────────────────────────────────────┼─────────┤"
    if [ "$SKIP_CHECKS" != "true" ]; then
        printf "│ %-36s │ %02d:%02d   │\n" "🔍 Static analysis" $(( T_STATIC / 60 )) $(( T_STATIC % 60 ))
    fi
    if [ "$SKIP_BOOTSTRAP" != "true" ]; then
        printf "│ %-36s │ %02d:%02d   │\n" "🌐 Bootstrap" $(( T_BOOTSTRAP / 60 )) $(( T_BOOTSTRAP % 60 ))
    fi
    printf "│ %-36s │ %02d:%02d   │\n" "🔨 Build"                     $(( T_BUILD / 60 ))     $(( T_BUILD % 60 ))
    printf "│ %-36s │ %02d:%02d   │\n" "🚀 Deploy"                    $(( T_DEPLOY / 60 ))    $(( T_DEPLOY % 60 ))
    printf "│ %-36s │ %02d:%02d   │\n" "⚡ Cargo pre-compile (parallel)" $(( T_CARGO / 60 )) $(( T_CARGO % 60 ))
    printf "│ %-36s │ %02d:%02d   │\n" "🧪 Test"                      $(( T_TEST / 60 ))      $(( T_TEST % 60 ))
    echo "├──────────────────────────────────────┼─────────┤"
    printf "│ %-36s │ %02d:%02d   │\n" "Total" $(( total / 60 )) $(( total % 60 ))
    echo "└──────────────────────────────────────┴─────────┘"
}
trap print_summary EXIT

# 🚩 Parse flags
CLEAN="false"
SKIP_CHECKS="false"
SKIP_BOOTSTRAP="false"
SKIP_ACCEPTANCE="false"
SKIP_E2E="false"
INCLUDE_VITE_E2E="false"

if [[ "$*" == *"--clean"* ]];            then CLEAN="true"; fi
if [[ "$*" == *"--skip-checks"* ]];      then SKIP_CHECKS="true"; fi
if [[ "$*" == *"--skip-bootstrap"* ]];   then SKIP_BOOTSTRAP="true"; fi
if [[ "$*" == *"--skip-acceptance"* ]];  then SKIP_ACCEPTANCE="true"; fi
if [[ "$*" == *"--skip-e2e"* ]];         then SKIP_E2E="true"; fi
if [[ "$*" == *"--include-vite-e2e"* ]]; then INCLUDE_VITE_E2E="true"; fi

if [ "$CLEAN" = "true" ]; then
    icp network stop local 2>/dev/null || true
    ./scripts/clean.sh
fi

# --- 🔍 Phase 1: Static analysis ---
if [ "$SKIP_CHECKS" != "true" ]; then
    t=$(date +%s)
    ./scripts/01-check.sh
    T_STATIC=$(( $(date +%s) - t ))
fi

# --- 🌐 Phase 2: Bootstrap local network ---
if [ "$SKIP_BOOTSTRAP" != "true" ]; then
    t=$(date +%s)
    ./scripts/02-bootstrap.sh
    T_BOOTSTRAP=$(( $(date +%s) - t ))
fi

# --- 🔨 Phase 3: Build ---
t=$(date +%s)
./scripts/03-build.sh
T_BUILD=$(( $(date +%s) - t ))

# ⚡ Pre-compile acceptance test binaries in background while deploy runs
echo "⚡ Pre-compiling acceptance test binaries..."
cargo_start=$(date +%s)
cargo build -p my-canister-dapp-cli -p demos-test &
pid_cdt=$!

# --- 🚀 Phase 4: Deploy ---
t=$(date +%s)
./scripts/04-deploy.sh
T_DEPLOY=$(( $(date +%s) - t ))

# --- 🧪 Phase 5: Test ---
echo "⏳ Waiting for acceptance test compilation..."
wait $pid_cdt
echo "✅ Acceptance test binaries compiled"
T_CARGO=$(( $(date +%s) - cargo_start ))

t=$(date +%s)
if [ "$SKIP_ACCEPTANCE" = "true" ] && [ "$SKIP_E2E" = "true" ]; then
    ./scripts/05-test.sh --skip-acceptance --skip-e2e
elif [ "$SKIP_ACCEPTANCE" = "true" ]; then
    ./scripts/05-test.sh --skip-acceptance
elif [ "$SKIP_E2E" = "true" ]; then
    ./scripts/05-test.sh --skip-e2e
elif [ "$INCLUDE_VITE_E2E" = "true" ]; then
    ./scripts/05-test.sh --include-vite-e2e
else
    ./scripts/05-test.sh
fi
T_TEST=$(( $(date +%s) - t ))

# 🌐 Print local canister URLs
echo ""
echo "🌐 Local canister URLs:"
icp canister status -e local --json 2>/dev/null | while IFS= read -r line; do
    name=$(echo "$line" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['name'])")
    id=$(echo "$line" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['id'])")
    printf "  %-25s http://%s.localhost:8080\n" "$name" "$id"
    printf "  %-25s http://%s.local.localhost:8080\n" "" "$name"
done

echo ""
echo "✅ Validation finished correctly!"
