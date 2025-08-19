<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getCreateCanisterTransactions,
    getCreatedCanister,
    type CreatedCanister,
  } from '$lib/services/createdCanisters';
  import { Card, SkeletonText } from '@dfinity/gix-components';
  import { showErrorToast } from '$lib/utils/toast';
  import InstalledDappCard from './InstalledDappCard.svelte';

  let createdCanisters: CreatedCanister[] = [];
  let loading = false;

  onMount(async () => {
    await loadCanisters();
  });

  async function loadCanisters() {
    loading = true;
    try {
      const transactions = await getCreateCanisterTransactions();
      const canisterPromises = transactions.map(tx =>
        getCreatedCanister(tx.id)
      );
      const results = await Promise.allSettled(canisterPromises);
      createdCanisters = results
        .filter(
          (result): result is PromiseFulfilledResult<CreatedCanister> =>
            result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value)
        .sort((a, b) => Number(b.blockId - a.blockId));
    } catch {
      showErrorToast('Failed to load installed Dapps');
    }
    loading = false;
  }
</script>

<div>
  <h2>Installed Dapps</h2>

  {#if loading}
    <Card>
      <SkeletonText />
      <SkeletonText />
      <SkeletonText />
    </Card>
  {:else if createdCanisters.length > 0}
    <div class="dapp-grid">
      {#each createdCanisters as canister (canister.blockId)}
        <InstalledDappCard
          name={canister.name}
          version={canister.version}
          frontpageUrl={canister.frontpageUrl}
          dashboardUrl={canister.dashboardUrl}
          transactionUrl={canister.transactionUrl}
          blockId={canister.blockId}
          memo={canister.memo}
        />
      {/each}
    </div>
  {:else}
    <Card>
      <p>No installed Dapps found from transactions</p>
    </Card>
  {/if}
</div>

<style>
  .dapp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }
</style>
