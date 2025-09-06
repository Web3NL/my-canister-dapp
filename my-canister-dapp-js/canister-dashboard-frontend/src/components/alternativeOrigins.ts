import { CanisterApi } from '../api/canister';
import {
  INVALID_ORIGIN_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  reportError,
  FAILED_ADD_ALT_ORIGIN_MESSAGE_PREFIX,
  UNKNOWN_ADD_ALT_ORIGIN_MESSAGE,
  FAILED_REMOVE_ALT_ORIGIN_MESSAGE_PREFIX,
  UNKNOWN_REMOVE_ALT_ORIGIN_MESSAGE,
} from '../error';
import { isValidOrigin } from '../utils';
import {
  getElement,
  addEventListener,
  showLoading,
  hideLoading,
  showError,
  getInputValue,
  clearInput,
} from '../dom';

const IC_UPDATE_CALL_DELAY = 3000;

interface AlternativeOriginsResponse {
  alternativeOrigins: string[];
}

export class AlternativeOriginsManager {
  private canisterApi: CanisterApi;

  private constructor() {
    this.canisterApi = new CanisterApi();
  }

  static async create(): Promise<AlternativeOriginsManager> {
    const instance = new AlternativeOriginsManager();
    await instance.initializeDisplay();
    instance.attachEventListeners();
    return instance;
  }

  private async initializeDisplay(): Promise<void> {
    const origins = await this.fetchAlternativeOrigins();
    const originsList = origins
      .map(origin => `<li class="data-display">${origin}</li>`)
      .join('');

    this.renderAlternativeOriginsContent(originsList);
  }

  private renderAlternativeOriginsContent(originsList: string): void {
    const alternativeOriginsList = getElement('alternative-origins-list');
    alternativeOriginsList.innerHTML = originsList;
  }

  private async fetchAlternativeOrigins(): Promise<string[]> {
    try {
      const response = await fetch('/.well-known/ii-alternative-origins');
      const data = (await response.json()) as AlternativeOriginsResponse;
      return data.alternativeOrigins;
    } catch (error) {
      reportError(NETWORK_ERROR_MESSAGE, error);
      return [];
    }
  }

  private attachEventListeners(): void {
    addEventListener('alternative-origin-add', 'click', () => this.handleAdd());
    addEventListener('alternative-origin-remove', 'click', () =>
      this.handleRemove()
    );
  }

  private async handleAdd(): Promise<void> {
    const origin = getInputValue('alternative-origin-input');
    if (!origin) return;

    if (!isValidOrigin(origin)) {
      showError(INVALID_ORIGIN_MESSAGE);
      clearInput('alternative-origin-input');
      return;
    }

    showLoading();

    try {
      const result = await this.canisterApi.manageAlternativeOrigins({
        Add: origin,
      });
      if ('Ok' in result) {
        await new Promise(resolve => setTimeout(resolve, IC_UPDATE_CALL_DELAY));
        await this.initializeDisplay();
        clearInput('alternative-origin-input');
      } else if ('Err' in result) {
        const err = (result as { Err: string }).Err;
        reportError(NETWORK_ERROR_MESSAGE + ` (${err})`);
      } else {
        reportError('Unknown error adding alternative origin');
        reportError(UNKNOWN_ADD_ALT_ORIGIN_MESSAGE);
      }
    } catch (e) {
      reportError(FAILED_ADD_ALT_ORIGIN_MESSAGE_PREFIX, e);
    } finally {
      hideLoading();
    }
  }

  private async handleRemove(): Promise<void> {
    const origin = getInputValue('alternative-origin-input');
    if (!origin) return;

    showLoading();

    try {
      const result = await this.canisterApi.manageAlternativeOrigins({
        Remove: origin,
      });
      if ('Ok' in result) {
        await new Promise(resolve => setTimeout(resolve, IC_UPDATE_CALL_DELAY));
        await this.initializeDisplay();
        clearInput('alternative-origin-input');
      } else if ('Err' in result) {
        const err = (result as { Err: string }).Err;
        reportError(NETWORK_ERROR_MESSAGE + ` (${err})`);
      } else {
        reportError('Unknown error removing alternative origin');
        reportError(UNKNOWN_REMOVE_ALT_ORIGIN_MESSAGE);
      }
    } catch (e) {
      reportError(FAILED_REMOVE_ALT_ORIGIN_MESSAGE_PREFIX, e);
    } finally {
      hideLoading();
    }
  }
}
