# Monorepo usage: versioning, validation, and manual publishing

This repo uses Changesets (versioning), Syncpack (version consistency), and Knip (used/missing deps) across npm workspaces. Publishing is manual. There is no CI-based publish.

## Where to run commands

Run all commands from the repository root unless noted. The root `package.json` provides scripts that operate across workspaces.

## Typical flow (manual)

1. Create a changeset for your changes

- `npm run changeset`
- Select affected packages and bump type.

2. Apply versions and changelogs

- `npm run release:version`
- Commit the changes (package.json + CHANGELOG.md updates).

3. Validate before publishing

- Build everything: `npm run build --workspaces`
- Sanity checks: `npm run deps:check` (Syncpack + Knip)

4. Manual publish of changed packages

- `npm run release:publish`
- This runs Changesets publish from the root and only publishes packages with version bumps.

## Dry-run and “what will publish?”

Changesets doesn’t have a single global dry-run switch for publish, but you have two safe options:

- See what would be released: `npx changeset status`
  - Shows which packages will be versioned/published and the changelog entries.
- Verify package contents without publishing:
  - Create tarball: `npm pack --workspace @web3nl/my-canister-dashboard`
  - Dry-run npm publish for one package: `npm publish --dry-run --workspace @web3nl/my-canister-dashboard`
  - Repeat for `@web3nl/vite-plugin-canister-dapp` as needed.

Tip: You can also run `npm pack` and inspect the tarball contents to ensure no workspace-only files are included.

## Dependency hygiene

- Check consistency and used/missing deps: `npm run deps:check`
  - Syncpack reports version mismatches across package.json files.
  - Knip checks the two published packages for missing/unused deps.
- Auto-fix common version drift: `npm run deps:fix`

## One-off/single package publish

If you must publish just one package directly (bypassing Changesets publish):

- Ensure versions are already bumped (`npm run release:version`), then:
  - `npm publish --workspace @web3nl/my-canister-dashboard`
  - or `npm publish --workspace @web3nl/vite-plugin-canister-dapp`

Note: Using `changeset publish` from the root is recommended so dependents are handled correctly and changelogs remain consistent.
