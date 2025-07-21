# Canister Creation Flow State Machine

SERVICE_PRINCIPAL: II Principal derived at a service like mycanister.app
DAPP_PRINCIPAL: II Principal derived at the Dapp domain https://canister-id.icp0.io

| Step | State                                             |
| ---- | ------------------------------------------------- |
| 1    | DEPOSIT TO SERVICE_PRINCIPAL                      |
| 2    | SEND_TO_CMC                                       |
| 3    | CREATE_CANISTER                                   |
| 4    | INSTALL DAPP WASM                                 |
| 5    | REMOTE_AUTH                                       |
| 6    | SET_II_PRINCIPAL WITH DAPP_PRINCIPAL              |
| 7    | SET_CONTROLLERS TO DAPP_PRINCIPAL and CANISTER-ID |
