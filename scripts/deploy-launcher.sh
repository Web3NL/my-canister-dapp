#!/bin/bash
set -euo pipefail

# Check if version bump type was provided
if [ -z "$1" ]; then
    echo "❌ Please provide version bump type: patch, minor, or major"
    echo "Usage: ./scripts/deploy-launcher.sh <patch|minor|major>"
    exit 1
fi

VERSION_TYPE="$1"

# Validate version type
if [[ "$VERSION_TYPE" != "patch" && "$VERSION_TYPE" != "minor" && "$VERSION_TYPE" != "major" ]]; then
    echo "❌ Invalid version type: $VERSION_TYPE"
    echo "Valid options: patch, minor, major"
    exit 1
fi

echo "🚀 Deploying icp-dapp-launcher with $VERSION_TYPE version bump..."

# Check if working directory is clean
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ Working directory is not clean. Please commit or stash your changes first."
    git status --short
    exit 1
fi

# Deploy the app (ICP_NETWORK=ic triggers production build)
echo "🚢 Deploying to IC..."
ICP_NETWORK=ic icp deploy icp-dapp-launcher -e mainnet --identity web3nl

# Get current commit hash after successful deploy
COMMIT_HASH=$(git rev-parse HEAD)
echo "📝 Current commit: $COMMIT_HASH"

# Add deployedAtCommit to package.json
echo "📦 Updating package.json with deployedAtCommit..."
cd canisters/icp-dapp-launcher
npm pkg set deployedAtCommit="$COMMIT_HASH"

# Bump version and commit if deploy succeeded
echo "📈 Bumping $VERSION_TYPE version..."
npm version "$VERSION_TYPE" --no-git-tag-version > /dev/null 2>&1
NEW_VERSION=$(node -p "require('./package.json').version")

# Commit the changes
echo "💾 Committing version bump..."
cd ../..
git add canisters/icp-dapp-launcher/package.json package-lock.json
git commit -m "chore: bump icp-dapp-launcher version ($VERSION_TYPE)"

# Create git tag
echo "🏷️  Creating git tag: icp-dapp-launcher-v$NEW_VERSION"
git tag "icp-dapp-launcher-v$NEW_VERSION"

# Push changes and tag to remote
echo "⬆️  Pushing changes to remote..."
git push
echo "⬆️  Pushing tags to remote..."
git push --tags

echo "✅ Deploy complete! Tagged as icp-dapp-launcher-v$NEW_VERSION"
