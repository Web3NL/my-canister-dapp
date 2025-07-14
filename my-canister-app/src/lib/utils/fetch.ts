import { REGISTRY_URL } from '../constants';

interface WasmModule {
  id: number;
  name: string;
  version: number;
  wasm_url: string;
  memo: string;
  created_at: string;
}

interface Registry {
  wasm_modules: WasmModule[];
}

export async function fetchDappWasmFromRegistry(
  id: number
): Promise<Uint8Array> {
  const response = await fetch(REGISTRY_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to load registry: ${response.status} ${response.statusText}`
    );
  }

  const registry = (await response.json()) as Registry;
  const wasmModule = registry.wasm_modules.find(module => module.id === id);

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
