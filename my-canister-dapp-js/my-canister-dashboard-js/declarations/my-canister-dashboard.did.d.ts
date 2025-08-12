import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type CyclesAmount = { '_1T' : null } |
  { '_2T' : null } |
  { '_5T' : null } |
  { '_10T' : null } |
  { '_50T' : null } |
  { '_0_5T' : null } |
  { '_100T' : null } |
  { '_0_25T' : null };
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
export type ManageTopUpRuleArg = { 'Add' : TopUpRule } |
  { 'Get' : null } |
  { 'Clear' : null };
export type ManageTopUpRuleResult = { 'Ok' : [] | [TopUpRule] } |
  { 'Err' : string };
export type TopUpInterval = { 'Hourly' : null } |
  { 'Weekly' : null } |
  { 'Daily' : null } |
  { 'Monthly' : null };
export interface TopUpRule {
  'interval' : TopUpInterval,
  'cycles_amount' : CyclesAmount,
  'cycles_threshold' : CyclesAmount,
}
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
  'manage_top_up_rule' : ActorMethod<
    [ManageTopUpRuleArg],
    ManageTopUpRuleResult
  >,
  'wasm_status' : ActorMethod<[], WasmStatus>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
