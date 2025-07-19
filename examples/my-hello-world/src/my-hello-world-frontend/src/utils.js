import { Principal } from '@dfinity/principal';
import { inferCanisterIdFromLocation } from '@web3nl/my-canister-dashboard';

const CANISTER_ID_DEV = import.meta.env.VITE_CANISTER_ID;

export function getCanisterId() {
  try {
    return inferCanisterIdFromLocation();
  } catch {
    // When in dev server inference fails and we use local canister ID
    if (CANISTER_ID_DEV !== undefined) {
      return Principal.fromText(CANISTER_ID_DEV);
    }

    throw new Error(
      'No canister ID available - please set VITE_CANISTER_ID in .env.development'
    );
  }
}
