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
  return IDL.Service({
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
    'wasm_status' : IDL.Func([], [WasmStatus], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
