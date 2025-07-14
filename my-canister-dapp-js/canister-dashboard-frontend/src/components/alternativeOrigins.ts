import { CanisterApi } from '../api/canister';
import { showLoading, hideLoading } from '../loading';
import {
  showError,
  INVALID_ORIGIN_MESSAGE,
  isValidOrigin,
  NETWORK_ERROR_MESSAGE,
} from '../error';

const IC_UPDATE_CALL_DELAY = 3000;

interface AlternativeOriginsResponse {
  alternativeOrigins: string[];
}

export class AlternativeOriginsManager {
  private canisterApi: CanisterApi;

  constructor() {
    this.canisterApi = new CanisterApi();
  }

  async create(): Promise<void> {
    const origins = await this.fetchAlternativeOrigins();
    const originsList = origins
      .map(origin => `<li class="data-display">${origin}</li>`)
      .join('');

    this.renderAlternativeOriginsContent(originsList);
    this.attachEventListeners();
  }

  private renderAlternativeOriginsContent(originsList: string): void {
    const alternativeOriginsList = document.getElementById(
      'alternative-origins-list'
    );
    if (!alternativeOriginsList) {
      throw new Error('Alternative origins list element not found');
    }

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
    const addButton = document.getElementById('alternative-origin-add');
    const removeButton = document.getElementById('alternative-origin-remove');

    if (addButton) {
      addButton.addEventListener('click', () => this.handleAdd());
    }

    if (removeButton) {
      removeButton.addEventListener('click', () => this.handleRemove());
    }
  }

  private async handleAdd(): Promise<void> {
    const input = document.getElementById(
      'alternative-origin-input'
    ) as HTMLInputElement;

    const origin = input.value.trim();
    if (!origin) {
      throw new Error('Origin input is required');
    }

    if (!isValidOrigin(origin)) {
      showError(INVALID_ORIGIN_MESSAGE);
      input.value = '';
      return;
    }

    showLoading();

    const result = await this.canisterApi.manageAlternativeOrigins({
      Add: origin,
    });

    if ('Ok' in result) {
      await new Promise(resolve => setTimeout(resolve, IC_UPDATE_CALL_DELAY));
      await this.create();
      input.value = '';
    } else {
      showError(NETWORK_ERROR_MESSAGE);
      throw new Error(`Failed to add alternative origin: ${result.Err}`);
    }

    hideLoading();
  }

  private async handleRemove(): Promise<void> {
    const input = document.getElementById(
      'alternative-origin-input'
    ) as HTMLInputElement;

    const origin = input.value.trim();
    if (!origin) {
      throw new Error('Origin input is required');
    }

    if (!isValidOrigin(origin)) {
      showError(INVALID_ORIGIN_MESSAGE);
      input.value = '';
      return;
    }

    showLoading();

    const result = await this.canisterApi.manageAlternativeOrigins({
      Remove: origin,
    });

    if ('Ok' in result) {
      await new Promise(resolve => setTimeout(resolve, IC_UPDATE_CALL_DELAY));
      await this.create();
      input.value = '';
    } else {
      showError(NETWORK_ERROR_MESSAGE);
      throw new Error(`Failed to remove alternative origin: ${result.Err}`);
    }

    hideLoading();
  }
}
