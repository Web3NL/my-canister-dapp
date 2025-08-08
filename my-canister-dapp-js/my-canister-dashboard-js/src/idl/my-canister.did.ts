import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

// Public service types for the My Canister Dashboard backend
export interface HttpRequest {
  url: string;
  method: string;
  body: Uint8Array | number[];
  headers: Array<[string, string]>;
}

export interface HttpResponse {
  body: Uint8Array | number[];
  headers: Array<[string, string]>;
  status_code: number;
}

export type ManageAlternativeOriginsArg = { Add: string } | { Remove: string };
export type ManageAlternativeOriginsResult = { Ok: null } | { Err: string };

export type ManageIIPrincipalArg = { Get: null } | { Set: Principal };
export type ManageIIPrincipalResult = { Ok: Principal } | { Err: string };

export interface WasmStatus {
  memo: [] | [string];
  name: string;
  version: number;
}

export interface _SERVICE {
  http_request: ActorMethod<[HttpRequest], HttpResponse>;
  manage_alternative_origins: ActorMethod<
    [ManageAlternativeOriginsArg],
    ManageAlternativeOriginsResult
  >;
  manage_ii_principal: ActorMethod<
    [ManageIIPrincipalArg],
    ManageIIPrincipalResult
  >;
  wasm_status: ActorMethod<[], WasmStatus>;
}

// IDL factory for the service interface
export const idlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const HttpRequest = IDL.Record({
    url: IDL.Text,
    method: IDL.Text,
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  });
  const HttpResponse = IDL.Record({
    body: IDL.Vec(IDL.Nat8),
    headers: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    status_code: IDL.Nat16,
  });
  const ManageAlternativeOriginsArg = IDL.Variant({
    Add: IDL.Text,
    Remove: IDL.Text,
  });
  const ManageAlternativeOriginsResult = IDL.Variant({
    Ok: IDL.Null,
    Err: IDL.Text,
  });
  const ManageIIPrincipalArg = IDL.Variant({
    Get: IDL.Null,
    Set: IDL.Principal,
  });
  const ManageIIPrincipalResult = IDL.Variant({
    Ok: IDL.Principal,
    Err: IDL.Text,
  });
  const WasmStatus = IDL.Record({
    memo: IDL.Opt(IDL.Text),
    name: IDL.Text,
    version: IDL.Nat16,
  });
  return IDL.Service({
    http_request: IDL.Func([HttpRequest], [HttpResponse], ['query']),
    manage_alternative_origins: IDL.Func(
      [ManageAlternativeOriginsArg],
      [ManageAlternativeOriginsResult],
      []
    ),
    manage_ii_principal: IDL.Func(
      [ManageIIPrincipalArg],
      [ManageIIPrincipalResult],
      []
    ),
    wasm_status: IDL.Func([], [WasmStatus], ['query']),
  });
};

// Note: init is intentionally omitted as this library does not instantiate the canister with init args
