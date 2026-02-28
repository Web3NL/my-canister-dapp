<script lang="ts">
  import { onMount } from 'svelte';
  import { DemosApi, type ActiveDemo } from '$lib/api/demos';
  import { WasmRegistryApi, type WasmEntry } from '$lib/api/wasmRegistry';
  import { DEMOS_CANISTER_ID } from '$lib/constants/canisterIds';
  import {
    createFrontpageUrl,
    createDashboardUrl,
  } from '$lib/services/createdCanisters';
  import { Card, IconNorthEast, SkeletonText } from '@dfinity/gix-components';
  import { showErrorToast } from '$lib/utils/toast';

  let demos: ActiveDemo[] = [];
  let wasmEntries: Map<string, WasmEntry> = new Map();
  let loading = false;

  onMount(async () => {
    if (!DEMOS_CANISTER_ID) return;
    await loadDemos();
  });

  async function loadDemos() {
    loading = true;
    try {
      const demosApi = await DemosApi.create();
      demos = await demosApi.getMyDemos();

      // Fetch wasm metadata for each unique wasm_name
      const uniqueNames = [...new Set(demos.map(d => d.wasm_name))];
      const registryApi = await WasmRegistryApi.create();
      const entries = await Promise.all(
        uniqueNames.map(async name => {
          const entry = await registryApi.getWasmEntry(name);
          return [name, entry] as const;
        })
      );
      wasmEntries = new Map(
        entries.filter((e): e is [string, WasmEntry] => e[1] !== undefined)
      );
    } catch {
      showErrorToast('Failed to load active demos');
    }
    loading = false;
  }

  function formatExpiry(expiresAt: bigint): string {
    const now = BigInt(Date.now()) * 1_000_000n; // ms to ns
    const remaining = expiresAt - now;
    if (remaining <= 0n) return 'Expired';

    const hours = Number(remaining / 3_600_000_000_000n);
    const minutes = Number((remaining % 3_600_000_000_000n) / 60_000_000_000n);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  }
</script>

{#if DEMOS_CANISTER_ID}
  <div>
    <h2>Demo Dapps</h2>

    {#if loading}
      <Card>
        <SkeletonText />
        <SkeletonText />
      </Card>
    {:else if demos.length > 0}
      <div class="demo-grid">
        {#each demos as demo (demo.canister_id.toText())}
          {@const entry = wasmEntries.get(demo.wasm_name)}
          <Card>
            <h3>{demo.wasm_name}</h3>
            {#if entry?.description}
              <p class="description-subtitle">{entry.description}</p>
            {/if}
            {#if entry?.version}
              <p class="version-subtitle">Version {entry.version}</p>
            {/if}
            <p class="demo-expiry">{formatExpiry(demo.expires_at)}</p>
            <p class="demo-canister-id">
              {demo.canister_id.toText()}
            </p>
            <div class="demo-actions">
              <a
                href={createFrontpageUrl(demo.canister_id.toText())}
                target="_blank"
                rel="noopener noreferrer"
                class="btn"
              >
                Frontpage <IconNorthEast />
              </a>
              <a
                href={createDashboardUrl(demo.canister_id.toText())}
                target="_blank"
                rel="noopener noreferrer"
                class="btn"
              >
                Dashboard <IconNorthEast />
              </a>
            </div>
          </Card>
        {/each}
      </div>
    {:else}
      <Card>
        <p>No active demos</p>
      </Card>
    {/if}
  </div>
{/if}

<style>
  .demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .description-subtitle {
    font-size: var(--font-size-small);
    color: var(--description-color);
    margin: 0 0 var(--padding-0_5x) 0;
    font-style: italic;
  }

  .version-subtitle {
    font-size: var(--font-size-standard);
    color: var(--description-color);
    margin: 0 0 var(--padding-1x) 0;
  }

  .demo-expiry {
    color: #856404;
    font-weight: 500;
    font-size: var(--font-size-small);
  }

  .demo-canister-id {
    font-family: monospace;
    font-size: 0.8rem;
    color: var(--description-color);
    word-break: break-all;
  }

  .demo-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: var(--padding-1x);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    text-decoration: none;
    color: inherit;
    font-size: var(--font-size-small);
    transition:
      background-color 0.2s,
      border-color 0.2s;
  }

  .btn:hover {
    background-color: var(--primary-contrast-background);
    border-color: var(--primary-contrast);
  }
</style>
