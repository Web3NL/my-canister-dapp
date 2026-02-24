export const idlFactory = ({ IDL }) => {
  const WasmEntry = IDL.Record({
    name: IDL.Text,
    description: IDL.Text,
    created_at: IDL.Nat64,
    version: IDL.Text,
    wasm_hash: IDL.Text,
    wasm_size: IDL.Nat64,
  });
  const RemoveWasmResult = IDL.Variant({ Ok: IDL.Null, Err: IDL.Text });
  const UploadWasmArg = IDL.Record({
    name: IDL.Text,
    description: IDL.Text,
    wasm_bytes: IDL.Vec(IDL.Nat8),
    version: IDL.Text,
  });
  const UploadWasmResult = IDL.Variant({ Ok: WasmEntry, Err: IDL.Text });
  return IDL.Service({
    get_wasm_bytes: IDL.Func(
      [IDL.Text],
      [IDL.Opt(IDL.Vec(IDL.Nat8))],
      ['query']
    ),
    get_wasm_entry: IDL.Func([IDL.Text], [IDL.Opt(WasmEntry)], ['query']),
    get_wasm_version: IDL.Func(
      [IDL.Text, IDL.Text],
      [IDL.Opt(WasmEntry)],
      ['query']
    ),
    list_versions: IDL.Func([IDL.Text], [IDL.Vec(WasmEntry)], ['query']),
    list_wasms: IDL.Func([], [IDL.Vec(WasmEntry)], ['query']),
    remove_wasm: IDL.Func([IDL.Text], [RemoveWasmResult], []),
    upload_wasm: IDL.Func([UploadWasmArg], [UploadWasmResult], []),
  });
};
export const init = ({ IDL }) => {
  return [];
};
