import { LedgerApi } from '../api/ledger';
import { CMCApi } from '../api/cmc';
import { formatIcpBalance, principalToSubaccount } from '../helpers';
import { ICP_TX_FEE, TPUP_MEMO, CMC_CANISTER_ID } from '../constants';
import { canisterId } from '../utils';
import { StatusManager } from './status';
import { Principal } from '@icp-sdk/core/principal';
import {
  INSUFFICIENT_BALANCE_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  reportError,
} from '../error';
import {
  updateBalanceDisplay,
  showLoading,
  hideLoading,
  showError,
  addEventListener,
  updateIcrc1AccountDisplay,
} from '../dom';
import { AuthManager } from './auth';

export class TopupManager {
  private constructor() {
    // Private constructor to enforce use of static create method
  }

  static async create(): Promise<TopupManager> {
    const instance = new TopupManager();
    await instance.fetchAndRenderBalance();
    instance.attachEventListeners();
    return instance;
  }

  private async fetchAndRenderBalance(): Promise<void> {
    const ledgerApi = new LedgerApi();
    const balance = await ledgerApi.balance();
    const formattedBalance = formatIcpBalance(balance);

    updateBalanceDisplay(formattedBalance);

    const authManager = await AuthManager.create();
    const principal = await authManager.getPrincipal();
    updateIcrc1AccountDisplay(principal.toText());
  }

  private attachEventListeners(): void {
    addEventListener('top-up-btn', 'click', () => this.performTopUp());
    addEventListener('refresh-balance-btn', 'click', () =>
      this.refreshBalance()
    );
  }

  private async refreshBalance(): Promise<void> {
    showLoading();
    try {
      await this.fetchAndRenderBalance();
    } catch (e) {
      reportError(NETWORK_ERROR_MESSAGE, e);
    } finally {
      hideLoading();
    }
  }

  private async performTopUp(): Promise<void> {
    showLoading();
    try {
      const hasEnoughBalance = await this.checkBalanceForTopUp();
      if (!hasEnoughBalance) {
        showError(INSUFFICIENT_BALANCE_MESSAGE);
        return;
      }

      const ledgerApi = new LedgerApi();
      const balance = await ledgerApi.balance();
      const transferAmount = balance - ICP_TX_FEE;

      const blockHeight = await this.transferToCMC(transferAmount);

      const cmcApi = new CMCApi();
      const canisterIdPrincipal = canisterId();
      const canisterIdString = canisterIdPrincipal.toString();
      await cmcApi.notifyTopUp(canisterIdString, blockHeight);

      await this.updateBalanceAndStatus();
    } catch (e) {
      reportError(NETWORK_ERROR_MESSAGE, e);
    } finally {
      hideLoading();
    }
  }

  private async updateBalanceAndStatus(): Promise<void> {
    // Force a refresh so we don't use stale status cache after top-up
    await StatusManager.refresh();
    await this.fetchAndRenderBalance();
  }

  private async checkBalanceForTopUp(): Promise<boolean> {
    const ledgerApi = new LedgerApi();
    const balance = await ledgerApi.balance();

    const minimumBalance = ICP_TX_FEE * 2n;

    return balance >= minimumBalance;
  }

  private async transferToCMC(amount: bigint): Promise<bigint> {
    const ledgerApi = new LedgerApi();

    const canisterIdPrincipal = canisterId();
    const subaccount = principalToSubaccount(canisterIdPrincipal);

    const cmcPrincipal = Principal.fromText(CMC_CANISTER_ID);
    const blockHeight = await ledgerApi.transfer(
      cmcPrincipal,
      subaccount,
      amount,
      TPUP_MEMO,
      ICP_TX_FEE
    );

    return blockHeight;
  }
}
