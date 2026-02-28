<script lang="ts">
  import { onMount } from 'svelte';
  import { Card, SkeletonText } from '@dfinity/gix-components';
  import { DemosApi } from '$lib/api/demos';
  import type {
    PoolStatus,
    AccessCode,
    DemosConfig,
    GenerateCodesResult,
  } from '$lib/api/demos';
  import type { ActiveDemo } from '$lib/declarations/demos/demos.did.d.ts';
  import { isAdminStore } from '$lib/stores/admin';
  import { showErrorToast } from '$lib/utils/toast';
  import { busyStore } from '@dfinity/gix-components';
  import { DEMOS_CANISTER_ID } from '$lib/constants/canisterIds';
  import PoolOverview from '$lib/components/admin/PoolOverview.svelte';
  import AccessCodesSection from '$lib/components/admin/AccessCodesSection.svelte';
  import ActiveDemosSection from '$lib/components/admin/ActiveDemosSection.svelte';
  import AdminActions from '$lib/components/admin/AdminActions.svelte';

  let isAdmin: boolean | null = null;
  let loading = true;

  let poolStatus: PoolStatus | null = null;
  let config: DemosConfig | undefined = undefined;
  let accessCodes: AccessCode[] = [];
  let activeDemos: ActiveDemo[] = [];

  onMount(async () => {
    if (!DEMOS_CANISTER_ID) {
      isAdmin = false;
      loading = false;
      return;
    }

    try {
      const api = await DemosApi.create();
      const adminCheck = await api.isAdmin();
      isAdmin = adminCheck;
      isAdminStore.set(adminCheck);

      if (adminCheck) {
        await loadAllData();
      }
    } catch {
      isAdmin = false;
    }
    loading = false;
  });

  async function loadAllData() {
    try {
      const api = await DemosApi.create();
      const [ps, cfg, codes, demos] = await Promise.all([
        api.getPoolStatus(),
        api.getConfig(),
        api.listAccessCodes(),
        api.listActiveDemos(),
      ]);
      poolStatus = ps;
      config = cfg;
      accessCodes = codes;
      activeDemos = demos;
    } catch {
      showErrorToast('Failed to load admin data');
    }
  }

  async function handleGenerateCodes(
    count: number
  ): Promise<GenerateCodesResult | undefined> {
    busyStore.startBusy({
      initiator: 'generate-codes',
      text: 'Generating codes...',
    });
    try {
      const api = await DemosApi.create();
      const result = await api.generateAccessCodes(count);
      if ('Err' in result) {
        showErrorToast(result.Err);
      } else {
        accessCodes = await api.listAccessCodes();
      }
      return result;
    } catch {
      showErrorToast('Failed to generate access codes');
      return undefined;
    } finally {
      busyStore.stopBusy('generate-codes');
    }
  }

  async function handleReplenishPool() {
    busyStore.startBusy({
      initiator: 'replenish-pool',
      text: 'Replenishing pool...',
    });
    try {
      const api = await DemosApi.create();
      const result = await api.replenishPool();
      if ('Err' in result) {
        showErrorToast(result.Err);
      }
      poolStatus = await api.getPoolStatus();
    } catch {
      showErrorToast('Failed to replenish pool');
    } finally {
      busyStore.stopBusy('replenish-pool');
    }
  }

  async function handleReclaimExpired() {
    busyStore.startBusy({
      initiator: 'reclaim-expired',
      text: 'Reclaiming expired demos...',
    });
    try {
      const api = await DemosApi.create();
      const result = await api.reclaimExpired();
      if ('Err' in result) {
        showErrorToast(result.Err);
      }
      const [ps, demos] = await Promise.all([
        api.getPoolStatus(),
        api.listActiveDemos(),
      ]);
      poolStatus = ps;
      activeDemos = demos;
    } catch {
      showErrorToast('Failed to reclaim expired demos');
    } finally {
      busyStore.stopBusy('reclaim-expired');
    }
  }
</script>

<svelte:head>
  <title>Admin Dashboard - My Canister Dapp</title>
</svelte:head>

{#if loading}
  <h1>Admin Dashboard</h1>
  <Card><SkeletonText /><SkeletonText /><SkeletonText /></Card>
{:else if !isAdmin}
  <h1>Unauthorized</h1>
  <Card>
    <p>You do not have admin access to the demos canister.</p>
    <p class="hint">Contact the canister controller to be added as an admin.</p>
  </Card>
{:else}
  <h1>Admin Dashboard</h1>

  <PoolOverview {poolStatus} {config} />

  <AdminActions
    onReplenishPool={handleReplenishPool}
    onReclaimExpired={handleReclaimExpired}
  />

  <AccessCodesSection {accessCodes} onGenerateCodes={handleGenerateCodes} />

  <ActiveDemosSection {activeDemos} />
{/if}

<style>
  .hint {
    font-size: var(--font-size-small);
    color: var(--description-color);
  }
</style>
