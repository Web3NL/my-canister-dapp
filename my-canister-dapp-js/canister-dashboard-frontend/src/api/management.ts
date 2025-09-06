import type {
  CanisterStatusResponse,
  FetchCanisterLogsResponse,
} from '@dfinity/ic-management';
import { ICManagementCanister } from '@dfinity/ic-management';
import type { Principal } from '@dfinity/principal';
import { createHttpAgent, canisterId } from '../utils';
import { reportError, NETWORK_ERROR_MESSAGE } from '../error';

export class ManagementApi {
  private async managmentApi(): Promise<ICManagementCanister> {
    const agent = await createHttpAgent();
    return ICManagementCanister.create({
      agent,
    });
  }

  async getCanisterStatus(): Promise<CanisterStatusResponse> {
    try {
      const icManagement = await this.managmentApi();
      const canisterIdPrincipal = await canisterId();

      return await icManagement.canisterStatus(canisterIdPrincipal);
    } catch (error) {
      reportError(NETWORK_ERROR_MESSAGE, error);
      throw error;
    }
  }

  async updateControllers(controllers: Principal[]): Promise<void> {
    try {
      const icManagement = await this.managmentApi();
      const canisterIdPrincipal = await canisterId();

      await icManagement.updateSettings({
        canisterId: canisterIdPrincipal,
        settings: {
          controllers: controllers.map(controller => controller.toString()),
        },
      });
    } catch (error) {
      reportError(NETWORK_ERROR_MESSAGE, error);
      throw error;
    }
  }

  async getCanisterLogs(): Promise<FetchCanisterLogsResponse> {
    try {
      const icManagement = await this.managmentApi();
      const canisterIdPrincipal = await canisterId();

      return await icManagement.fetchCanisterLogs(canisterIdPrincipal);
    } catch (error) {
      reportError(NETWORK_ERROR_MESSAGE, error);
      throw error;
    }
  }
}
