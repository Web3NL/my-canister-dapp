/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IDENTITY_PROVIDER?: string
  readonly VITE_DFXHOST?: string
  readonly VITE_DFXHOSTNAME?: string
  readonly VITE_CANISTER_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}