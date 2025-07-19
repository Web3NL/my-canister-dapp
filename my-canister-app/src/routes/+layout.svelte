<script lang="ts">
  import {
    Content,
    Layout,
    ThemeToggleButton,
    IconLogout,
    BusyScreen,
    Toasts,
  } from '@dfinity/gix-components';
  import Menu from '$lib/layout/Menu.svelte';
  import { authStore } from '$lib/stores/auth';

  const handleLogout = async () => {
    await authStore.logout();
  };
</script>

<BusyScreen />
<Toasts position="top" />

<Layout layout="split">
  <a href="/" slot="menu-logo" class="logo" aria-label="Go to homepage">
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
    <div slot="title"><ThemeToggleButton /></div>
    <button slot="toolbar-end" on:click={handleLogout}><IconLogout /></button>
    <div class="development-warning">
      <p>DEMO</p>
      <p>
        Dapps can be installed for small amounts of ICP but are useless in
        practice
      </p>
    </div>

    <main>
      <slot />
    </main>
  </Content>
</Layout>

<style lang="scss" global>
  @import '../../../node_modules/@dfinity/gix-components/dist/styles/global.scss';

  .development-warning {
    background-color: #ffcc00;
    color: #333;
    padding: 10px;
    text-align: center;
    font-weight: bold;
  }

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
