import { REGISTRY_URL } from '../constants';

interface WasmModule {
  id: number;
  name: string;
  version: number;
  wasm_url: string;
  memo: string;
}

interface Registry {
  canister_dapps: WasmModule[];
}

export type WasmSource =
  | { type: 'registry'; id: number }
  | { type: 'file'; data: Uint8Array }
  | { type: 'remote'; url: string };

export async function fetchWasmModule(source: WasmSource): Promise<Uint8Array> {
  switch (source.type) {
    case 'registry':
      return fetchDappWasmFromRegistry(source.id);
    case 'file':
      return source.data;
    case 'remote':
      return fetchWasmFromRemoteUrl(source.url);
  }
}

async function fetchDappWasmFromRegistry(id: number): Promise<Uint8Array> {
  const response = await fetch(REGISTRY_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to load registry: ${response.status} ${response.statusText}`
    );
  }

  const registry = (await response.json()) as Registry;
  const wasmModule = registry.canister_dapps.find(module => module.id === id);

  if (!wasmModule) {
    throw new Error(`WASM module with id ${id} not found in registry`);
  }

  const wasmResponse = await fetch(wasmModule.wasm_url);
  if (!wasmResponse.ok) {
    throw new Error(
      `Failed to fetch WASM: ${wasmResponse.status} ${wasmResponse.statusText}`
    );
  }

  const arrayBuffer = await wasmResponse.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

async function fetchWasmFromRemoteUrl(url: string): Promise<Uint8Array> {
  const wasmResponse = await fetch(url);
  if (!wasmResponse.ok) {
    throw new Error(
      `Failed to fetch WASM from ${url}: ${wasmResponse.status} ${wasmResponse.statusText}`
    );
  }

  const arrayBuffer = await wasmResponse.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}
