# Canister Creation Flow State Machine

| Step | State                       |
| ---- | --------------------------- |
| 1    | DEPOSIT                     |
| 2    | SEND_TO_CMC                 |
| 3    | CREATE_CANISTER             |
| 4    | MY-CANISTER-INSTALLER WASM  |
| 5    | REMOTE_AUTH                 |
| 6    | SET_II_PRINCIPAL            |
| 7    | TAKE_CONTROL                |
| 8    | Optional: INSTALL DAPP WASM |
