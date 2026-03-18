<script lang="ts">
  import {
    Content,
    Layout,
    ThemeToggleButton,
    IconLogout,
  } from '@dfinity/gix-components';
  import Menu from '$lib/layout/Menu.svelte';
  import { authStore } from '$lib/stores/auth';

  const handleLogout = async () => {
    await authStore.logout();
  };
</script>

<Layout layout="split">
  <a href="/launch" slot="menu-logo" class="logo" aria-label="Go to homepage">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="32"
      height="32"
    >
      <rect
        x="4"
        y="4"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        rx="2"
      />
      <circle cx="16" cy="16" r="3" fill="currentColor" />
    </svg>
  </a>
  <Menu slot="menu-items" />

  <Content>
    {#snippet title()}
      <ThemeToggleButton />
    {/snippet}
    {#snippet toolbarEnd()}
      <button on:click={handleLogout}><IconLogout /></button>
    {/snippet}

    <main>
      <slot />
    </main>
  </Content>
</Layout>

<style>
  .logo {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 100%;
    padding-left: var(--padding-4x);
    text-decoration: none;
    color: inherit;
  }
</style>
