<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { ProgressSteps, busyStore } from '@dfinity/gix-components';
  import type { ProgressStep } from '@dfinity/gix-components';
  import { LedgerApi } from '$lib/api/ledgerIcp';
  import { formatIcpBalance } from '$lib/utils/format';
  import { Principal } from '@dfinity/principal';
  import {
    createNewCanister,
    installAndTakeControl,
  } from '$lib/flows/createCanister';
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { E8S_PER_TOKEN, MIN_CANISTER_CREATION_BALANCE } from '$lib/constants';
  import { createDashboardUrl } from '$lib/services/createdCanisters';
  import GoodNewsCard from '$lib/components/install/GoodNewsCard.svelte';
  import ConnectIICard from '$lib/components/install/ConnectIICard.svelte';
  import FundAccountCard from '$lib/components/install/FundAccountCard.svelte';

  const principalText = $authStore ? $authStore.toText() : '';
  const minimumBalance = (
    Number(MIN_CANISTER_CREATION_BALANCE) / Number(E8S_PER_TOKEN)
  ).toFixed(2);

  let formattedBalance = '0.00000000 ICP';
  let canisterPrincipal: Principal | null = null;
  let balanceTimer: ReturnType<typeof setInterval> | null = null;
  let currentBalance = BigInt(0);

  $: wasmId = $page.url.searchParams.get('id');
  $: wasmIdNumber = wasmId != null ? parseInt(wasmId, 10) : null;

  const CANISTER_STORAGE_KEY = 'pendingCanisterId';

  async function loadBalance() {
    const ledgerApi = await LedgerApi.create();
    currentBalance = await ledgerApi.balance();
    formattedBalance = formatIcpBalance(currentBalance);

    if (currentBalance >= MIN_CANISTER_CREATION_BALANCE) {
      if (balanceTimer) {
        clearInterval(balanceTimer);
        balanceTimer = null;
      }

      advanceToStep(2);
    }
  }

  function startBalanceTimer() {
    loadBalance();

    balanceTimer = setInterval(() => {
      loadBalance();
    }, 1000);
  }

  let steps: [ProgressStep, ...ProgressStep[]] = [
    {
      step: 'fund',
      text: 'Fund Account',
      state: 'in_progress',
    },
    {
      step: 'create',
      text: 'Create dApp on ICP',
      state: 'next',
    },
    {
      step: 'connect-ii',
      text: 'Connect II to dApp',
      state: 'next',
    },
    {
      step: 'complete',
      text: 'Complete',
      state: 'next',
    },
  ];

  $: currentStep =
    steps.findIndex(step => step.state === 'in_progress') + 1 || steps.length;

  function advanceToStep(targetStep: 2 | 3 | 4) {
    for (let i = 0; i < targetStep - 1; i++) {
      if (steps[i]) {
        steps[i]!.state = 'completed';
      }
    }

    if (targetStep === 4) {
      if (steps[targetStep - 1]) {
        steps[targetStep - 1]!.state = 'completed';
      }
    } else {
      if (steps[targetStep - 1]) {
        steps[targetStep - 1]!.state = 'in_progress';
      }
    }

    for (let i = targetStep; i < steps.length; i++) {
      if (steps[i]) {
        steps[i]!.state = 'next';
      }
    }

    steps = [...steps];
  }

  async function createCanister() {
    if (wasmIdNumber == null) {
      throw new Error('WASM ID is required');
    }

    busyStore.startBusy({
      initiator: 'create-canister',
      text: 'Keep window open. Creating dApp...',
    });

    canisterPrincipal = await createNewCanister(wasmIdNumber);

    if (browser) {
      localStorage.setItem(CANISTER_STORAGE_KEY, canisterPrincipal.toText());
    }

    advanceToStep(3);
    busyStore.stopBusy('create-canister');
  }

  async function takeControlOfCanister() {
    busyStore.startBusy({
      initiator: 'connect-ii',
      text: 'Keep window open. Installing and connecting II to dApp...',
    });

    await installAndTakeControl(canisterPrincipal!);

    if (browser) {
      localStorage.removeItem(CANISTER_STORAGE_KEY);
    }

    advanceToStep(4);
    busyStore.stopBusy('connect-ii');
  }

  onMount(() => {
    if (browser) {
      const storedCanisterId = localStorage.getItem(CANISTER_STORAGE_KEY);
      if (storedCanisterId != null) {
        canisterPrincipal = Principal.fromText(storedCanisterId);
        advanceToStep(3);
      }
    }

    startBalanceTimer();
  });

  onDestroy(() => {
    if (balanceTimer) {
      clearInterval(balanceTimer);
    }
  });
</script>

<h1>Install Web3 dApp</h1>
<div style="margin-bottom: 30px;">
  <ProgressSteps {steps} />
</div>

{#if currentStep === 1 || currentStep === 2}
  <FundAccountCard
    {principalText}
    {minimumBalance}
    {formattedBalance}
    showSpinner={balanceTimer !== null}
    disabled={currentBalance < MIN_CANISTER_CREATION_BALANCE}
    onCreate={createCanister}
  />
{:else if currentStep === 3}
  <ConnectIICard onConnect={takeControlOfCanister} />
{:else if currentStep === 4 && canisterPrincipal}
  <GoodNewsCard dashboardUrl={createDashboardUrl(canisterPrincipal.toText())} />
{/if}

<style>
</style>
