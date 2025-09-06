import { ManagementApi } from '../api/management';
import { uint8ArrayToHexString } from '@dfinity/utils';
import { formatMemorySize, formatCycles } from '../helpers';
import type { CanisterStatusResponse } from '@dfinity/ic-management';
import { updateStatusDisplay } from '../dom';

interface FormattedStatusData {
  statusText: string;
  memorySizeFormatted: string;
  cyclesFormatted: string;
  moduleHashHex: string;
}

export class StatusManager {
  private constructor() {
    // Private constructor to enforce use of static create method
  }

  static async create(): Promise<StatusManager> {
    const instance = new StatusManager();
    const managementApi = new ManagementApi();
    const status = await managementApi.getCanisterStatus();

    const { statusText, memorySizeFormatted, cyclesFormatted, moduleHashHex } =
      instance.formatStatusData(status);

    updateStatusDisplay(
      statusText,
      memorySizeFormatted,
      cyclesFormatted,
      moduleHashHex
    );

    return instance;
  }

  private formatStatusData(
    status: CanisterStatusResponse
  ): FormattedStatusData {
    const statusText =
      'running' in status.status
        ? 'Running'
        : 'stopped' in status.status
          ? 'Stopped'
          : 'stopping' in status.status
            ? 'Stopping'
            : 'Unknown';
    const memorySizeFormatted = formatMemorySize(status.memory_size);
    const cyclesFormatted = formatCycles(status.cycles);
    const moduleHashHex =
      status.module_hash.length > 0
        ? uint8ArrayToHexString(status.module_hash[0] as Uint8Array)
        : 'N/A';

    return { statusText, memorySizeFormatted, cyclesFormatted, moduleHashHex };
  }
}
