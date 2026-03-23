import { Principal } from '@icp-sdk/core/principal';
import { SubAccount } from '@icp-sdk/canisters/ledger/icp';
import type { IcpIndexDid } from '@icp-sdk/canisters/ledger/icp';
import { authStore } from '$lib/stores/auth';
import { CMC_CANISTER_ID } from '$lib/constants';

export async function cmcCreateCanisterAccount(): Promise<IcpIndexDid.Account> {
  const principal = await authStore.getPrincipal();

  const cmcPrincipal = Principal.fromText(CMC_CANISTER_ID);
  const subAccount: Uint8Array =
    SubAccount.fromPrincipal(principal).toUint8Array();

  return {
    owner: cmcPrincipal,
    subaccount: [subAccount],
  };
}
