#!/usr/bin/env node

// Encodes an UploadWasmArg as binary Candid (hex) for use with `icp canister call`.
// Usage: node encode-upload-arg.mjs <name> <description> <version> <wasm-gz-path>
// Outputs hex-encoded Candid binary to stdout.

import { readFileSync } from "node:fs";
import { IDL } from "@icp-sdk/core/candid";

const [name, description, version, wasmPath] = process.argv.slice(2);

if (!name || !description || !version || !wasmPath) {
  console.error(
    "Usage: node encode-upload-arg.mjs <name> <description> <version> <wasm-gz-path>"
  );
  process.exit(1);
}

const wasmBytes = readFileSync(wasmPath);

const UploadWasmArg = IDL.Record({
  name: IDL.Text,
  description: IDL.Text,
  version: IDL.Text,
  wasm_bytes: IDL.Vec(IDL.Nat8),
});

const encoded = IDL.encode(
  [UploadWasmArg],
  [{ name, description, version, wasm_bytes: wasmBytes }]
);

process.stdout.write(Buffer.from(encoded).toString("hex"));
