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

<MenuItem href="/" on:click>Home</MenuItem>
<MenuItem href="my-dapps" on:click>My Dapps</MenuItem>
<MenuItem href="/dapp-store" on:click>Dapp Store</MenuItem>
{#if $isAdminStore}
  <MenuItem href="/admin" on:click>Admin</MenuItem>
{/if}
<MenuItem href="/faq" on:click>FAQ</MenuItem>
