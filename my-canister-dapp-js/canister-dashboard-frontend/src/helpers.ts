import type { Principal } from '@dfinity/principal';
import { E8S } from './constants';

export function convertMemoToBigInt(memo: Uint8Array): bigint {
  let result = BigInt(0);
  for (let i = 0; i < memo.length; i++) {
    const byte = memo[i];
    if (byte !== undefined) {
      result = (result << BigInt(8)) | BigInt(byte);
    }
  }
  return result;
}

export function principalToSubaccount(principal: Principal): Uint8Array {
  const principalBytes = principal.toUint8Array();
  const subaccount = new Uint8Array(32);

  // First byte is the length of the principal
  subaccount[0] = principalBytes.length;

  // Principal bytes are copied starting from byte 1
  subaccount.set(principalBytes, 1);

  return subaccount;
}

export function formatMemorySize(bytes: bigint): string {
  if (bytes < 0) {
    return '0.00 MB';
  }
  const mb = Number(bytes) / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

export function formatCycles(cycles: bigint): string {
  if (cycles < 0) {
    return '0.00 T';
  }
  const trillion = Number(cycles) / 1e12;
  return `${trillion.toFixed(2)} T`;
}

export function formatIcpBalance(balance: bigint): string {
  if (balance < 0) {
    return '0.00000000';
  }
  return (Number(balance) / E8S).toFixed(8);
}
