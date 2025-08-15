<script lang="ts">
  import CreatedCanistersList from '$lib/components/my-dapps/CreatedCanistersList.svelte';
  import { Card } from '@dfinity/gix-components';
</script>

<svelte:head>
  <title>My Dapps - My Canister Dapp</title>
</svelte:head>

<a href="/install" class="install-link">
  <Card>
    <h3>Install a Dapp</h3>
    <div class="install-icon">+</div>
  </Card>
</a>

<CreatedCanistersList />

<style>
  .install-link {
    text-decoration: none;
    color: inherit;
    margin-bottom: 20px;
    display: block;
  }

  .install-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    font-size: 48px;
    color: #666;
  }
</style>
