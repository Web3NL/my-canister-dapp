<script lang="ts">
  import DappCard from '$lib/components/dapp-store/DappCard.svelte';
  import { onMount } from 'svelte';
  import { WasmRegistryApi, type WasmEntry } from '$lib/api/wasmRegistry';

  let dapps: WasmEntry[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      const registryApi = await WasmRegistryApi.create();
      dapps = await registryApi.listWasms();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to load dapps';
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Dapp Store - My Canister Dapp</title>
</svelte:head>

<h1>Dapp Store</h1>

{#if loading}
  <p>Loading dapps...</p>
{:else if error}
  <p class="error">Error: {error}</p>
{:else if dapps.length === 0}
  <p>No dapps available in the registry.</p>
{:else}
  <div class="dapp-grid">
    {#each dapps as dapp (dapp.name)}
      <DappCard
        name={dapp.name}
        description={dapp.description}
        version={dapp.version}
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
