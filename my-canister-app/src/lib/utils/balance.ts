import { CANISTER_CREATION_CYCLES_AMOUNT } from '$lib/constants';
import { CmcApi } from '$lib/api/cmc';
import { calculateIcpFromCyclesRate } from '@web3nl/my-canister-installer';

export async function hasSufficientBalanceForCanisterCreation(
  balance: bigint
): Promise<boolean> {
  const needed = await calculateIcpNeededForCanisterCreation();
  return balance >= needed;
}

export async function calculateIcpNeededForCanisterCreation(): Promise<bigint> {
  const cmc = await CmcApi.create();
  const rate = await cmc.getIcpToCyclesConversionRate();
  return calculateIcpFromCyclesRate(CANISTER_CREATION_CYCLES_AMOUNT, rate);
}
