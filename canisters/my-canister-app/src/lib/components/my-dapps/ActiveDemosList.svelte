<script lang="ts">
  import { onMount } from 'svelte';
  import { DemosApi, type ActiveDemo } from '$lib/api/demos';
  import { DEMOS_CANISTER_ID } from '$lib/constants/canisterIds';
  import {
    createFrontpageUrl,
    createDashboardUrl,
  } from '$lib/services/createdCanisters';
  import { Card, SkeletonText } from '@dfinity/gix-components';
  import { showErrorToast } from '$lib/utils/toast';

  let demos: ActiveDemo[] = [];
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
          <Card>
            <h3>{demo.wasm_name}</h3>
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
                Dapp Frontpage
              </a>
              <a
                href={createDashboardUrl(demo.canister_id.toText())}
                target="_blank"
                rel="noopener noreferrer"
                class="btn"
              >
                Dashboard
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

  .demo-expiry {
    color: #856404;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .demo-canister-id {
    font-family: monospace;
    font-size: 0.8rem;
    color: #666;
    word-break: break-all;
  }

  .demo-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    text-decoration: none;
    color: inherit;
    font-size: 0.85rem;
  }

  .btn:hover {
    background-color: #f0f0f0;
  }
</style>
