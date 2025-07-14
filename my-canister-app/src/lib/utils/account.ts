import { Principal } from '@dfinity/principal';
import { principalToSubAccount } from '@dfinity/utils';
import type { Account } from '@dfinity/ledger-icp';
import { authStore } from '$lib/stores/auth';
import { CMC_CANISTER_ID } from '$lib/constants';

export async function cmcCreateCanisterAccount(): Promise<Account> {
  const principal = await authStore.getPrincipal();

  const cmcPrincipal = Principal.fromText(CMC_CANISTER_ID);
  const subAccount: Uint8Array = principalToSubAccount(principal);

  return {
    owner: cmcPrincipal,
    subaccount: [subAccount],
  };
}
