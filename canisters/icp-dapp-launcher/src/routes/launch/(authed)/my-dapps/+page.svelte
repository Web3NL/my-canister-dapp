<script lang="ts">
  import CreatedCanistersList from '$lib/components/my-dapps/CreatedCanistersList.svelte';
  import ActiveDemosList from '$lib/components/my-dapps/ActiveDemosList.svelte';
  import { Card } from '@dfinity/gix-components';
</script>

<svelte:head>
  <title>My Dapps - My Canister Dapp</title>
</svelte:head>

<a href="/launch/create" class="launch-link">
  <Card>
    <h3>Launch a Dapp</h3>
    <div class="launch-icon">+</div>
  </Card>
</a>

<ActiveDemosList />

<CreatedCanistersList />

<style>
  .launch-link {
    text-decoration: none;
    color: inherit;
    margin-bottom: 20px;
    display: block;
  }

  .launch-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    font-size: 48px;
    color: #666;
  }
</style>
