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

  <a href={frontpageUrl} target="_blank" class="card-section-link">
    <div class="card-section">
      <div class="section-content">
        <h5 class="section-label">Dapp frontpage</h5>
        <div class="section-value">{frontpageUrl}</div>
      </div>
      <div class="link-icon">
        <IconNorthEast />
      </div>
    </div>
  </a>

  <a href={dashboardUrl} target="_blank" class="card-section-link">
    <div class="card-section">
      <div class="section-content">
        <h5 class="section-label">Dapp dashboard</h5>
        <div class="section-value">{dashboardUrl}</div>
      </div>
      <div class="link-icon">
        <IconNorthEast />
      </div>
    </div>
  </a>

  <a href={transactionUrl} target="_blank" class="card-section-link">
    <div class="card-section">
      <div class="section-content">
        <h5 class="section-label">Block id</h5>
        <div class="section-value">{blockId.toString()}</div>
      </div>
      <div class="link-icon">
        <IconNorthEast />
      </div>
    </div>
  </a>
</Card>

<style>
  .card-section-link {
    display: block;
    text-decoration: none;
    color: inherit;
    border-radius: 6px;
    transition: background-color 0.2s;
  }

  .card-section-link:hover {
    background-color: var(--primary-contrast-background);
  }

  .card-section-link:hover .card-section {
    border-color: var(--primary-contrast);
  }

  .card-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: var(--padding-1_5x);
    margin-bottom: var(--padding-1x);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .card-section:first-of-type {
    margin-top: var(--padding-1x);
  }

  .card-section:last-of-type {
    margin-bottom: 0;
  }

  .section-label {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-bold);
    margin: 0 0 var(--padding-0_25x) 0;
    color: var(--text-color);
  }

  .section-content {
    flex: 1;
    min-width: 0;
  }

  .section-value {
    font-size: var(--font-size-small);
    color: var(--description-color);
    word-break: break-all;
    line-height: var(--line-height-standard);
  }

  .link-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: var(--primary);
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
