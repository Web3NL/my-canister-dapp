import { ManagementApi } from '../api/management';
import { Principal } from '@dfinity/principal';
import { showLoading, hideLoading } from '../loading';
import {
  showError,
  INVALID_PRINCIPAL_MESSAGE,
  DUPLICATE_CONTROLLER_MESSAGE,
  CONTROLLER_NOT_FOUND_MESSAGE,
  REQUIRED_CONTROLLERS_MESSAGE,
  isValidPrincipal,
} from '../error';

export class ControllersManager {
  private canisterId: Principal;
  private iiPrincipal: Principal;
  private controllersList: Principal[] = [];

  constructor(canisterId: Principal, iiPrincipal: Principal) {
    this.canisterId = canisterId;
    this.iiPrincipal = iiPrincipal;
  }

  async create(): Promise<void> {
    const managementApi = new ManagementApi();
    const status = await managementApi.getCanisterStatus();

    this.controllersList = status.settings.controllers;
    this.renderControllersContent();
  }

  private renderControllersContent(): void {
    const controllersList = document.getElementById('controllers-list');
    if (!controllersList) {
      throw new Error('Controllers list element not found');
    }

    const controllersListHtml = this.controllersList
      .map(
        controller => `<li class="data-display">${controller.toString()}</li>`
      )
      .join('');

    controllersList.innerHTML = controllersListHtml;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const addButton = document.getElementById('controller-add');
    const removeButton = document.getElementById('controller-remove');

    if (!addButton) {
      throw new Error('Controller add button element not found');
    }
    addButton.addEventListener('click', () => this.handleAdd());

    if (!removeButton) {
      throw new Error('Controller remove button element not found');
    }
    removeButton.addEventListener('click', () => this.handleRemove());
  }

  private async handleAdd(): Promise<void> {
    const input = document.getElementById(
      'controller-input'
    ) as HTMLInputElement;

    const principalText = input.value.trim();
    if (!principalText) {
      return;
    }

    if (!isValidPrincipal(principalText)) {
      showError(INVALID_PRINCIPAL_MESSAGE);
      input.value = '';
      return;
    }

    const newController = Principal.fromText(principalText);

    const updatedControllers = [...this.controllersList, newController];

    const controllerStrings = updatedControllers.map(c => c.toString());
    const hasDuplicates =
      controllerStrings.length !== new Set(controllerStrings).size;

    if (hasDuplicates) {
      showError(DUPLICATE_CONTROLLER_MESSAGE);
      input.value = '';
      return;
    }

    if (!this.hasRequiredPrincipals(updatedControllers)) {
      showError(REQUIRED_CONTROLLERS_MESSAGE);
      input.value = '';
      return;
    }

    showLoading();

    const managementApi = new ManagementApi();
    await managementApi.updateControllers(updatedControllers);

    this.controllersList = updatedControllers;
    input.value = '';
    this.renderControllersContent();

    hideLoading();
  }

  private async handleRemove(): Promise<void> {
    const input = document.getElementById(
      'controller-input'
    ) as HTMLInputElement;

    const principalText = input.value.trim();
    if (!principalText) {
      throw new Error('Principal input is required');
    }

    if (!isValidPrincipal(principalText)) {
      showError(INVALID_PRINCIPAL_MESSAGE);
      input.value = '';
      return;
    }

    const controllerToRemove = Principal.fromText(principalText);

    const controllerExists = this.controllersList.some(
      controller => controller.toString() === controllerToRemove.toString()
    );

    if (!controllerExists) {
      showError(CONTROLLER_NOT_FOUND_MESSAGE);
      input.value = '';
      return;
    }

    const updatedControllers = this.controllersList.filter(
      controller => controller.toString() !== controllerToRemove.toString()
    );

    if (!this.hasRequiredPrincipals(updatedControllers)) {
      showError(REQUIRED_CONTROLLERS_MESSAGE);
      input.value = '';
      return;
    }

    showLoading();

    const managementApi = new ManagementApi();
    await managementApi.updateControllers(updatedControllers);

    this.controllersList = updatedControllers;
    input.value = '';
    this.renderControllersContent();

    hideLoading();
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
