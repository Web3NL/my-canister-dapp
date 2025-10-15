<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { ProgressSteps, busyStore } from '@dfinity/gix-components';
  import { showWarnToast, showErrorToast } from '$lib/utils/toast';
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
  import { E8S_PER_TOKEN } from '$lib/constants';
  import { calculateIcpNeededForCanisterCreation } from '$lib/utils/balance';
  import {
    createFrontpageUrl,
    createDashboardUrl,
  } from '$lib/services/createdCanisters';
  import GoodNewsCard from '$lib/components/install/GoodNewsCard.svelte';
  import ConnectIICard from '$lib/components/install/ConnectIICard.svelte';
  import FundAccountCard from '$lib/components/install/FundAccountCard.svelte';
  import { goto } from '$app/navigation';
  import { fetchWasmModule, type WasmSource } from '$lib/utils/fetch';

  const principalText = $authStore ? $authStore.toText() : '';
  let requiredBalanceE8s: bigint = 0n;
  let minimumBalance = '...';

  let formattedBalance = '0.00000000 ICP';
  let canisterPrincipal: Principal | null = null;
  let balanceTimer: ReturnType<typeof setInterval> | null = null;
  let currentBalance = BigInt(0);
  let balanceFetchFailedToastShown = false;
  let lowDepositWarnShown = false;

  // Installation mode detection
  type InstallMode = 'registry' | 'file' | 'remote';
  let installMode: InstallMode = 'registry';
  let wasmModule: Uint8Array | null = null;
  let wasmFetchError: string | null = null;

  $: wasmId = $page.url.searchParams.get('id');
  $: wasmIdNumber = wasmId != null ? parseInt(wasmId, 10) : null;

  $: dappName = $page.url.searchParams.get('name');
  $: dappNameText =
    dappName != null && dappName.length > 0 ? dappName.toString() : null;

  $: source = $page.url.searchParams.get('source');
  $: remoteUrl = $page.url.searchParams.get('url');

  const CANISTER_STORAGE_KEY = 'pendingCanisterId';

  async function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      wasmModule = null;
      return;
    }

    if (!file.name.endsWith('.wasm.gz')) {
      wasmFetchError = 'Please select a valid .wasm.gz file';
      wasmModule = null;
      showErrorToast('Please select a valid .wasm.gz file');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      wasmModule = new Uint8Array(arrayBuffer);
      wasmFetchError = null;
    } catch (err) {
      console.error('Failed to read file', err);
      wasmFetchError = 'Failed to read file';
      wasmModule = null;
      showErrorToast('Failed to read file');
    }
  }

  async function loadBalance() {
    try {
      const ledgerApi = await LedgerApi.create();
      currentBalance = await ledgerApi.balance();
      formattedBalance = formatIcpBalance(currentBalance);
      if (requiredBalanceE8s > 0n) {
        if (currentBalance >= requiredBalanceE8s) {
          if (balanceTimer) {
            clearInterval(balanceTimer);
            balanceTimer = null;
          }
          advanceToStep(2);
        } else if (!lowDepositWarnShown) {
          showWarnToast('Balance too low.');
          lowDepositWarnShown = true;
        }
      }
    } catch (err) {
      console.error('Failed to fetch balance', err);
      if (!balanceFetchFailedToastShown) {
        showErrorToast('Failed to fetch balance. Please file issue in GitHub.');
        balanceFetchFailedToastShown = true;
      }
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
    // targetStep is 1-based for the step the user is entering (or completing if 4)
    steps = steps.map((s, idx) => {
      const stepIndex = idx + 1; // 1-based
      let state: ProgressStep['state'];
      if (targetStep === 4) {
        // All steps completed
        state = 'completed';
      } else if (stepIndex < targetStep) {
        state = 'completed';
      } else if (stepIndex === targetStep) {
        state = 'in_progress';
      } else {
        state = 'next';
      }
      return { ...s, state };
    }) as typeof steps;
  }

  function setFailed(stepKey: 'fund' | 'create' | 'connect-ii') {
    steps = steps.map(s =>
      s.step === stepKey
        ? { ...s, state: 'failed' }
        : s.state === 'in_progress' && s.step !== stepKey
          ? { ...s, state: 'next' }
          : s
    ) as typeof steps;
  }

  async function createCanister() {
    if (!wasmModule) {
      showErrorToast('WASM module not loaded');
      return;
    }

    busyStore.startBusy({
      initiator: 'create-canister',
      text: 'Keep window open. Creating Dapp...',
    });

    try {
      canisterPrincipal = await createNewCanister(wasmModule);

      if (browser) {
        localStorage.setItem(CANISTER_STORAGE_KEY, canisterPrincipal.toText());
      }

      advanceToStep(3);
    } catch (err) {
      console.error('Failed to create canister', err);
      setFailed('create');
      showErrorToast('Failed to create Dapp: Please file issue on GitHub');
    } finally {
      busyStore.stopBusy('create-canister');
    }
  }

  async function takeControlOfCanister() {
    busyStore.startBusy({
      initiator: 'connect-ii',
      text: 'Keep window open. Installing and connecting II to Dapp...',
    });

    try {
      await installAndTakeControl(canisterPrincipal!);

      if (browser) {
        localStorage.removeItem(CANISTER_STORAGE_KEY);
      }

      advanceToStep(4);
    } catch (err) {
      console.error('Failed to install code / connect II', err);
      setFailed('connect-ii');
      showErrorToast('Failed to connect II: Please file issue on GitHub');
    } finally {
      busyStore.stopBusy('connect-ii');
    }
  }

  onMount(async () => {
    // Determine installation mode from URL parameters
    if (source === 'file') {
      installMode = 'file';
      if (!dappNameText) {
        showWarnToast('No dapp name provided in URL');
      }
      // For file mode, wasmModule will be set when user selects a file
    } else if (source === 'remote' && remoteUrl) {
      installMode = 'remote';
      if (!dappNameText) {
        showWarnToast('No dapp name provided in URL');
      }
      // Fetch WASM from remote URL
      try {
        const wasmSource: WasmSource = { type: 'remote', url: remoteUrl };
        wasmModule = await fetchWasmModule(wasmSource);
      } catch (err) {
        console.error('Failed to fetch WASM from remote URL', err);
        wasmFetchError =
          err instanceof Error ? err.message : 'Failed to fetch WASM';
        showErrorToast('Failed to fetch WASM from remote URL');
      }
    } else if (
      (source === 'registry' || source === null) &&
      wasmIdNumber &&
      dappNameText
    ) {
      // Support both ?source=registry&id=X&name=Y and ?id=X&name=Y (backward compatibility)
      installMode = 'registry';
      // Fetch WASM from registry
      try {
        const wasmSource: WasmSource = { type: 'registry', id: wasmIdNumber };
        wasmModule = await fetchWasmModule(wasmSource);
      } catch (err) {
        console.error('Failed to fetch WASM from registry', err);
        wasmFetchError =
          err instanceof Error ? err.message : 'Failed to fetch WASM';
        showErrorToast('Failed to fetch WASM from registry');
      }
    } else {
      // Invalid parameters, redirect to dapp store
      goto('/dapp-store');
      return;
    }

    requiredBalanceE8s = await calculateIcpNeededForCanisterCreation();
    minimumBalance = (
      Number(requiredBalanceE8s) / Number(E8S_PER_TOKEN)
    ).toFixed(8);

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
  <title>Install Dapp - My Canister Dapp</title>
</svelte:head>

<h1>Install Dapp</h1>
<h3>{dappNameText || 'Custom Dapp'}</h3>

{#if installMode === 'file'}
  <div class="file-picker">
    <label for="wasm-file">Select WASM file (.wasm.gz):</label>
    <input
      id="wasm-file"
      type="file"
      accept=".wasm.gz"
      on:change={handleFileSelect}
    />
    {#if wasmModule}
      <p class="success">File loaded successfully</p>
    {:else if wasmFetchError}
      <p class="error">{wasmFetchError}</p>
    {/if}
  </div>
{/if}

{#if installMode === 'remote'}
  <div class="remote-info">
    <p>Installing from remote URL: <code>{remoteUrl}</code></p>
    {#if wasmModule}
      <p class="success">WASM loaded successfully</p>
    {:else if wasmFetchError}
      <p class="error">{wasmFetchError}</p>
    {:else}
      <p>Loading WASM...</p>
    {/if}
  </div>
{/if}

<div id="progress-steps">
  <ProgressSteps {steps} />
</div>

{#if currentStep === 1 || currentStep === 2}
  <FundAccountCard
    {principalText}
    {minimumBalance}
    {formattedBalance}
    showSpinner={balanceTimer !== null}
    disabled={requiredBalanceE8s === 0n ||
      currentBalance < requiredBalanceE8s ||
      !wasmModule}
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

  .remote-info {
    margin: 1rem 0;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .remote-info code {
    word-break: break-all;
  }

  .success {
    color: green;
    margin-top: 0.5rem;
  }

  .error {
    color: red;
    margin-top: 0.5rem;
  }

  #progress-steps {
    margin: 1rem 0 1rem 0;
  }
</style>
