<script lang="ts">
  import { Card, IconNorthEast } from '@dfinity/gix-components';

  export let name: string;
  export let version: number;
  export let frontpageUrl: string;
  export let dashboardUrl: string;
  export let transactionUrl: string;
  export let blockId: bigint;
  export let memo: string | undefined = undefined;
</script>

<Card>
  <h4>{name}</h4>
  {#if memo}
    <p class="memo-subtitle">{memo}</p>
  {/if}
  <p class="version-subtitle">Version {version}</p>

  <div class="card-actions">
    <a
      class="btn"
      href={frontpageUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      Frontpage <IconNorthEast />
    </a>
    <a
      class="btn"
      href={dashboardUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      Dashboard <IconNorthEast />
    </a>
    <a
      class="btn"
      href={transactionUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      Block {blockId}
      <IconNorthEast />
    </a>
  </div>
</Card>

<style>
  .card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: var(--padding-1x);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    text-decoration: none;
    color: inherit;
    font-size: var(--font-size-small);
    transition:
      background-color 0.2s,
      border-color 0.2s;
  }

  .btn:hover {
    background-color: var(--primary-contrast-background);
    border-color: var(--primary-contrast);
  }

  .version-subtitle {
    font-size: var(--font-size-standard);
    color: var(--description-color);
    margin: 0 0 var(--padding-1x) 0;
  }

  .memo-subtitle {
    font-size: var(--font-size-small);
    color: var(--description-color);
    margin: 0 0 var(--padding-0_5x) 0;
    font-style: italic;
  }
</style>
