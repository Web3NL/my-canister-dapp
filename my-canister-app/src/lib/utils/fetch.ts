import { WasmRegistryApi } from '$lib/api/wasmRegistry';

export type WasmSource =
  | { type: 'registry'; name: string }
  | { type: 'file'; data: Uint8Array }
  | { type: 'remote'; url: string };

export async function fetchWasmModule(source: WasmSource): Promise<Uint8Array> {
  switch (source.type) {
    case 'registry':
      return fetchDappWasmFromRegistry(source.name);
    case 'file':
      return source.data;
    case 'remote':
      return fetchWasmFromRemoteUrl(source.url);
  }
}

async function fetchDappWasmFromRegistry(name: string): Promise<Uint8Array> {
  const registryApi = await WasmRegistryApi.create();
  const wasmBytes = await registryApi.getWasmBytes(name);

  if (!wasmBytes) {
    throw new Error(`WASM '${name}' not found in registry`);
  }

  return wasmBytes;
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
