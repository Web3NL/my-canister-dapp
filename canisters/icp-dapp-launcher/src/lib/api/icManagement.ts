import { IcManagementCanister } from '@icp-sdk/canisters/ic-management';
import type { Principal } from '@icp-sdk/core/principal';
import { createHttpAgent } from '$lib/utils/agent';

export class IcManagementApi {
  private icManagement: IcManagementCanister;

  private constructor(icManagement: IcManagementCanister) {
    this.icManagement = icManagement;
  }

  static async create(): Promise<IcManagementApi> {
    const agent = await createHttpAgent();
    const icManagement = IcManagementCanister.create({
      agent,
    });
    return new IcManagementApi(icManagement);
  }

  async installCode(
    canisterId: Principal,
    wasmModule: Uint8Array
  ): Promise<void> {
    return await this.icManagement.installCode({
      mode: { reinstall: null },
      canisterId,
      wasmModule,
      arg: new Uint8Array([0]),
    });
  }

  async updateControllers(
    canisterId: Principal,
    controllerIds: Principal[]
  ): Promise<void> {
    return await this.icManagement.updateSettings({
      canisterId,
      settings: {
        controllers: controllerIds.map(id => id.toString()),
      },
    });
  }
}
