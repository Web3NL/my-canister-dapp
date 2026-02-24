import { CanisterApi } from '../api/canister';
import { LedgerApi } from '../api/ledger';
import { canisterId } from '../utils';
import { formatIcpBalance } from '../helpers';
import {
  addEventListener,
  hideLoading,
  showError,
  showLoading,
  updateCanisterInfo,
  updateTopUpRuleDisplay,
  getSelectValue,
} from '../dom';
import {
  NETWORK_ERROR_MESSAGE,
  reportError,
  TOP_UP_RULE_ERROR_PREFIX,
  TOP_UP_ERROR_PREFIX,
  SELECT_THRESHOLD_AMOUNT_MESSAGE,
} from '../error';
import type {
  ManageTopUpRuleResult,
  TopUpRule,
  CyclesAmount,
  TopUpInterval,
} from '@web3nl/my-canister-dashboard';

export class TopUpRuleManager {
  private api = new CanisterApi();

  private constructor() {
    // Private constructor to enforce use of static create method
  }

  static async create(): Promise<TopUpRuleManager> {
    const instance = new TopUpRuleManager();
    await Promise.all([
      instance.fetchAndRender(),
      instance.renderCanisterInfo(),
    ]);
    instance.attachEventListeners();
    return instance;
  }

  private async renderCanisterInfo(): Promise<void> {
    const canisterIdPrincipal = canisterId();
    const canisterBalance = await new LedgerApi().canisterBalance();
    const canisterIdText = canisterIdPrincipal.toString();
    const formattedCanisterBalance = formatIcpBalance(canisterBalance);
    updateCanisterInfo(canisterIdText, formattedCanisterBalance);
  }

  attachEventListeners() {
    addEventListener('top-up-rule-set', 'click', () => this.handleSet());
    addEventListener('top-up-rule-clear', 'click', () => this.handleClear());
  }

  async fetchAndRender() {
    try {
      this.render(await this.api.manageTopUpRule({ Get: null }));
    } catch (e) {
      reportError(NETWORK_ERROR_MESSAGE, e);
    }
  }

  render(result: ManageTopUpRuleResult) {
    if ('Err' in result)
      return showError(TOP_UP_RULE_ERROR_PREFIX + ' ' + result.Err);
    if ('Ok' in result) {
      const rule = result.Ok[0];
      updateTopUpRuleDisplay(rule ? formatRule(rule) : null);
    }
  }

  async handleSet() {
    const intervalValue = getSelectValue('top-up-rule-interval');
    const thresholdValue = getSelectValue('top-up-rule-threshold');
    const amountValue = getSelectValue('top-up-rule-amount');

    if (!thresholdValue || !amountValue)
      return showError(SELECT_THRESHOLD_AMOUNT_MESSAGE);

    showLoading();
    try {
      const res = await this.api.manageTopUpRule({
        Add: {
          interval: buildInterval(intervalValue),
          cycles_threshold: buildCyclesAmount(thresholdValue),
          cycles_amount: buildCyclesAmount(amountValue),
        },
      });
      if ('Err' in res) return showError(res.Err);
      await this.fetchAndRender();
    } catch (e) {
      reportError(TOP_UP_ERROR_PREFIX + ' ' + NETWORK_ERROR_MESSAGE, e);
    } finally {
      hideLoading();
    }
  }

  async handleClear() {
    showLoading();
    try {
      const res = await this.api.manageTopUpRule({ Clear: null });
      if ('Err' in res)
        return showError(TOP_UP_RULE_ERROR_PREFIX + ' ' + res.Err);
      await this.fetchAndRender();
    } catch (e) {
      reportError(TOP_UP_ERROR_PREFIX + ' ' + NETWORK_ERROR_MESSAGE, e);
    } finally {
      hideLoading();
    }
  }
}

function firstKey<T extends Record<string, unknown>>(
  obj: T | null | undefined
): string | undefined {
  if (!obj) return undefined;
  return Object.keys(obj)[0];
}

function formatCyclesAmount(ca: CyclesAmount): string {
  const key = firstKey(ca as Record<string, unknown>);
  if (!key) return 'Unknown';
  // Variant keys look like _0_5T, _1T etc.
  return key.replace(/^_/, '').replace('_', '.');
}

function formatInterval(interval: TopUpInterval): string {
  return firstKey(interval as Record<string, unknown>) || 'Unknown';
}

function formatRule(rule: TopUpRule): string {
  return [
    `Interval: ${formatInterval(rule.interval)}`,
    `Threshold: ${formatCyclesAmount(rule.cycles_threshold)} cycles`,
    `Amount: ${formatCyclesAmount(rule.cycles_amount)} cycles`,
  ].join('\n');
}

// Type-safe variant constructors
const CYCLES_AMOUNTS: Record<string, CyclesAmount> = {
  _0_25T: { _0_25T: null },
  _0_5T: { _0_5T: null },
  _1T: { _1T: null },
  _2T: { _2T: null },
  _5T: { _5T: null },
  _10T: { _10T: null },
  _50T: { _50T: null },
  _100T: { _100T: null },
};

const INTERVALS: Record<string, TopUpInterval> = {
  Hourly: { Hourly: null },
  Daily: { Daily: null },
  Weekly: { Weekly: null },
  Monthly: { Monthly: null },
};

function buildCyclesAmount(variantKey: string): CyclesAmount {
  const amount = CYCLES_AMOUNTS[variantKey];
  if (!amount) {
    throw new Error(`Invalid cycles amount: ${variantKey}`);
  }
  return amount;
}

function buildInterval(key: string): TopUpInterval {
  const interval = INTERVALS[key];
  if (!interval) {
    return { Monthly: null }; // Default fallback
  }
  return interval;
}
