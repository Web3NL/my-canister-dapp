<script lang="ts">
  import { Card } from '@dfinity/gix-components';
  import { goto } from '$app/navigation';

  export let name: string;
  export let description: string;
  export let version: string;

  async function handleInstall() {
    await goto(`/install?source=registry&name=${encodeURIComponent(name)}`);
  }
</script>

<Card>
  <h4>{name}</h4>
  <p class="description">{description}</p>
  <p class="version">Version: {version}</p>
  <button class="primary" on:click={handleInstall}>Install</button>
</Card>
