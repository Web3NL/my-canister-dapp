<script lang="ts">
  import { Card, Spinner } from '@dfinity/gix-components';
  import { DemosApi } from '$lib/api/demos';
  import { showErrorToast } from '$lib/utils/toast';

  export let onCodeValidated: (code: string) => void;

  let codeInput = '';
  let validating = false;
  let isValid: boolean | null = null;

  function formatCodeInput(value: string): string {
    // Remove all non-alphanumeric characters
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    // Insert dashes every 4 characters
    const parts = clean.match(/.{1,4}/g) || [];
    return parts.join('-').slice(0, 14); // XXXX-XXXX-XXXX = 14 chars
  }

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    codeInput = formatCodeInput(input.value);
    input.value = codeInput;
    isValid = null; // Reset validation on change
  }

  async function handleValidate() {
    if (codeInput.length !== 14) {
      showErrorToast('Please enter a complete access code (XXXX-XXXX-XXXX)');
      return;
    }

    validating = true;
    isValid = null;

    try {
      const demosApi = await DemosApi.create();
      isValid = await demosApi.validateCode(codeInput);

      if (isValid) {
        onCodeValidated(codeInput);
      } else {
        showErrorToast('Invalid or already used access code');
      }
    } catch (err) {
      console.error('Failed to validate code', err);
      isValid = false;
      showErrorToast('Failed to validate access code');
    } finally {
      validating = false;
    }
  }
</script>

<Card>
  <h3>Enter Access Code</h3>
  <p>Enter an access code to try a dapp for free.</p>

  <div class="code-input-group">
    <input
      type="text"
      placeholder="XXXX-XXXX-XXXX"
      value={codeInput}
      on:input={handleInput}
      maxlength="14"
      class="code-input"
      class:valid={isValid === true}
      class:invalid={isValid === false}
    />

    <button
      class="primary"
      on:click={handleValidate}
      disabled={codeInput.length !== 14 || validating}
    >
      {#if validating}
        <Spinner size="small" inline={true} />
        Validating...
      {:else}
        Validate & Continue
      {/if}
    </button>
  </div>

  {#if isValid === true}
    <p class="validation-success">Access code is valid!</p>
  {:else if isValid === false}
    <p class="validation-error">Invalid or already used access code.</p>
  {/if}
</Card>

<style>
  .code-input-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 1rem 0;
  }

  .code-input {
    font-family: monospace;
    font-size: 1.25rem;
    text-align: center;
    letter-spacing: 0.15em;
    padding: 0.75rem;
    border: 2px solid #ccc;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .code-input.valid {
    border-color: #28a745;
  }

  .code-input.invalid {
    border-color: #dc3545;
  }

  .validation-success {
    color: #28a745;
    font-weight: 500;
    margin-top: 0.5rem;
  }

  .validation-error {
    color: #dc3545;
    font-weight: 500;
    margin-top: 0.5rem;
  }
</style>
