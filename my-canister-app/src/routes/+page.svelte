<script lang="ts">
  import {
    IconCanistersPage,
    PageBanner,
    IconProposalsPage,
    IconGitHub,
    Card,
  } from '@dfinity/gix-components';
  import { goto } from '$app/navigation';
</script>

<svelte:head>
  <title>My Canister Dapp - Fully owned decentralized apps</title>
</svelte:head>

<PageBanner>
  <IconCanistersPage slot="image" />
  <span slot="title">My Canister Dapp</span>
  <div slot="description">
    <h4>Fully owned decentralized apps</h4>
  </div>

  <div slot="actions" class="final-buttons">
    <button class="primary" on:click={() => goto('/dapp-store')}
      >Dapp Store</button
    >
    <button class="secondary" on:click={() => goto('/my-dapps')}>
      My Dapps
    </button>
  </div>
</PageBanner>

<div class="card-wrapper">
  <Card href="/faq">
    <div slot="start" class="card-start">
      <IconProposalsPage size="2rem" />
      <h3>FAQ</h3>
    </div>
  </Card>
</div>

<div class="card-wrapper">
  <Card href="https://github.com/Web3NL/my-canister-dapp">
    <div slot="start" class="card-start">
      <IconGitHub size="2rem" />
      <h3>GitHub</h3>
    </div>
  </Card>
</div>

<style>
  .card-wrapper {
    margin: 1.5rem auto;
    max-width: 400px;
    width: 100%;
    display: block;
  }

  .card-start {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
</style>
