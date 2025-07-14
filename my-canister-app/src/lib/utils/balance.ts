import { MIN_CANISTER_CREATION_BALANCE } from '$lib/constants';

export function hasSufficientBalanceForCanisterCreation(
  balance: bigint
): boolean {
  return balance >= MIN_CANISTER_CREATION_BALANCE;
}
