/**
 * Re-export pending canister utilities from @web3nl/my-canister-installer.
 *
 * Note: Re-exports are needed for proper `instanceof` checks with PartialCreationError
 * across package boundaries in TypeScript/Svelte.
 */
export {
  setPendingCanister,
  getPendingCanister,
  clearPendingCanister,
  PartialCreationError,
} from '@web3nl/my-canister-installer';
