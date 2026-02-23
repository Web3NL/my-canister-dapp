// Authentication configuration
export const MAX_TIME_TO_LIVE = BigInt(15) * BigInt(60) * BigInt(1_000_000_000); // 15 minutes in nanoseconds

// Canister IDs
export const CMC_CANISTER_ID = 'rkp4c-7iaaa-aaaaa-aaaca-cai';

// Transaction fees
export const ICP_TX_FEE = BigInt(10000); // 0.0001 ICP in e8s

// ICP decimal places (10^8)
export const E8S = 100_000_000;

// TPUP memo for CMC top-up (first 4 bytes spell "TPUP" in ASCII)
export const TPUP_MEMO = new Uint8Array([
  0x54, 0x50, 0x55, 0x50, 0x00, 0x00, 0x00, 0x00,
]);
