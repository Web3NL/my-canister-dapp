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
  import LoginBanner from '$lib/components/LoginBanner.svelte';
  import { authStore } from '$lib/stores/auth';

  const handleLogout = async () => {
    await authStore.logout();
  };
</script>

<BusyScreen />
<Toasts position="top" />

<Layout layout="split">
  <Menu slot="menu-items" />

  <Content>
    <div slot="title"><ThemeToggleButton /></div>
    <button slot="toolbar-end" on:click={handleLogout}><IconLogout /></button>

    <main>
      <div class="development-warning">
        <p>DEMO</p>
        <p>
          Dapps can be installed for small amounts of ICP but are useless in
          practice
        </p>
      </div>
      {#if !$authStore}
        <LoginBanner />
      {:else}
        <slot />
      {/if}
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
</style>
