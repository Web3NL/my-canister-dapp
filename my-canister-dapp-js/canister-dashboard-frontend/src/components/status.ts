import { ManagementApi } from '../api/management';
import { uint8ArrayToHexString } from '@dfinity/utils';
import { formatMemorySize, formatCycles } from '../helpers';
import type { CanisterStatusResponse } from '@dfinity/ic-management';

interface FormattedStatusData {
  statusText: string;
  memorySizeFormatted: string;
  cyclesFormatted: string;
  moduleHashHex: string;
}

export class StatusManager {
  async create(): Promise<void> {
    const managementApi = new ManagementApi();
    const status = await managementApi.getCanisterStatus();

    const { statusText, memorySizeFormatted, cyclesFormatted, moduleHashHex } =
      this.formatStatusData(status);

    this.renderStatusContent(
      statusText,
      memorySizeFormatted,
      cyclesFormatted,
      moduleHashHex
    );
  }

  private renderStatusContent(
    statusText: string,
    memorySizeFormatted: string,
    cyclesFormatted: string,
    moduleHashHex: string
  ): void {
    const statusValue = document.getElementById('status-value');
    const memorySizeValue = document.getElementById('memory-size-value');
    const cyclesValue = document.getElementById('cycles-value');
    const moduleHashValue = document.getElementById('module-hash-value');

    if (!statusValue || !memorySizeValue || !cyclesValue || !moduleHashValue) {
      throw new Error('Status value elements not found');
    }

    statusValue.textContent = statusText;
    memorySizeValue.textContent = memorySizeFormatted;
    cyclesValue.textContent = cyclesFormatted;
    moduleHashValue.textContent = moduleHashHex;
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
