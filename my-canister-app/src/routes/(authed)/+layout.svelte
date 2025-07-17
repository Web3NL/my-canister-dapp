<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import LoginBanner from '$lib/components/LoginBanner.svelte';
</script>

{#if $authStore}
  <slot />
{:else}
  <LoginBanner />
{/if}
