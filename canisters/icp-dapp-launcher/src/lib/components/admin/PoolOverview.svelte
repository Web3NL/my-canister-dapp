<script lang="ts">
  import { Card, SkeletonText } from '@dfinity/gix-components';
  import type { PoolStatus, DemosConfig, SelfStatus } from '$lib/api/demos';

  export let poolStatus: PoolStatus | null;
  export let config: DemosConfig | undefined;
  export let selfStatus: SelfStatus | null = null;

  const LOW_CYCLES_THRESHOLD = 5_000_000_000_000n; // 5T

  function formatDuration(ns: bigint): string {
    const hours = Number(ns / 3_600_000_000_000n);
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h`;
  }

  function formatCycles(cycles: bigint): string {
    const trillion = 1_000_000_000_000n;
    if (cycles >= trillion) {
      return `${(Number(cycles) / Number(trillion)).toFixed(1)}T`;
    }
    return cycles.toLocaleString();
  }
</script>

<section>
  <h2>Pool Overview</h2>
  {#if selfStatus}
    <Card>
      <div class="cycles-banner" class:low-cycles={selfStatus.cycles_balance < LOW_CYCLES_THRESHOLD}>
        <span class="cycles-label">Demos Canister Cycles</span>
        <span class="cycles-value">{formatCycles(selfStatus.cycles_balance)}</span>
        {#if selfStatus.cycles_balance < LOW_CYCLES_THRESHOLD}
          <span class="cycles-warning">Low balance — top up the demos canister</span>
        {/if}
      </div>
    </Card>
  {/if}

  {#if poolStatus}
    <div class="stats-grid">
      <Card>
        <div class="stat">
          <span class="stat-value">{poolStatus.available}</span>
          <span class="stat-label">Available</span>
        </div>
      </Card>
      <Card>
        <div class="stat">
          <span class="stat-value">{poolStatus.active}</span>
          <span class="stat-label">Active</span>
        </div>
      </Card>
    </div>
  {:else}
    <Card><SkeletonText /></Card>
  {/if}

  {#if config}
    <Card>
      <h3>Configuration</h3>
      <dl class="config-list">
        <dt>Trial Duration</dt>
        <dd>{formatDuration(config.trial_duration_ns)}</dd>
        <dt>Pool Target Size</dt>
        <dd>{config.pool_target_size}</dd>
        <dt>Cycles per Demo</dt>
        <dd>{formatCycles(config.cycles_per_demo_canister)}</dd>
        <dt>Installer Origin</dt>
        <dd><code>{config.installer_origin}</code></dd>
        <dt>Registry ID</dt>
        <dd><code>{config.wasm_registry_id.toText()}</code></dd>
      </dl>
    </Card>
  {/if}
</section>

<style>
  .cycles-banner {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--padding-1x) 0;
  }

  .cycles-label {
    font-size: var(--font-size-small);
    color: var(--description-color);
  }

  .cycles-value {
    font-size: 2rem;
    font-weight: var(--font-weight-bold);
  }

  .low-cycles .cycles-value {
    color: var(--negative-color, #ea6c6c);
  }

  .cycles-warning {
    font-size: var(--font-size-small);
    color: var(--negative-color, #ea6c6c);
    margin-top: var(--padding-0_5x);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--padding-1x) 0;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: var(--font-weight-bold);
  }

  .stat-label {
    font-size: var(--font-size-small);
    color: var(--description-color);
  }

  .config-list {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: var(--padding-0_5x) var(--padding-2x);
    margin: 0;
  }

  .config-list dt {
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-small);
  }

  .config-list dd {
    margin: 0;
    font-size: var(--font-size-small);
    word-break: break-all;
  }

  code {
    font-family: monospace;
    font-size: 0.85em;
  }
</style>
