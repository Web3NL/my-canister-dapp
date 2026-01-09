import type { HttpAgent } from '@icp-sdk/core/agent';
import { MyCanisterDashboard } from '@web3nl/my-canister-dashboard';
import { inferCanisterId } from '@web3nl/vite-plugin-canister-dapp/runtime';
import { showError, showWarning } from './errorHandler';

const DEFAULT_THRESHOLD = 1_000_000_000_000n; // 1T cycles

interface CyclesResult {
  ok?: boolean;
  error?: string;
}

class CyclesChecker {
  constructor(private readonly threshold: bigint = DEFAULT_THRESHOLD) {}

  async checkCyclesBalance(agent: HttpAgent): Promise<CyclesResult | null> {
    try {
      const canisterId = inferCanisterId();
      const dashboard = MyCanisterDashboard.create(agent, canisterId);
      const result = await dashboard.checkCyclesBalance();

      return result as CyclesResult;
    } catch {
      showError('Failed to check cycles balance');
      return null;
    }
  }

  async checkAndWarn(agent: HttpAgent): Promise<boolean> {
    const result = await this.checkCyclesBalance(agent);

    if (result && 'ok' in result) {
      // Cycles are sufficient
      return false;
    } else if (result && 'error' in result && result.error) {
      // Check if this is a low cycles warning or an actual error
      if (result.error.includes('Low cycles warning')) {
        // Extract cycles amount from the error message
        const match = result.error.match(/(\d+) cycles remaining/);
        if (match?.[1] !== undefined && match[1] !== '') {
          const cycles = BigInt(match[1]);
          const isLowCycles = cycles < this.threshold;
          showWarning(
            `Low cycles: ${this.formatCycles(cycles)} remaining<br><br><a href="/canister-dashboard">Goto dashboard to top-up</a>`
          );
          return isLowCycles;
        } else {
          // Fallback if we can't parse the cycles amount
          showWarning(
            `Low cycles detected<br><br><a href="/canister-dashboard">Goto dashboard to top-up</a>`
          );
          return true;
        }
      } else {
        // This is an actual error, not a low cycles warning
        showError(`Cycles check failed: ${result.error || 'Unknown error'}`);
      }
    }

    return false;
  }

  formatCycles(cycles: bigint): string {
    const cyclesNum = Number(cycles);
    return `${(cyclesNum / 1_000_000_000_000).toFixed(2)}T`;
  }
}

export const createCyclesChecker = (threshold?: bigint): CyclesChecker =>
  new CyclesChecker(threshold);
