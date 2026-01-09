import { ManagementApi } from '../api/management';
import { canisterStatusStore } from '../store/statusStore';
import { Principal } from '@icp-sdk/core/principal';
import {
  INVALID_PRINCIPAL_MESSAGE,
  DUPLICATE_CONTROLLER_MESSAGE,
  CONTROLLER_NOT_FOUND_MESSAGE,
  REQUIRED_CONTROLLERS_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  reportError,
} from '../error';
import { isValidPrincipal } from '../utils';
import {
  getElement,
  addEventListener,
  showLoading,
  hideLoading,
  showError,
  getInputValue,
  clearInput,
} from '../dom';

export class ControllersManager {
  private canisterId: Principal;
  private iiPrincipal: Principal;
  private controllersList: Principal[] = [];

  private constructor(canisterId: Principal, iiPrincipal: Principal) {
    this.canisterId = canisterId;
    this.iiPrincipal = iiPrincipal;
  }

  static async create(
    canisterId: Principal,
    iiPrincipal: Principal
  ): Promise<ControllersManager> {
    const instance = new ControllersManager(canisterId, iiPrincipal);
    const status = await canisterStatusStore.getStatus();
    instance.controllersList = status.settings.controllers;
    instance.renderControllersContent();
    instance.attachEventListeners();
    return instance;
  }

  private renderControllersContent(): void {
    const controllersList = getElement('controllers-list');
    controllersList.textContent = '';
    for (const controller of this.controllersList) {
      const li = document.createElement('li');
      li.className = 'data-display';
      li.textContent = controller.toString();
      controllersList.appendChild(li);
    }

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    addEventListener('controller-add', 'click', () => this.handleAdd());
    addEventListener('controller-remove', 'click', () => this.handleRemove());
  }

  private async handleAdd(): Promise<void> {
    const principalText = getInputValue('controller-input');
    if (!principalText) {
      return;
    }

    if (!isValidPrincipal(principalText)) {
      showError(INVALID_PRINCIPAL_MESSAGE);
      clearInput('controller-input');
      return;
    }

    const newController = Principal.fromText(principalText);

    const updatedControllers = [...this.controllersList, newController];

    const controllerStrings = updatedControllers.map(c => c.toString());
    const hasDuplicates =
      controllerStrings.length !== new Set(controllerStrings).size;

    if (hasDuplicates) {
      showError(DUPLICATE_CONTROLLER_MESSAGE);
      clearInput('controller-input');
      return;
    }

    if (!this.hasRequiredPrincipals(updatedControllers)) {
      showError(REQUIRED_CONTROLLERS_MESSAGE);
      clearInput('controller-input');
      return;
    }

    showLoading();

    try {
      const managementApi = new ManagementApi();
      await managementApi.updateControllers(updatedControllers);
      await canisterStatusStore.refresh();
      this.controllersList = updatedControllers;
      clearInput('controller-input');
      this.renderControllersContent();
    } catch (e) {
      reportError(NETWORK_ERROR_MESSAGE, e);
    } finally {
      hideLoading();
    }
  }

  private async handleRemove(): Promise<void> {
    const principalText = getInputValue('controller-input');
    if (!principalText) return;

    if (!isValidPrincipal(principalText)) {
      showError(INVALID_PRINCIPAL_MESSAGE);
      clearInput('controller-input');
      return;
    }

    const controllerToRemove = Principal.fromText(principalText);

    const controllerExists = this.controllersList.some(
      controller => controller.toString() === controllerToRemove.toString()
    );

    if (!controllerExists) {
      showError(CONTROLLER_NOT_FOUND_MESSAGE);
      clearInput('controller-input');
      return;
    }

    const updatedControllers = this.controllersList.filter(
      controller => controller.toString() !== controllerToRemove.toString()
    );

    if (!this.hasRequiredPrincipals(updatedControllers)) {
      showError(REQUIRED_CONTROLLERS_MESSAGE);
      clearInput('controller-input');
      return;
    }

    showLoading();

    try {
      const managementApi = new ManagementApi();
      await managementApi.updateControllers(updatedControllers);
      await canisterStatusStore.refresh();
      this.controllersList = updatedControllers;
      clearInput('controller-input');
      this.renderControllersContent();
    } catch (e) {
      reportError(NETWORK_ERROR_MESSAGE, e);
    } finally {
      hideLoading();
    }
  }

  private hasRequiredPrincipals(controllers: Principal[]): boolean {
    const hasCanisterId = controllers.some(
      controller => controller.toString() === this.canisterId.toString()
    );
    const hasIIPrincipal = controllers.some(
      controller => controller.toString() === this.iiPrincipal.toString()
    );
    return hasCanisterId && hasIIPrincipal;
  }
}
