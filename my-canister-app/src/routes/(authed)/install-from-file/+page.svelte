<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { ProgressSteps, busyStore } from '@dfinity/gix-components';
  import type { ProgressStep } from '@dfinity/gix-components';
  import { LedgerApi } from '$lib/api/ledgerIcp';
  import { formatIcpBalance } from '$lib/utils/format';
  import { Principal } from '@dfinity/principal';
  import {
    // createNewCanister,
    installAndTakeControl,
  } from '$lib/flows/createCanister';
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  // import { page } from '$app/stores';
  import { E8S_PER_TOKEN, MIN_CANISTER_CREATION_BALANCE } from '$lib/constants';
  import {
    createFrontpageUrl,
    createDashboardUrl,
  } from '$lib/services/createdCanisters';
  import GoodNewsCard from '$lib/components/install/GoodNewsCard.svelte';
  import ConnectIICard from '$lib/components/install/ConnectIICard.svelte';
  import FundAccountCard from '$lib/components/install/FundAccountCard.svelte';
  // import { goto } from '$app/navigation';
  import { hasSufficientBalanceForCanisterCreation } from '$lib/utils/balance';
  import {
    sendToCmc,
    createCanister as createCanisterHelper,
    installCodeToCanister,
  } from '$lib/flows/createCanister';

  const principalText = $authStore ? $authStore.toText() : '';
  const minimumBalance = (
    Number(MIN_CANISTER_CREATION_BALANCE) / Number(E8S_PER_TOKEN)
  ).toFixed(2);

  let formattedBalance = '0.00000000 ICP';
  let canisterPrincipal: Principal | null = null;
  let balanceTimer: ReturnType<typeof setInterval> | null = null;
  let currentBalance = BigInt(0);
  let wasmModule: Uint8Array = new Uint8Array();

  async function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && file.name.endsWith('.wasm.gz')) {
      const arrayBuffer = await file.arrayBuffer();
      wasmModule = new Uint8Array(arrayBuffer);
    }
  }

  // $: wasmId = $page.url.searchParams.get('id');
  // $: wasmIdNumber = wasmId != null ? parseInt(wasmId, 10) : null;

  // $: dappName = $page.url.searchParams.get('name');
  // $: dappNameText =
  //   dappName != null && dappName.length > 0 ? dappName.toString() : null;

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
      text: 'Create Dapp on ICP',
      state: 'next',
    },
    {
      step: 'connect-ii',
      text: 'Connect II to Dapp',
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
    // if (wasmIdNumber == null) {
    //   goto('/dapp-store');
    //   return;
    // }

    busyStore.startBusy({
      initiator: 'create-canister',
      text: 'Keep window open. Creating Dapp...',
    });

    canisterPrincipal = await createNewCanister();

    if (browser) {
      localStorage.setItem(CANISTER_STORAGE_KEY, canisterPrincipal.toText());
    }

    advanceToStep(3);
    busyStore.stopBusy('create-canister');
  }

  async function takeControlOfCanister() {
    busyStore.startBusy({
      initiator: 'connect-ii',
      text: 'Keep window open. Installing and connecting II to Dapp...',
    });

    await installAndTakeControl(canisterPrincipal!);

    if (browser) {
      localStorage.removeItem(CANISTER_STORAGE_KEY);
    }

    advanceToStep(4);
    busyStore.stopBusy('connect-ii');
  }

  export async function createNewCanister(): Promise<Principal> {
    const ledgerApi = await LedgerApi.create();
    const balance = await ledgerApi.balance();

    if (!hasSufficientBalanceForCanisterCreation(balance)) {
      throw new Error('Insufficient balance for canister creation');
    }

    // const wasmModule = await fetchDappWasmFromRegistry(wasmId);

    const blockIndex = await sendToCmc(balance);
    const canisterId = await createCanisterHelper(blockIndex);
    await installCodeToCanister(canisterId, wasmModule);

    return canisterId;
  }

  onMount(() => {
    // if (!wasmIdNumber || !dappNameText) {
    //   goto('/dapp-store');
    //   return;
    // }

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

<svelte:head>
  <title>Install from File - My Canister Dapp</title>
</svelte:head>

<h1>Install Dapp</h1>
<!-- <h3>{dappNameText}</h3> -->

<div class="file-picker">
  <label for="wasm-file">Select WASM file (.wasm.gz):</label>
  <input
    id="wasm-file"
    type="file"
    accept=".wasm.gz"
    on:change={handleFileSelect}
  />
</div>

<div id="progress-steps">
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
  <GoodNewsCard
    frontPageUrl={createFrontpageUrl(canisterPrincipal.toText())}
    dashboardUrl={createDashboardUrl(canisterPrincipal.toText())}
  />
{/if}

<style>
  .file-picker {
    margin: 1rem 0;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .file-picker label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .file-picker input[type='file'] {
    width: 100%;
  }

  #progress-steps {
    margin: 1rem 0 1rem 0;
  }
</style>
