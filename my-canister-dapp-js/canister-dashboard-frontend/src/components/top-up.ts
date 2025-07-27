import { LedgerApi } from '../api/ledger';
import { CMCApi } from '../api/cmc';
import { formatIcpBalance, principalToSubaccount } from '../helpers';
import { ICP_TX_FEE, TPUP_MEMO, CMC_CANISTER_ID } from '../constants';
import { canisterId } from '../utils';
import { StatusManager } from './status';
import { Principal } from '@dfinity/principal';
import { INSUFFICIENT_BALANCE_MESSAGE } from '../error';
import {
  updateBalanceDisplay,
  showLoading,
  hideLoading,
  showError,
  addEventListener,
} from '../dom';

export class TopupManager {
  async create(): Promise<void> {
    await this.fetchAndRenderBalance();
    this.attachEventListeners();
  }

  private async fetchAndRenderBalance(): Promise<void> {
    const ledgerApi = new LedgerApi();
    const balance = await ledgerApi.balance();
    const formattedBalance = formatIcpBalance(balance);

    updateBalanceDisplay(formattedBalance);
  }

  private attachEventListeners(): void {
    addEventListener('top-up-btn', 'click', () => this.performTopUp());
    addEventListener('refresh-balance-btn', 'click', () =>
      this.refreshBalance()
    );
  }

  private async refreshBalance(): Promise<void> {
    showLoading();
    await this.fetchAndRenderBalance();
    hideLoading();
  }

  private async performTopUp(): Promise<void> {
    showLoading();

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
    const canisterIdPrincipal = await canisterId();
    const canisterIdString = canisterIdPrincipal.toString();
    await cmcApi.notifyTopUp(canisterIdString, blockHeight);

    await this.updateBalanceAndStatus();

    hideLoading();
  }

  private async updateBalanceAndStatus(): Promise<void> {
    const statusManager = new StatusManager();
    await statusManager.create();
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

    const canisterIdPrincipal = await canisterId();
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
