#!/bin/bash
set -euo pipefail

echo "🧹 Cleaning gitignored files and directories..."

git clean -fdX

echo "✅ Clean complete!"