import { Principal } from '@icp-sdk/core/principal';
import { principalToSubAccount } from '@dfinity/utils';
import type { IcpIndexDid } from '@icp-sdk/canisters/ledger/icp';
import { authStore } from '$lib/stores/auth';
import { CMC_CANISTER_ID } from '$lib/constants';

export async function cmcCreateCanisterAccount(): Promise<IcpIndexDid.Account> {
  const principal = await authStore.getPrincipal();

  const cmcPrincipal = Principal.fromText(CMC_CANISTER_ID);
  const subAccount: Uint8Array = principalToSubAccount(principal);

  return {
    owner: cmcPrincipal,
    subaccount: [subAccount],
  };
}
