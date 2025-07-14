import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface HttpRequest {
  'url' : string,
  'method' : string,
  'body' : Uint8Array | number[],
  'headers' : Array<[string, string]>,
}
export interface HttpResponse {
  'body' : Uint8Array | number[],
  'headers' : Array<[string, string]>,
  'status_code' : number,
}
export type ManageAlternativeOriginsArg = { 'Add' : string } |
  { 'Remove' : string };
export type ManageAlternativeOriginsResult = { 'Ok' : null } |
  { 'Err' : string };
export type ManageIIPrincipalArg = { 'Get' : null } |
  { 'Set' : Principal };
export type ManageIIPrincipalResult = { 'Ok' : Principal } |
  { 'Err' : string };
export interface WasmStatus {
  'memo' : [] | [string],
  'name' : string,
  'version' : number,
}
export interface _SERVICE {
  'http_request' : ActorMethod<[HttpRequest], HttpResponse>,
  'manage_alternative_origins' : ActorMethod<
    [ManageAlternativeOriginsArg],
    ManageAlternativeOriginsResult
  >,
  'manage_ii_principal' : ActorMethod<
    [ManageIIPrincipalArg],
    ManageIIPrincipalResult
  >,
  'wasm_status' : ActorMethod<[], WasmStatus>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
