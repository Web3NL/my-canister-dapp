#!/bin/bash

set -e

echo "🧹 Cleaning gitignored files and directories..."

git clean -fdX

echo "✅ Clean complete!"