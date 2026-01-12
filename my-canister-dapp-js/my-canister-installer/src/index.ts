/**
 * @web3nl/my-canister-installer
 *
 * Reusable utilities for Internet Computer canister installation logic.
 *
 * @packageDocumentation
 */

export { E8S_PER_TOKEN } from './constants.js';

export { calculateIcpFromCyclesRate } from './balance.js';

export { createDerivationOriginFromHost } from './derivationOrigin.js';

export {
  setPendingCanister,
  getPendingCanister,
  clearPendingCanister,
  setStorage,
  resetStorage,
  PartialCreationError,
} from './pendingCanister.js';

export type { PendingCanisterStorage } from './pendingCanister.js';
