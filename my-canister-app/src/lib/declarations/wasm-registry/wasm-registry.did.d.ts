import type { Principal } from '@icp-sdk/core/principal';
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export type RemoveWasmResult = { 'Ok' : null } |
  { 'Err' : string };
export interface UploadWasmArg {
  'name' : string,
  'description' : string,
  'wasm_bytes' : Uint8Array | number[],
  'version' : string,
}
export type UploadWasmResult = { 'Ok' : WasmEntry } |
  { 'Err' : string };
export interface WasmEntry {
  'name' : string,
  'description' : string,
  'created_at' : bigint,
  'version' : string,
  'wasm_hash' : string,
  'wasm_size' : bigint,
}
export interface _SERVICE {
  'get_wasm_bytes' : ActorMethod<[string], [] | [Uint8Array | number[]]>,
  'get_wasm_entry' : ActorMethod<[string], [] | [WasmEntry]>,
  'get_wasm_version' : ActorMethod<[string, string], [] | [WasmEntry]>,
  'list_versions' : ActorMethod<[string], Array<WasmEntry>>,
  'list_wasms' : ActorMethod<[], Array<WasmEntry>>,
  'remove_wasm' : ActorMethod<[string], RemoveWasmResult>,
  'upload_wasm' : ActorMethod<[UploadWasmArg], UploadWasmResult>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
