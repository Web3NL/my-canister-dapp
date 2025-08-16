<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import {
    ProgressSteps,
    busyStore,
    toastsStore,
  } from '@dfinity/gix-components';
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

  const principalText = $authStore ? $authStore.toText() : '';
  let requiredBalanceE8s: bigint = 0n;
  let minimumBalance = '...';

  let formattedBalance = '0.00000000 ICP';
  let canisterPrincipal: Principal | null = null;
  let balanceTimer: ReturnType<typeof setInterval> | null = null;
  let currentBalance = BigInt(0);
  let balanceFetchFailedToastShown = false;
  let lowDepositWarnShown = false;

  $: wasmId = $page.url.searchParams.get('id');
  $: wasmIdNumber = wasmId != null ? parseInt(wasmId, 10) : null;

  $: dappName = $page.url.searchParams.get('name');
  $: dappNameText =
    dappName != null && dappName.length > 0 ? dappName.toString() : null;

  const CANISTER_STORAGE_KEY = 'pendingCanisterId';

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
          toastsStore.show({
            text: 'Balance too low.',
            level: 'warn',
          });
          lowDepositWarnShown = true;
        }
      }
    } catch (err) {
      console.error('Failed to fetch balance', err);
      if (!balanceFetchFailedToastShown) {
        toastsStore.show({
          text: 'Failed to fetch balance. Please file issue in GitHub.',
          level: 'error',
        });
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
      goto('/dapp-store');
      return;
    }

    busyStore.startBusy({
      initiator: 'create-canister',
      text: 'Keep window open. Creating Dapp...',
    });

    try {
      canisterPrincipal = await createNewCanister(wasmIdNumber);

      if (browser) {
        localStorage.setItem(CANISTER_STORAGE_KEY, canisterPrincipal.toText());
      }

      advanceToStep(3);
    } catch (err) {
      console.error('Failed to create canister', err);
      toastsStore.show({
        text: `Failed to create Dapp: Please file issue on GitHub`,
        level: 'error',
      });
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
      toastsStore.show({
        text: `Failed to create Dapp: Please file issue on GitHub`,
        level: 'error',
      });
    } finally {
      busyStore.stopBusy('connect-ii');
    }
  }

  onMount(async () => {
    if (!wasmIdNumber || !dappNameText) {
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
<h3>{dappNameText}</h3>
<div id="progress-steps">
  <ProgressSteps {steps} />
</div>

{#if currentStep === 1 || currentStep === 2}
  <FundAccountCard
    {principalText}
    {minimumBalance}
    {formattedBalance}
    showSpinner={balanceTimer !== null}
    disabled={requiredBalanceE8s === 0n || currentBalance < requiredBalanceE8s}
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
  #progress-steps {
    margin: 1rem 0 1rem 0;
  }
</style>
