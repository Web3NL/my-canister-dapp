import { CANISTER_CREATION_CYCLES_AMOUNT, E8S_PER_TOKEN } from '$lib/constants';
import { CmcApi } from '$lib/api/cmc';

export function calculateIcpFromCyclesRate(
  targetCycles: bigint,
  xdrPermyriadPerIcp: bigint,
  e8sPerToken: bigint = E8S_PER_TOKEN
): bigint {
  if (xdrPermyriadPerIcp === 0n) throw new Error('Invalid rate (0)');
  const PERMYRIAD = 10_000n;
  const CYCLES_PER_XDR = 1_000_000_000_000n; // 1e12 cycles = 1 XDR
  const cyclesPerIcp = (CYCLES_PER_XDR * xdrPermyriadPerIcp) / PERMYRIAD;
  if (cyclesPerIcp === 0n) throw new Error('cyclesPerIcp resolved to 0');
  // Ceiling division: (a + b - 1) / b
  return (targetCycles * e8sPerToken + cyclesPerIcp - 1n) / cyclesPerIcp;
}

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
