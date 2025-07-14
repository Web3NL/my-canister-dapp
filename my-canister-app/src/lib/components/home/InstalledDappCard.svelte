<script lang="ts">
  import { Card, Copy } from '@dfinity/gix-components';

  export let name: string;
  export let dashboardUrl: string;
  export let transactionUrl: string;
</script>

<Card>
  <h4>{name}</h4>

  <div class="card-section">
    <h5 class="section-label">Dashboard</h5>
    <div class="url-row">
      <a href={dashboardUrl} target="_blank" class="url-link">{dashboardUrl}</a>
      <Copy value={dashboardUrl}></Copy>
    </div>
  </div>

  <div class="card-section">
    <h5 class="section-label">Installation tx</h5>
    <div class="url-row">
      <a href={transactionUrl} target="_blank" class="url-link"
        >{transactionUrl}</a
      >
      <Copy value={transactionUrl}></Copy>
    </div>
  </div>
</Card>

<style>
  .card-section {
    margin-bottom: var(--padding-3x);
  }

  .card-section:first-of-type {
    margin-top: var(--padding-2x);
  }

  .section-label {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-bold);
    margin: 0 0 var(--padding-0_5x) 0;
    color: var(--description-color);
  }

  .url-row {
    display: flex;
    align-items: center;
    gap: var(--padding);
  }

  .url-link {
    flex: 1;
    font-size: var(--font-size-small);
    word-break: break-all;
    text-decoration: none;
    color: var(--primary);
    line-height: var(--line-height-standard);
  }

  .url-link:hover {
    text-decoration: underline;
  }
</style>
