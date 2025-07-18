import { MyCanisterDashboard } from '@web3nl/my-canister-dashboard';
import { getCanisterId } from './utils.js';
import { showError, showWarning } from './errorHandler.js';

const DEFAULT_THRESHOLD = 1_000_000_000_000n; // 1T cycles

export class CyclesChecker {
  constructor(threshold = DEFAULT_THRESHOLD) {
    this.threshold = threshold;
  }

  async checkCyclesBalance(agent) {
    if (!agent) {
      throw new Error('Authenticated agent is required for cycles balance check');
    }

    try {
      const canisterId = getCanisterId();
      const dashboard = MyCanisterDashboard.create(agent, canisterId);
      const result = await dashboard.checkCyclesBalance();
      
      return result;
    } catch (error) {
      showError('Failed to check cycles balance');
      return null;
    }
  }

  async checkAndWarn(agent) {
    const result = await this.checkCyclesBalance(agent);
    
    if (result && 'ok' in result) {
      const cycles = result.ok;
      if (cycles < this.threshold) {
        const message = `⚠️ Low Cycles Warning: ${this.formatCycles(cycles)} remaining (threshold: ${this.formatCycles(this.threshold)})`;
        showWarning(message);
        return true;
      }
    } else if (result && 'error' in result) {
      showError(`Cycles check failed: ${result.error}`);
    }
    
    return false;
  }


  formatCycles(cycles) {
    const cyclesNum = Number(cycles);
    if (cyclesNum >= 1_000_000_000_000) {
      return `${(cyclesNum / 1_000_000_000_000).toFixed(1)}T`;
    } else if (cyclesNum >= 1_000_000_000) {
      return `${(cyclesNum / 1_000_000_000).toFixed(1)}B`;
    } else if (cyclesNum >= 1_000_000) {
      return `${(cyclesNum / 1_000_000).toFixed(1)}M`;
    } else {
      return cyclesNum.toLocaleString();
    }
  }
}

export const createCyclesChecker = (threshold) => new CyclesChecker(threshold);