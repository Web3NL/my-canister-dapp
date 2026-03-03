<script lang="ts">
  import { Card } from '@dfinity/gix-components';
  import type { AccessCode, GenerateCodesResult } from '$lib/api/demos';

  export let accessCodes: AccessCode[];
  export let onGenerateCodes: (
    count: number
  ) => Promise<GenerateCodesResult | undefined>;

  let codeCount = 5;
  let generating = false;
  let generatedCodes: string[] | null = null;

  function getStatusLabel(code: AccessCode): string {
    if ('Available' in code.status) return 'Available';
    if ('Redeemed' in code.status) return 'Redeemed';
    if ('Expired' in code.status) return 'Expired';
    return 'Unknown';
  }

  function getStatusClass(code: AccessCode): string {
    if ('Available' in code.status) return 'status-available';
    if ('Redeemed' in code.status) return 'status-redeemed';
    if ('Expired' in code.status) return 'status-expired';
    return '';
  }

  function formatTimestamp(ns: bigint): string {
    return new Date(Number(ns / 1_000_000n)).toLocaleString();
  }

  async function handleGenerate() {
    generating = true;
    generatedCodes = null;
    const result = await onGenerateCodes(codeCount);
    if (result && 'Ok' in result) {
      generatedCodes = result.Ok;
    }
    generating = false;
  }

  $: sortedCodes = [...accessCodes].sort((a, b) => {
    const order: Record<string, number> = {
      Available: 0,
      Redeemed: 1,
      Expired: 2,
    };
    const aOrder = order[getStatusLabel(a)] ?? 3;
    const bOrder = order[getStatusLabel(b)] ?? 3;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return Number(b.created_at - a.created_at);
  });
</script>

<section>
  <h2>Access Codes</h2>

  <Card>
    <h3>Generate New Codes</h3>
    <div class="generate-form">
      <label for="code-count">Count:</label>
      <input
        id="code-count"
        type="number"
        min="1"
        max="100"
        bind:value={codeCount}
      />
      <button class="primary" on:click={handleGenerate} disabled={generating}>
        {generating ? 'Generating...' : 'Generate'}
      </button>
    </div>

    {#if generatedCodes}
      <div class="generated-codes">
        <h4>Generated Codes:</h4>
        <pre>{generatedCodes.join('\n')}</pre>
      </div>
    {/if}
  </Card>

  {#if sortedCodes.length > 0}
    <div class="codes-table-wrapper">
      <table class="codes-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Status</th>
            <th>Created</th>
            <th>Redeemed</th>
          </tr>
        </thead>
        <tbody>
          {#each sortedCodes as code (code.code)}
            <tr>
              <td class="code-cell"><code>{code.code}</code></td>
              <td
                ><span class="status-badge {getStatusClass(code)}"
                  >{getStatusLabel(code)}</span
                ></td
              >
              <td>{formatTimestamp(code.created_at)}</td>
              <td
                >{code.redeemed_at.length > 0 &&
                code.redeemed_at[0] !== undefined
                  ? formatTimestamp(code.redeemed_at[0])
                  : '-'}</td
              >
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <Card><p>No access codes generated yet.</p></Card>
  {/if}
</section>

<style>
  .generate-form {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .generate-form label {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-bold);
  }

  .generate-form input {
    width: 5rem;
    padding: 0.4rem 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: var(--font-size-small);
    background: var(--input-background);
    color: inherit;
  }

  .generated-codes {
    margin-top: var(--padding-1x);
  }

  .generated-codes pre {
    background: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: var(--padding-1x);
    font-size: var(--font-size-small);
    overflow-x: auto;
  }

  .codes-table-wrapper {
    overflow-x: auto;
    margin-top: 1rem;
  }

  .codes-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-small);
  }

  .codes-table th,
  .codes-table td {
    text-align: left;
    padding: var(--padding-0_5x) var(--padding-1x);
    border-bottom: 1px solid var(--border-color);
  }

  .codes-table th {
    font-weight: var(--font-weight-bold);
    color: var(--description-color);
  }

  .code-cell code {
    font-family: monospace;
    font-size: 0.85em;
  }

  .status-badge {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .status-available {
    background-color: rgba(40, 167, 69, 0.15);
    color: #28a745;
  }

  .status-redeemed {
    background-color: rgba(0, 123, 255, 0.15);
    color: #007bff;
  }

  .status-expired {
    background-color: rgba(108, 117, 125, 0.15);
    color: #6c757d;
  }
</style>
