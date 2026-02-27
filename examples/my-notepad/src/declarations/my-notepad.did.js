export const idlFactory = ({ IDL }) => {
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'status_code' : IDL.Nat16,
  });
  const ManageAlternativeOriginsArg = IDL.Variant({
    'Add' : IDL.Text,
    'Remove' : IDL.Text,
  });
  const ManageAlternativeOriginsResult = IDL.Variant({
    'Ok' : IDL.Null,
    'Err' : IDL.Text,
  });
  const ManageIIPrincipalArg = IDL.Variant({
    'Get' : IDL.Null,
    'Set' : IDL.Principal,
  });
  const ManageIIPrincipalResult = IDL.Variant({
    'Ok' : IDL.Principal,
    'Err' : IDL.Text,
  });
  const TopUpInterval = IDL.Variant({
    'Hourly' : IDL.Null,
    'Weekly' : IDL.Null,
    'Daily' : IDL.Null,
    'Monthly' : IDL.Null,
  });
  const CyclesAmount = IDL.Variant({
    '_1T' : IDL.Null,
    '_2T' : IDL.Null,
    '_5T' : IDL.Null,
    '_10T' : IDL.Null,
    '_50T' : IDL.Null,
    '_0_5T' : IDL.Null,
    '_100T' : IDL.Null,
    '_0_25T' : IDL.Null,
  });
  const TopUpRule = IDL.Record({
    'interval' : TopUpInterval,
    'cycles_amount' : CyclesAmount,
    'cycles_threshold' : CyclesAmount,
  });
  const ManageTopUpRuleArg = IDL.Variant({
    'Add' : TopUpRule,
    'Get' : IDL.Null,
    'Clear' : IDL.Null,
  });
  const ManageTopUpRuleResult = IDL.Variant({
    'Ok' : IDL.Opt(TopUpRule),
    'Err' : IDL.Text,
  });
  const WasmStatus = IDL.Record({
    'memo' : IDL.Opt(IDL.Text),
    'name' : IDL.Text,
    'version' : IDL.Nat16,
  });
  const Note = IDL.Record({
    'id' : IDL.Nat32,
    'title' : IDL.Text,
    'content' : IDL.Text,
    'created_at' : IDL.Nat64,
    'updated_at' : IDL.Nat64,
    'color' : IDL.Text,
    'pinned' : IDL.Bool,
  });
  const AddNoteArg = IDL.Record({
    'title' : IDL.Text,
    'content' : IDL.Text,
    'color' : IDL.Opt(IDL.Text),
  });
  const AddNoteResult = IDL.Variant({
    'Ok' : Note,
    'Err' : IDL.Text,
  });
  const UpdateNoteArg = IDL.Record({
    'id' : IDL.Nat32,
    'title' : IDL.Opt(IDL.Text),
    'content' : IDL.Opt(IDL.Text),
    'color' : IDL.Opt(IDL.Text),
    'pinned' : IDL.Opt(IDL.Bool),
  });
  const UpdateNoteResult = IDL.Variant({
    'Ok' : Note,
    'Err' : IDL.Text,
  });
  const DeleteNoteResult = IDL.Variant({
    'Ok' : IDL.Null,
    'Err' : IDL.Text,
  });
  return IDL.Service({
    'add_note' : IDL.Func([AddNoteArg], [AddNoteResult], []),
    'delete_note' : IDL.Func([IDL.Nat32], [DeleteNoteResult], []),
    'get_notes' : IDL.Func([], [IDL.Vec(Note)], ['query']),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'manage_alternative_origins' : IDL.Func(
        [ManageAlternativeOriginsArg],
        [ManageAlternativeOriginsResult],
        [],
      ),
    'manage_ii_principal' : IDL.Func(
        [ManageIIPrincipalArg],
        [ManageIIPrincipalResult],
        [],
      ),
    'manage_top_up_rule' : IDL.Func(
        [ManageTopUpRuleArg],
        [ManageTopUpRuleResult],
        [],
      ),
    'update_note' : IDL.Func([UpdateNoteArg], [UpdateNoteResult], []),
    'wasm_status' : IDL.Func([], [WasmStatus], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
