import type { HttpAgent } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { ICManagementCanister } from '@dfinity/ic-management';
import { MyDashboardBackend } from './actor';
import { LOW_CYCLES_THRESHOLD } from './constants';

/**
 * Options for checking cycles balance
 */
export interface CheckCyclesBalanceOptions {
  /** Custom threshold for low cycles warning. Defaults to LOW_CYCLES_THRESHOLD */
  threshold?: bigint;
}

/**
 * Result of checking cycles balance
 */
export type CheckCyclesBalanceResult = { ok: bigint } | { error: string };

/**
 * MyCanisterDashboard class for Canister Dapp management
 */
export class MyCanisterDashboard {
  private icManagement: ICManagementCanister;

  private constructor(
    private agent: HttpAgent,
    private canisterId: Principal
  ) {
    this.icManagement = ICManagementCanister.create({ agent: this.agent });
  }

  /**
   * Create a new MyCanisterDashboard instance
   */
  static create(agent: HttpAgent, canisterId: Principal): MyCanisterDashboard {
    return new MyCanisterDashboard(agent, canisterId);
  }

  /**
   * Check cycles balance for the canister running My Canister Dashboard.
   */
  async checkCyclesBalance(
    options?: CheckCyclesBalanceOptions
  ): Promise<CheckCyclesBalanceResult> {
    try {
      const threshold = options?.threshold ?? LOW_CYCLES_THRESHOLD;

      const status = await this.icManagement.canisterStatus(this.canisterId);
      const cycles = status.cycles;

      if (cycles < threshold) {
        return {
          error: `Low cycles warning: ${cycles.toString()} cycles remaining (threshold: ${threshold.toString()})`,
        };
      }

      return { ok: cycles };
    } catch (error) {
      return { error: String(error) };
    }
  }

  /**
   * Check whether the current caller is the Dapp owner with known Internet Identity principal
   * Returns true if authenticated as the known II principal, false otherwise.
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const backend = MyDashboardBackend.create({
        agent: this.agent,
        canisterId: this.canisterId,
      });

      const result = await backend.manageIIPrincipal({ Get: null });
      return 'Ok' in result;
    } catch {
      return false;
    }
  }
}
