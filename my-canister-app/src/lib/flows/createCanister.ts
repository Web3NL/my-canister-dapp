import { LedgerApi } from '$lib/api/ledgerIcp';
import { CmcApi } from '$lib/api/cmc';
import { IcManagementApi } from '$lib/api/icManagement';
import { TRANSACTION_FEE } from '$lib/constants';
import { authStore } from '$lib/stores/auth';
import type { Principal } from '@dfinity/principal';
import { remoteAuthStore } from '$lib/stores/remoteAuth';
import { hasSufficientBalanceForCanisterCreation } from '$lib/utils/balance';
import {
  MyDashboardBackend,
  type ManageIIPrincipalArg,
} from '@web3nl/my-canister-dashboard';
import { createHttpAgent } from '$lib/utils/agent';
import {
  setPendingCanister,
  getPendingCanister,
  clearPendingCanister,
  PartialCreationError,
} from './pendingCanister';

/**
 * Creates a new canister and installs the provided WASM module.
 *
 * If a previous creation attempt failed during install, this will detect
 * the pending canister and retry the installation instead of creating a new one.
 *
 * @throws {PartialCreationError} If canister creation succeeds but install fails
 */
export async function createNewCanister(
  wasmModule: Uint8Array
): Promise<Principal> {
  // Check for a pending canister from a previous failed attempt
  const pendingCanister = getPendingCanister();
  if (pendingCanister) {
    // Try to complete the installation on the existing canister
    await installCodeToCanister(pendingCanister, wasmModule);
    clearPendingCanister();
    return pendingCanister;
  }

  const ledgerApi = await LedgerApi.create();
  const balance = await ledgerApi.balance();

  if (!(await hasSufficientBalanceForCanisterCreation(balance))) {
    throw new Error('Insufficient balance for canister creation');
  }

  const blockIndex = await sendToCmc(balance);
  const canisterId = await createCanister(blockIndex);

  // Store the canister ID in case install fails
  setPendingCanister(canisterId);

  try {
    await installCodeToCanister(canisterId, wasmModule);
    clearPendingCanister();
  } catch (error) {
    // Canister exists but install failed - throw recoverable error
    throw new PartialCreationError(
      canisterId,
      error instanceof Error ? error : new Error(String(error))
    );
  }

  return canisterId;
}

/**
 * Checks if there's a pending canister from a failed creation attempt.
 */
export {
  getPendingCanister,
  clearPendingCanister,
  PartialCreationError,
} from './pendingCanister';

export async function installAndTakeControl(
  canisterPrincipal: Principal
): Promise<void> {
  const iiPrincipal = await remoteAuth(canisterPrincipal);
  const agent = await createHttpAgent();

  const myDashboardBackend = MyDashboardBackend.create({
    agent,
    canisterId: canisterPrincipal,
  });

  await setIIPrincipal(iiPrincipal, myDashboardBackend);

  await setControllers(canisterPrincipal, [canisterPrincipal, iiPrincipal]);
}

async function sendToCmc(balance: bigint): Promise<bigint> {
  const transferAmount = balance - TRANSACTION_FEE;
  const ledgerApi = await LedgerApi.create();
  const blockIndex =
    await ledgerApi.transfer_to_cmc_for_create_canister(transferAmount);

  return blockIndex;
}

async function createCanister(blockIndex: bigint): Promise<Principal> {
  const userPrincipal = await authStore.getPrincipal();

  const cmcApi = await CmcApi.create();
  const canisterPrincipal = await cmcApi.notifyCreateCanister(
    blockIndex,
    userPrincipal
  );

  return canisterPrincipal;
}

async function installCodeToCanister(
  canisterId: Principal,
  wasmModule: Uint8Array
): Promise<void> {
  const icManagement = await IcManagementApi.create();
  await icManagement.installCode(canisterId, wasmModule);
}

async function remoteAuth(canisterPrincipal: Principal): Promise<Principal> {
  await remoteAuthStore.login(canisterPrincipal);
  const iiPrincipal = await remoteAuthStore.getPrincipal();
  if (!iiPrincipal) {
    throw new Error(
      'Failed to retrieve II principal after remote authentication'
    );
  }
  return iiPrincipal;
}

async function setIIPrincipal(
  iiPrincipal: Principal,
  myDashboardBackend: MyDashboardBackend
): Promise<void> {
  const arg: ManageIIPrincipalArg = { Set: iiPrincipal };
  await myDashboardBackend.manageIIPrincipal(arg);
}

async function setControllers(
  canisterId: Principal,
  controllers: Principal[]
): Promise<void> {
  const icManagement = await IcManagementApi.create();
  await icManagement.updateControllers(canisterId, controllers);
}
