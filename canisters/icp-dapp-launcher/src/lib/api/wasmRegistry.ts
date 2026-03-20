import type { ActorSubclass } from '@icp-sdk/core/agent';
import { HttpAgent, Actor } from '@icp-sdk/core/agent';
import { HOST } from '$lib/constants';
import { WASM_REGISTRY_CANISTER_ID } from '$lib/constants/canisterIds';
import { idlFactory } from '$lib/declarations/wasm-registry/wasm-registry.did.js';
import type {
  _SERVICE as WasmRegistryService,
  WasmEntry,
} from '$lib/declarations/wasm-registry/wasm-registry.did.d.ts';

export type { WasmEntry };

export class WasmRegistryApi {
  private actor: ActorSubclass<WasmRegistryService>;

  private constructor(actor: ActorSubclass<WasmRegistryService>) {
    this.actor = actor;
  }

  static async create(): Promise<WasmRegistryApi> {
    const agent = await HttpAgent.create({
      host: HOST,
      fetch: fetch.bind(globalThis),
      shouldFetchRootKey: !PROD,
    });

    const actor = Actor.createActor<WasmRegistryService>(idlFactory, {
      agent,
      canisterId: WASM_REGISTRY_CANISTER_ID,
    });

    return new WasmRegistryApi(actor);
  }

  async listWasms(): Promise<WasmEntry[]> {
    return await this.actor.list_wasms();
  }

  async getWasmEntry(name: string): Promise<WasmEntry | undefined> {
    const result = await this.actor.get_wasm_entry(name);
    return result.length > 0 ? result[0] : undefined;
  }

  async getWasmBytes(name: string): Promise<Uint8Array | undefined> {
    const result = await this.actor.get_wasm_bytes(name);
    if (result.length === 0) {
      return undefined;
    }
    const bytes = result[0];
    return bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  }
}
