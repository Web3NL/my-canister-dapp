<script>
  import { IconCanistersPage, PageBanner } from '@dfinity/gix-components';
  import { authStore } from '$lib/stores/auth';
</script>

<PageBanner>
  <IconCanistersPage slot="image" />
  <span slot="title">My Canister Dapp</span>

  <p slot="description">Login to install and manage Dapps</p>

  <button class="primary" slot="actions" on:click={authStore.login}
    >Connect with Internet Identity</button
  >
</PageBanner>
