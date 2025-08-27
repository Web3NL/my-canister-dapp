#!/bin/bash

if ! dfx identity list | grep -q minter; then
    # If minter is not found, run the command
    dfx identity new minter
fi

export MINTER_ACCOUNT_ID=$(dfx ledger account-id --identity minter)
export DEFAULT_ACCOUNT_ID=$(dfx ledger account-id --identity ident-1)

dfx deploy icp-ledger --specified-id ryjl3-tyaaa-aaaaa-aaaba-cai --argument "
  (variant {
    Init = record {
      minting_account = \"$MINTER_ACCOUNT_ID\";
      initial_values = vec {
        record {
          \"$DEFAULT_ACCOUNT_ID\";
          record {
            e8s = 10_000_000_000 : nat64;
          };
        };
      };
      send_whitelist = vec {};
      transfer_fee = opt record {
        e8s = 10_000 : nat64;
      };
      token_symbol = opt \"LICP\";
      token_name = opt \"Local ICP\";
    }
  })
"

dfx deploy icp-index
dfx deploy fake-cmc
dfx deploy internet-identity