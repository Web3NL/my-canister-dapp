<script lang="ts">
  import { Card } from '@dfinity/gix-components';

  export let onConnect: () => void;
</script>

<Card>
  <h3>Connect to II Dapp</h3>
  <p>Your Internet Identity will be the only controller of this Dapp</p>
  <button class="primary" on:click={onConnect}>Connect II to Dapp</button>
</Card>
