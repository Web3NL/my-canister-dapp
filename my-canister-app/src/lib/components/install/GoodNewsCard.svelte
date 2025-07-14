<script lang="ts">
  import { Card } from '@dfinity/gix-components';
  import { goto } from '$app/navigation';

  export let dashboardUrl: string;

  function openDashboard() {
    window.open(dashboardUrl, '_blank');
  }

  function goToMyDapps() {
    goto('/');
  }
</script>

<Card>
  <h3>Good news</h3>
  <p>You are the sole owner of your dApp</p>
  <div class="final-buttons">
    <button class="primary" on:click={openDashboard}>Open my dApp</button>
    <button class="secondary" on:click={goToMyDapps}>My dApps</button>
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
