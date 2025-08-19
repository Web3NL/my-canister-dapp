<script lang="ts">
  import {
    Card,
    Copy,
    KeyValuePair,
    Value,
    Spinner,
  } from '@dfinity/gix-components';

  export let principalText: string;
  export let minimumBalance: string;
  export let formattedBalance: string;
  export let showSpinner: boolean;
  export let disabled: boolean;
  export let onCreate: () => void;
</script>

<Card>
  <h3>Fund account</h3>

  <p>
    Deposit at least {minimumBalance} ICP to cover
    <a
      href="https://internetcomputer.org/docs/defi/token-ledgers/cycles-ledger#fees"
      target="_blank"
      rel="noopener noreferrer">canister creation fee</a
    >
  </p>

  <div class="keyVal" id="principal">
    <KeyValuePair>
      {#snippet key()}
        <Value>{principalText}</Value>
      {/snippet}
      {#snippet value()}
        <Copy value={principalText} />
      {/snippet}
    </KeyValuePair>
  </div>

  <div class="keyVal">
    <KeyValuePair>
      {#snippet key()}
        <Value>Balance</Value>
      {/snippet}
      {#snippet value()}
        <Value>
          {formattedBalance}
          {#if showSpinner}
            <span class="spinner-container"
              ><Spinner size="small" inline={true} /></span
            >
          {/if}
        </Value>
      {/snippet}
    </KeyValuePair>
  </div>

  <button class="primary" on:click={onCreate} {disabled}>Create Dapp</button>
</Card>

<style>
  .keyVal {
    margin: 0rem 0 2rem 0;
  }

  .spinner-container {
    position: relative;
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-left: 8px;
  }
</style>
