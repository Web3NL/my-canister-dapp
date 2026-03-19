<script lang="ts">
  import { Card } from '@dfinity/gix-components';
  import type { ActiveDemo } from '$lib/api/demos';
  import {
    createFrontpageUrl,
    createDashboardUrl,
  } from '$lib/services/createdCanisters';

  export let activeDemos: ActiveDemo[];

  function formatTimestamp(ns: bigint): string {
    return new Date(Number(ns / 1_000_000n)).toLocaleString();
  }

  function formatExpiry(expiresAt: bigint): string {
    const now = BigInt(Date.now()) * 1_000_000n;
    const remaining = expiresAt - now;
    if (remaining <= 0n) return 'Expired';
    const hours = Number(remaining / 3_600_000_000_000n);
    const minutes = Number((remaining % 3_600_000_000_000n) / 60_000_000_000n);
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  function truncatePrincipal(p: { toText(): string }): string {
    const t = p.toText();
    return t.length > 15 ? `${t.slice(0, 7)}...${t.slice(-5)}` : t;
  }
</script>

<section>
  <h2>Active Demos ({activeDemos.length})</h2>

  {#if activeDemos.length > 0}
    <div class="demos-table-wrapper">
      <table class="demos-table">
        <thead>
          <tr>
            <th>Canister ID</th>
            <th>Links</th>
            <th>Wasm</th>
            <th>Code</th>
            <th>Service Principal</th>
            <th>Dapp Principal</th>
            <th>Started</th>
            <th>Expires</th>
          </tr>
        </thead>
        <tbody>
          {#each activeDemos as demo (demo.canister_id.toText())}
            <tr>
              <td><code>{truncatePrincipal(demo.canister_id)}</code></td>
              <td class="links-cell">
                <a
                  href={createFrontpageUrl(demo.canister_id.toText())}
                  target="_blank"
                  rel="noopener noreferrer">Frontpage</a
                >
                <a
                  href={createDashboardUrl(demo.canister_id.toText())}
                  target="_blank"
                  rel="noopener noreferrer">Dashboard</a
                >
              </td>
              <td>{demo.wasm_name}</td>
              <td><code>{demo.access_code}</code></td>
              <td><code>{truncatePrincipal(demo.service_principal)}</code></td>
              <td><code>{truncatePrincipal(demo.dapp_principal)}</code></td>
              <td>{formatTimestamp(demo.started_at)}</td>
              <td>{formatExpiry(demo.expires_at)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <Card><p>No active demos.</p></Card>
  {/if}
</section>

<style>
  .demos-table-wrapper {
    overflow-x: auto;
  }

  .demos-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-small);
  }

  .demos-table th,
  .demos-table td {
    text-align: left;
    padding: var(--padding-0_5x) var(--padding-1x);
    border-bottom: 1px solid var(--border-color);
    white-space: nowrap;
  }

  .demos-table th {
    font-weight: var(--font-weight-bold);
    color: var(--description-color);
  }

  .links-cell {
    display: flex;
    gap: var(--padding-0_5x);
  }

  .links-cell a {
    font-size: var(--font-size-small);
    text-decoration: underline;
  }

  code {
    font-family: monospace;
    font-size: 0.85em;
  }
</style>
