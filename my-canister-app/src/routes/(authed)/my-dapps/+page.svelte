<script lang="ts">
  import CreatedCanistersList from '$lib/components/home/CreatedCanistersList.svelte';
  import { Card } from '@dfinity/gix-components';
</script>

<a
  href="/install"
  style="text-decoration: none; color: inherit; margin-bottom: 20px; display: block;"
>
  <Card>
    <h3>Install a Dapp</h3>
    <div
      style="display: flex; justify-content: center; align-items: center; height: 100px; font-size: 48px; color: #666;"
    >
      +
    </div>
  </Card>
</a>

<CreatedCanistersList />
