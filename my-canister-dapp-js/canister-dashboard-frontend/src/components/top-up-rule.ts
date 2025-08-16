import { CanisterApi } from '../api/canister';
import { LedgerApi } from '../api/ledger';
import { canisterId } from '../utils';
import { formatIcpBalance } from '../helpers';
import {
  addEventListener,
  getElement,
  hideLoading,
  showError,
  showLoading,
} from '../dom';
import { NETWORK_ERROR_MESSAGE } from '../error';
import type {
  TopUpRule,
  CyclesAmount,
} from '$declarations/my-canister-dashboard.did.d.ts';

function isErrorResult(obj: unknown): obj is { Err: string } {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'Err' in obj &&
    typeof (obj as { Err?: unknown }).Err === 'string'
  );
}
function isTopUpRule(obj: unknown): obj is TopUpRule {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    !('error' in obj) &&
    'cycles_threshold' in obj &&
    'cycles_amount' in obj &&
    typeof (obj as { cycles_threshold?: unknown }).cycles_threshold !==
      'undefined' &&
    typeof (obj as { cycles_amount?: unknown }).cycles_amount !== 'undefined'
  );
}
function formatRule(rule: TopUpRule) {
  let interval = 'Unknown';

  const intervalObj = rule.interval;
  if (
    typeof intervalObj === 'object' &&
    intervalObj !== null &&
    !Array.isArray(intervalObj)
  ) {
    if ('Hourly' in intervalObj) interval = 'Hourly';
    else if ('Daily' in intervalObj) interval = 'Daily';
    else if ('Weekly' in intervalObj) interval = 'Weekly';
    else if ('Monthly' in intervalObj) interval = 'Monthly';
  }
  // Convert CyclesAmount variant to string
  function cyclesAmountToString(val: CyclesAmount): string {
    if (typeof val === 'object' && val !== null) {
      const keys = Object.keys(val);
      if (keys.length > 0 && typeof keys[0] === 'string' && keys[0] !== '') {
        const key = keys[0];
        return key.replace(/^_/, '').replace('_', '.').replace('T', 'T');
      }
    }
    return String(val);
  }
  if (isTopUpRule(rule)) {
    const thresholdStr = cyclesAmountToString(
      (rule as { cycles_threshold: CyclesAmount }).cycles_threshold
    );
    const amountStr = cyclesAmountToString(
      (rule as { cycles_amount: CyclesAmount }).cycles_amount
    );
    return `Interval: ${interval}\nThreshold: ${thresholdStr} cycles\nAmount: ${amountStr} cycles`;
  }
  if (
    typeof rule === 'object' &&
    'error' in rule &&
    typeof (rule as { error: string }).error === 'string'
  ) {
    return `Error: ${(rule as { error: string }).error}`;
  }
  return 'Invalid rule';
}

export class TopUpRuleManager {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  canisterApi: any;
  constructor() {
    this.canisterApi = new CanisterApi();
  }

  async create() {
    await this.fetchAndRender();
    // Minimal inline extra: show canister ICP balance and canister ID
    await this.renderCanisterInfo();
    this.attachEventListeners();
  }

  private async renderCanisterInfo(): Promise<void> {
    try {
      const [cid, bal] = await Promise.all([
        canisterId(),
        new LedgerApi().canisterBalance(),
      ]);
      const cidText = cid.toString();
      const formatted = formatIcpBalance(bal);
      const idEl = getElement('canister-id');
      idEl.textContent = cidText;
      const balEl = getElement('canister-icp-balance');
      balEl.textContent = formatted;
    } catch {
      // Non-fatal for dashboard; keep silent to avoid duplicate error banners
    }
  }

  attachEventListeners() {
    addEventListener('top-up-rule-set', 'click', () => this.handleSet());
    addEventListener('top-up-rule-clear', 'click', () => this.handleClear());
  }

  async fetchAndRender() {
    try {
      const res = await this.canisterApi.manageTopUpRule({ Get: null });
      this.render(res);
    } catch {
      showError(NETWORK_ERROR_MESSAGE);
    }
  }

  render(result: { Ok?: TopUpRule[]; Err?: string }) {
    const display = getElement('top-up-rule-display');
    if ('Ok' in result && Array.isArray(result.Ok)) {
      if (result.Ok.length === 0 || result.Ok[0] === undefined) {
        display.textContent = 'No rule set';
      } else {
        display.textContent = '';
        const pre = document.createElement('pre');
        pre.textContent = formatRule(result.Ok[0] as TopUpRule);
        display.appendChild(pre);
      }
    } else if (isErrorResult(result)) {
      showError(result.Err);
    } else {
      display.textContent = 'Unknown result';
    }
  }

  async handleSet() {
    const intervalElem = getElement('top-up-rule-interval');
    let intervalValue = '';
    if (intervalElem instanceof HTMLSelectElement) {
      intervalValue = intervalElem.value;
    }

    const thresholdSelect = getElement('top-up-rule-threshold');
    const amountSelect = getElement('top-up-rule-amount');
    const thresholdValue =
      thresholdSelect instanceof HTMLSelectElement ? thresholdSelect.value : '';
    const amountValue =
      amountSelect instanceof HTMLSelectElement ? amountSelect.value : '';

    if (!thresholdValue || !amountValue) {
      showError('Please select threshold and amount.');
      return;
    }

    let interval;
    if (intervalValue === 'Hourly') interval = { Hourly: null };
    else if (intervalValue === 'Daily') interval = { Daily: null };
    else if (intervalValue === 'Weekly') interval = { Weekly: null };
    else interval = { Monthly: null };

    // Build CyclesAmount variant
    const threshold = { [thresholdValue]: null } as CyclesAmount;
    const amount = { [amountValue]: null } as CyclesAmount;

    showLoading();
    try {
      const result = await this.canisterApi.manageTopUpRule({
        Add: {
          interval,
          cycles_threshold: threshold,
          cycles_amount: amount,
        },
      });

      if (result && typeof result === 'object') {
        if ('Ok' in result) {
          await this.fetchAndRender();
        } else if (isErrorResult(result)) {
          showError(result.Err);
        } else {
          showError('Unknown error');
        }
      } else {
        showError('Unknown error');
      }
    } catch {
      showError(NETWORK_ERROR_MESSAGE);
    } finally {
      hideLoading();
    }
  }

  async handleClear() {
    showLoading();
    try {
      const result = await this.canisterApi.manageTopUpRule({ Clear: null });

      if (result && typeof result === 'object') {
        if ('Ok' in result) {
          await this.fetchAndRender();
        } else if ('Err' in result && typeof result.Err === 'string') {
          showError(result.Err);
        } else {
          showError('Unknown error');
        }
      } else {
        showError('Unknown error');
      }
    } catch {
      showError(NETWORK_ERROR_MESSAGE);
    } finally {
      hideLoading();
    }
  }
}
