import { CanisterApi } from '../api/canister';
import { INVALID_ORIGIN_MESSAGE, NETWORK_ERROR_MESSAGE } from '../error';
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
      showError(NETWORK_ERROR_MESSAGE);
      throw error;
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
    if (!origin) {
      throw new Error('Origin input is required');
    }

    if (!isValidOrigin(origin)) {
      showError(INVALID_ORIGIN_MESSAGE);
      clearInput('alternative-origin-input');
      return;
    }

    showLoading();

    const result = await this.canisterApi.manageAlternativeOrigins({
      Add: origin,
    });

    if ('Ok' in result) {
      await new Promise(resolve => setTimeout(resolve, IC_UPDATE_CALL_DELAY));
      await this.initializeDisplay();
      clearInput('alternative-origin-input');
    } else if ('Err' in result) {
      const err = (result as { Err: string }).Err;
      showError(NETWORK_ERROR_MESSAGE);
      throw new Error(`Failed to add alternative origin: ${err}`);
    } else {
      showError('Unknown error');
      throw new Error('Unknown error adding alternative origin');
    }

    hideLoading();
  }

  private async handleRemove(): Promise<void> {
    const origin = getInputValue('alternative-origin-input');
    if (!origin) {
      throw new Error('Origin input is required');
    }

    showLoading();

    const result = await this.canisterApi.manageAlternativeOrigins({
      Remove: origin,
    });

    if ('Ok' in result) {
      await new Promise(resolve => setTimeout(resolve, IC_UPDATE_CALL_DELAY));
      await this.initializeDisplay();
      clearInput('alternative-origin-input');
    } else if ('Err' in result) {
      const err = (result as { Err: string }).Err;
      showError(NETWORK_ERROR_MESSAGE);
      throw new Error(`Failed to remove alternative origin: ${err}`);
    } else {
      showError('Unknown error');
      throw new Error('Unknown error removing alternative origin');
    }

    hideLoading();
  }
}
