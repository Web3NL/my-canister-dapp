<script lang="ts">
  import { Card } from '@dfinity/gix-components';

  export let onReplenishPool: () => Promise<void>;
  export let onReclaimExpired: () => Promise<void>;
</script>

<section>
  <h2>Actions</h2>
  <Card>
    <div class="actions-row">
      <button class="primary" on:click={onReplenishPool}>
        Replenish Pool
      </button>
      <button class="secondary" on:click={onReclaimExpired}>
        Reclaim Expired
      </button>
    </div>
  </Card>
</section>

<style>
  .actions-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
</style>
