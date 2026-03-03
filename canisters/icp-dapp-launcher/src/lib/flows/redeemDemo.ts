import { DemosApi } from '$lib/api/demos';
import { remoteAuthStore } from '$lib/stores/remoteAuth';
import { Principal } from '@icp-sdk/core/principal';

/**
 * Redeem an access code and get an assigned demo canister with wasm installed.
 * Called after the user enters a valid code and selects a dapp.
 */
export async function redeemDemoCode(
  code: string,
  wasmName: string
): Promise<Principal> {
  const demosApi = await DemosApi.create();
  const result = await demosApi.redeemCode(code, wasmName);

  if ('Err' in result) {
    throw new Error(result.Err);
  }

  return result.Ok.canister_id;
}

/**
 * Complete the demo setup after the user has done remote II auth.
 * 1. Opens II popup for remote auth at demo canister domain
 * 2. Sends the resulting dapp principal to the demos canister
 */
export async function completeDemoSetup(
  code: string,
  canisterPrincipal: Principal
): Promise<void> {
  // Remote auth at demo canister domain (same mechanism as normal install)
  await remoteAuthStore.login(canisterPrincipal);
  const iiPrincipal = await remoteAuthStore.getPrincipal();
  if (!iiPrincipal) {
    throw new Error(
      'Failed to retrieve II principal after remote authentication'
    );
  }

  // Finalize: demos canister sets II principal + controllers on demo canister
  const demosApi = await DemosApi.create();
  const result = await demosApi.finalizeDemo(code, iiPrincipal);

  if ('Err' in result) {
    throw new Error(result.Err);
  }
}
