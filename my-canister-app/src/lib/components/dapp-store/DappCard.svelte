<script lang="ts">
  import { Card } from '@dfinity/gix-components';
  import { goto } from '$app/navigation';

  export let id: number;
  export let name: string;
  export let version: number;
  export let memo: string;

  function handleInstall() {
    goto(`/install?id=${id}&name=${name}`);
  }
</script>

<Card>
  <h4>{name}</h4>
  <p class="memo">{memo}</p>
  <p class="version">Version: {version}</p>
  <button class="primary" on:click={handleInstall}>Install</button>
</Card>
