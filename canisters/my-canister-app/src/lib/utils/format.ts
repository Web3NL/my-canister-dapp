import { E8S_PER_TOKEN } from '$lib/constants';

export function formatIcpBalance(balanceE8s: bigint): string {
  const balance = Number(balanceE8s) / Number(E8S_PER_TOKEN);
  return `${balance.toFixed(8)} ICP`;
}
