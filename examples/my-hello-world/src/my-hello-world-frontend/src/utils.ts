import { Principal } from '@dfinity/principal';
import { inferCanisterIdFromLocation } from '@web3nl/my-canister-dashboard';
import { getConfig } from './environment';

export async function getCanisterId(): Promise<Principal> {
  try {
    return inferCanisterIdFromLocation();
  } catch {
    // When in dev server inference fails and we use local canister ID
    const config = await getConfig();
    if (config.canisterId !== undefined) {
      return Principal.fromText(config.canisterId as string);
    }

    throw new Error(
      'No canister ID available - please configure VITE_CANISTER_ID in .env.development'
    );
  }
}
