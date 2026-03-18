<script lang="ts">
  import { onMount } from 'svelte';
  import { MenuItem } from '@dfinity/gix-components';
  import { DEMOS_CANISTER_ID } from '$lib/constants/canisterIds';
  import { DemosApi } from '$lib/api/demos';
  import { isAdminStore } from '$lib/stores/admin';
  import { authStore } from '$lib/stores/auth';

  onMount(() => {
    if (!DEMOS_CANISTER_ID) return;

    return authStore.subscribe(async principal => {
      if (principal) {
        try {
          const api = await DemosApi.create();
          isAdminStore.set(await api.isAdmin());
        } catch {
          isAdminStore.set(false);
        }
      } else {
        isAdminStore.set(undefined);
      }
    });
  });
</script>

<MenuItem href="/launch" on:click>Home</MenuItem>
<MenuItem href="/launch/my-dapps" on:click>My Dapps</MenuItem>
<MenuItem href="/launch/dapp-store" on:click>Dapp Store</MenuItem>
{#if $isAdminStore}
  <MenuItem href="/launch/admin" on:click>Admin</MenuItem>
{/if}
<MenuItem href="/launch/faq" on:click>FAQ</MenuItem>
