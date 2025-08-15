import { CANISTER_CREATION_CYCLES_AMOUNT, E8S_PER_TOKEN } from '$lib/constants';
import { CmcApi } from '$lib/api/cmc';

export async function hasSufficientBalanceForCanisterCreation(
  balance: bigint
): Promise<boolean> {
  const needed = await calculateIcpNeededForCanisterCreation();
  return balance >= needed;
}

export async function calculateIcpNeededForCanisterCreation(): Promise<bigint> {
  const cmc = await CmcApi.create();
  const rate = await cmc.getIcpToCyclesConversionRate(); // xdr_permyriad_per_icp (permyriad of XDR per 1 ICP)
  if (rate === 0n) throw new Error('Invalid CMC rate (0)');
  const PERMYRIAD = 10_000n; // denominator of rate
  const CYCLES_PER_XDR = 1_000_000_000_000n; // 1e12 cycles = 1 XDR
  const cyclesPerIcp = (CYCLES_PER_XDR * rate) / PERMYRIAD; // cycles minted per 1 ICP
  if (cyclesPerIcp === 0n) throw new Error('cyclesPerIcp resolved to 0');
  // required ICP in e8s = ceil( target_cycles / cyclesPerIcp ) * 1e8
  return (
    (CANISTER_CREATION_CYCLES_AMOUNT * E8S_PER_TOKEN + cyclesPerIcp - 1n) /
    cyclesPerIcp
  );
}
