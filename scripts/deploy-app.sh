#!/bin/bash

set -e

# Check if version bump type was provided
if [ -z "$1" ]; then
    echo "❌ Please provide version bump type: patch, minor, or major"
    echo "Usage: ./scripts/deploy-app.sh <patch|minor|major>"
    exit 1
fi

VERSION_TYPE="$1"

# Validate version type
if [[ "$VERSION_TYPE" != "patch" && "$VERSION_TYPE" != "minor" && "$VERSION_TYPE" != "major" ]]; then
    echo "❌ Invalid version type: $VERSION_TYPE"
    echo "Valid options: patch, minor, major"
    exit 1
fi

echo "🚀 Deploying my-canister-app with $VERSION_TYPE version bump..."

# Check if working directory is clean
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ Working directory is not clean. Please commit or stash your changes first."
    git status --short
    exit 1
fi

# Get current commit hash
COMMIT_HASH=$(git rev-parse HEAD)
echo "📝 Current commit: $COMMIT_HASH"

# Add deployedAtCommit to package.json
echo "📦 Updating package.json with deployedAtCommit..."
cd my-canister-app
npm pkg set deployedAtCommit="$COMMIT_HASH"
cd ..

# Set dfx identity
echo "🔑 Setting dfx identity to web3nl..."
dfx identity use web3nl

# Deploy the app
echo "🚢 Deploying to IC..."
npm run deploy:app

# Bump version and commit if deploy succeeded
echo "📈 Bumping $VERSION_TYPE version..."
cd my-canister-app
NEW_VERSION=$(npm version "$VERSION_TYPE" --no-git-tag-version)
echo "🔍 Raw version from npm: $NEW_VERSION"
# Remove the 'v' prefix from the version
NEW_VERSION=${NEW_VERSION#v}
echo "🔍 Clean version: $NEW_VERSION"

# Commit the changes (from within my-canister-app directory)
echo "💾 Committing version bump..."
cd ..
git add .
git commit -m "chore: bump my-canister-app version ($VERSION_TYPE)"

# Create git tag
echo "🏷️  Creating git tag: my-canister-app-v$NEW_VERSION"
git tag "my-canister-app-v$NEW_VERSION"
echo "✅ Tag created successfully"

# Push changes and tag to remote
echo "⬆️  Pushing changes to remote..."
git push
echo "✅ Changes pushed successfully"
echo "⬆️  Pushing tags to remote..."
git push --tags
echo "✅ Tags pushed successfully"

echo "✅ Deploy complete! Tagged as my-canister-app-v$NEW_VERSION"
