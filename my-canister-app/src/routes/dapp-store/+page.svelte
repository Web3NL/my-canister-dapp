<script lang="ts">
  import DappCard from '$lib/components/dapp-store/DappCard.svelte';
  import { onMount } from 'svelte';
  import { REGISTRY_URL } from '$lib/constants';

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

  let dapps: WasmModule[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      const response = await fetch(REGISTRY_URL);
      if (!response.ok) {
        throw new Error(`Failed to load registry: ${response.statusText}`);
      }
      const registry = (await response.json()) as Registry;
      dapps = registry.wasm_modules;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load dapps';
    } finally {
      loading = false;
    }
  });
</script>

<h1>My dApp Store</h1>

{#if loading}
  <p>Loading dapps...</p>
{:else if error}
  <p class="error">Error: {error}</p>
{:else if dapps.length === 0}
  <p>No dapps available in the registry.</p>
{:else}
  <div class="dapp-grid">
    {#each dapps as dapp (dapp.id)}
      <DappCard
        id={dapp.id}
        name={dapp.name}
        version={dapp.version}
        memo={dapp.memo}
      />
    {/each}
  </div>
{/if}

<style>
  .dapp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .error {
    color: red;
  }
</style>
