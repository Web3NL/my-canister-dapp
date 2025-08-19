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
import { NETWORK_ERROR_MESSAGE } from '../error';
import type {
  ManageTopUpRuleResult,
  TopUpRule,
  CyclesAmount,
  TopUpInterval,
} from '@web3nl/my-canister-dashboard';

export class TopUpRuleManager {
  private api = new CanisterApi();
  async create() {
    await Promise.all([this.fetchAndRender(), this.renderCanisterInfo()]);
    this.attachEventListeners();
  }

  private async renderCanisterInfo(): Promise<void> {
    const canisterIdPrincipal = await canisterId();
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
    } catch {
      showError('TopUp' + NETWORK_ERROR_MESSAGE);
    }
  }

  render(result: ManageTopUpRuleResult) {
    if ('Err' in result) return showError('TopUpRule Error: ' + result.Err);
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
      return showError('Please select threshold and amount.');

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
    } catch {
      showError('TopUpError: ' + NETWORK_ERROR_MESSAGE);
    } finally {
      hideLoading();
    }
  }

  async handleClear() {
    showLoading();
    try {
      const res = await this.api.manageTopUpRule({ Clear: null });
      if ('Err' in res) return showError('TopUpRule Error: ' + res.Err);
      await this.fetchAndRender();
    } catch {
      showError('TopUpError: ' + NETWORK_ERROR_MESSAGE);
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

function buildCyclesAmount(variantKey: string): CyclesAmount {
  return { [variantKey]: null } as unknown as CyclesAmount;
}

function buildInterval(key: string): TopUpInterval {
  const allowed = new Set(['Hourly', 'Daily', 'Weekly', 'Monthly']);
  const safe = allowed.has(key) ? key : 'Monthly';
  return { [safe]: null } as unknown as TopUpInterval;
}
