import { Principal } from '@dfinity/principal';
import { inferCanisterIdFromLocation } from '@web3nl/my-canister-dashboard';
import { getConfig } from './environment';

export async function getCanisterId(): Promise<Principal> {
  try {
    return inferCanisterIdFromLocation();
  } catch {
    // When in dev server inference fails and we use local canister ID
    const config = await getConfig();
    if (config.canisterIdDev !== undefined) {
      return Principal.fromText(config.canisterIdDev);
    }

    throw new Error(
      'No canister ID available - please set VITE_MY_HELLO_WORLD_CANISTER_ID in global .env.development'
    );
  }
}
