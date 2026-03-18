<script lang="ts">
  import { Card, Checkbox } from '@dfinity/gix-components';

  export let onAgree: () => void;
  export let dappName: string | null = null;

  let checked = false;
</script>

<Card>
  <h3>Terms &amp; Disclaimer</h3>

  <p>
    {#if dappName}
      You are about to launch <strong>{dappName}</strong> as an Internet Computer
      canister.
    {:else}
      You are about to launch a custom dapp as an Internet Computer canister.
    {/if}
    Please read and accept the following disclaimer before proceeding.
  </p>

  <div class="disclaimer">
    <p>
      This software is provided <strong>&ldquo;as is&rdquo;</strong>, without
      warranty of any kind, express or implied, including but not limited to the
      warranties of merchantability, fitness for a particular purpose, and
      noninfringement.
    </p>
    <p>
      In no event shall the authors, contributors, or copyright holders be
      liable for any claim, damages, or other liability, whether in an action of
      contract, tort, or otherwise, arising from, out of, or in connection with
      the software or the use or other dealings in the software.
    </p>
    <p>By proceeding, you acknowledge that:</p>
    <ul>
      <li>
        You are solely responsible for any ICP tokens spent during canister
        creation.
      </li>
      <li>
        The launched dapp code is provided without any guarantee of correctness,
        security, or fitness for any purpose.
      </li>
      <li>
        You assume all risks associated with launching and running this canister
        on the Internet Computer.
      </li>
    </ul>
  </div>

  <div class="agree-checkbox">
    <Checkbox
      inputId="agree-terms"
      {checked}
      on:nnsChange={() => (checked = !checked)}
    >
      I have read and agree to the terms and disclaimer
    </Checkbox>
  </div>

  <button class="primary" on:click={onAgree} disabled={!checked}>
    Continue
  </button>
</Card>

<style>
  .disclaimer {
    margin: 1rem 0;
    padding: 1rem;
    border: 1px solid var(--input-border-color, #ccc);
    border-radius: var(--border-radius, 4px);
    background: var(--input-background, rgba(0, 0, 0, 0.05));
    font-size: 0.9rem;
    max-height: 200px;
    overflow-y: auto;
  }

  .disclaimer ul {
    padding-left: 1.5rem;
    margin: 0.5rem 0;
  }

  .disclaimer li {
    margin-bottom: 0.5rem;
  }

  .agree-checkbox {
    margin: 1rem 0 1.5rem 0;
  }
</style>
