/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IDENTITY_PROVIDER?: string
  readonly VITE_DFXHOST?: string
  readonly VITE_HOSTNAME?: string
  readonly VITE_DASHBOARD_CANISTER_ID?: string
  readonly VITE_MY_HELLO_WORLD_CANISTER_ID?: string
  readonly VITE_MY_CANISTER_APP_CANISTER_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}