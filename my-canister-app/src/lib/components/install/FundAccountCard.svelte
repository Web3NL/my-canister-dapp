<script lang="ts">
  import {
    Card,
    Copy,
    KeyValuePair,
    Value,
    Spinner,
  } from '@dfinity/gix-components';

  export let principalText: string;
  export let formattedBalance: string;
  export let showSpinner: boolean;
  export let disabled: boolean;
  export let onCreate: () => void;
</script>

<Card>
  <h3>Fund account</h3>

  <div class="keyVal">
    <KeyValuePair>
      <Value slot="key">{principalText}</Value>
      <Copy slot="value" value={principalText}></Copy>
    </KeyValuePair>
  </div>

  <div class="keyVal">
    <KeyValuePair>
      <Value slot="key">Balance</Value>
      <Value slot="value"
        >{formattedBalance}
        {#if showSpinner}<span class="spinner-container"
            ><Spinner size="small" inline={true} /></span
          >{/if}</Value
      >
    </KeyValuePair>
  </div>

  <button class="primary" on:click={onCreate} {disabled}>Create dApp</button>
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
