import { CanisterApi } from '../api/canister';
import {
  addEventListener,
  getElement,
  getInputValue,
  hideLoading,
  showError,
  showLoading,
} from '../dom';
import { NETWORK_ERROR_MESSAGE } from '../error';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatRule(rule: any) {
  let interval = 'Unknown';
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const intervalObj = rule.interval;
  if (
    intervalObj !== null &&
    typeof intervalObj === 'object' &&
    !Array.isArray(intervalObj)
  ) {
    if ('Hourly' in intervalObj) interval = 'Hourly';
    else if ('Daily' in intervalObj) interval = 'Daily';
    else if ('Weekly' in intervalObj) interval = 'Weekly';
    else if ('Monthly' in intervalObj) interval = 'Monthly';
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return `Interval: ${interval}, Threshold: ${rule.cycles_threshold} cycles, Amount: ${rule.cycles_amount} cycles`;
}

export class TopUpRuleManager {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  canisterApi: any;
  constructor() {
    this.canisterApi = new CanisterApi();
  }

  async create() {
    await this.fetchAndRender();
    this.attachEventListeners();
  }

  attachEventListeners() {
    addEventListener('top-up-rule-set', 'click', () => this.handleSet());
    addEventListener('top-up-rule-clear', 'click', () => this.handleClear());
  }

  async fetchAndRender() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const res = await this.canisterApi.manageTopUpRule({ Get: null });
      this.render(res);
    } catch {
      showError(NETWORK_ERROR_MESSAGE);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render(result: any) {
    const display = getElement('top-up-rule-display');
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (result && typeof result === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if ('Ok' in result && Array.isArray(result.Ok)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (result.Ok.length === 0) {
          display.textContent = 'No rule set';
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          display.textContent = formatRule(result.Ok[0]);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      } else if ('Err' in result && typeof result.Err === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        showError(result.Err);
      } else {
        display.textContent = 'Unknown result';
      }
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
    const thresholdStr = getInputValue('top-up-rule-threshold');
    const amountStr = getInputValue('top-up-rule-amount');

    if (!thresholdStr || !amountStr) {
      showError('Please provide threshold and amount.');
      return;
    }

    let threshold, amount;
    try {
      threshold = BigInt(thresholdStr);
      amount = BigInt(amountStr);
      if (threshold < 0n || amount < 0n) throw new Error('negative');
    } catch {
      showError('Threshold and amount must be non-negative integers.');
      return;
    }

    let interval;
    if (intervalValue === 'Hourly') interval = { Hourly: null };
    else if (intervalValue === 'Daily') interval = { Daily: null };
    else if (intervalValue === 'Weekly') interval = { Weekly: null };
    else interval = { Monthly: null };

    showLoading();
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await this.canisterApi.manageTopUpRule({
        Add: {
          interval,
          cycles_threshold: threshold,
          cycles_amount: amount,
        },
      });
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (result && typeof result === 'object') {
        if ('Ok' in result) {
          await this.fetchAndRender();
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        } else if ('Err' in result && typeof result.Err === 'string') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await this.canisterApi.manageTopUpRule({ Clear: null });
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (result && typeof result === 'object') {
        if ('Ok' in result) {
          await this.fetchAndRender();
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        } else if ('Err' in result && typeof result.Err === 'string') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
