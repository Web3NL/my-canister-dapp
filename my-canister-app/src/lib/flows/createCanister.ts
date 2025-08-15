import { LedgerApi } from '$lib/api/ledgerIcp';
import { CmcApi } from '$lib/api/cmc';
import { IcManagementApi } from '$lib/api/icManagement';
import { TRANSACTION_FEE } from '$lib/constants';
import { authStore } from '$lib/stores/auth';
import type { Principal } from '@dfinity/principal';
import { remoteAuthStore } from '$lib/stores/remoteAuth';
import { hasSufficientBalanceForCanisterCreation } from '$lib/utils/balance';
import { fetchDappWasmFromRegistry } from '$lib/utils/fetch';
import {
  MyDashboardBackend,
  type ManageIIPrincipalArg,
} from '@web3nl/my-canister-dashboard';
import { createHttpAgent } from '$lib/utils/agent';

export async function createNewCanister(wasmId: number): Promise<Principal> {
  const ledgerApi = await LedgerApi.create();
  const balance = await ledgerApi.balance();

  if (!(await hasSufficientBalanceForCanisterCreation(balance))) {
    throw new Error('Insufficient balance for canister creation');
  }

  const wasmModule = await fetchDappWasmFromRegistry(wasmId);

  const blockIndex = await sendToCmc(balance);
  const canisterId = await createCanister(blockIndex);
  await installCodeToCanister(canisterId, wasmModule);

  return canisterId;
}

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

export async function sendToCmc(balance: bigint): Promise<bigint> {
  const transferAmount = balance - TRANSACTION_FEE;
  const ledgerApi = await LedgerApi.create();
  const blockIndex =
    await ledgerApi.transfer_to_cmc_for_create_canister(transferAmount);

  return blockIndex;
}

export async function createCanister(blockIndex: bigint): Promise<Principal> {
  const userPrincipal = await authStore.getPrincipal();

  const cmcApi = await CmcApi.create();
  const canisterPrincipal = await cmcApi.notifyCreateCanister(
    blockIndex,
    userPrincipal
  );

  return canisterPrincipal;
}

export async function installCodeToCanister(
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
