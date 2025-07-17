<script lang="ts">
  import { Card } from '@dfinity/gix-components';

  export let frontPageUrl: string;
  export let dashboardUrl: string;

  function openDappFrontpage() {
    window.open(frontPageUrl, '_blank');
  }

  function openDashboard() {
    window.open(dashboardUrl, '_blank');
  }
</script>

<Card>
  <h3 slot="start">Good news</h3>
  <p>You are the sole controller of your Dapp!</p>
  <div class="final-buttons" slot="end">
    <button class="primary" on:click={openDappFrontpage}>Dapp frontpage</button>
    <button class="secondary" on:click={openDashboard}>Dapp Dashboard</button>
  </div>
</Card>

<style>
  .final-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
  }
</style>
