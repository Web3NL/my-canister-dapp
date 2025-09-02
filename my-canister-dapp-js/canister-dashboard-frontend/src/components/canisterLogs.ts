import { ManagementApi } from '../api/management';
import { addEventListener, getElement, showLoading, hideLoading } from '../dom';

export class CanisterLogsManager {
  async create(): Promise<void> {
    await this.renderLogs();
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    addEventListener('refresh-logs-btn', 'click', () => this.refreshLogs());
  }

  private async refreshLogs(): Promise<void> {
    showLoading();
    await this.renderLogs();
    hideLoading();
  }

  private async renderLogs(): Promise<void> {
    const managementApi = new ManagementApi();
    const { canister_log_records } = await managementApi.getCanisterLogs();

    const logsList = getElement('logs-list');

    if (canister_log_records.length === 0) {
      logsList.innerHTML = '<li class="data-display">No logs found.</li>';
      return;
    }

    const items = canister_log_records
      .reverse()
      .map(record => {
        // Decode log message from bytes
        const contentBytes =
          record.content instanceof Uint8Array
            ? record.content
            : Uint8Array.from(record.content);
        const rawMessage = new TextDecoder().decode(contentBytes);

        // Simple, local datetime: YYYY-MM-DD HH:mm:ss
        const timestampMs = Number(record.timestamp_nanos / 1_000_000n);
        const date = new Date(timestampMs);
        const ts = isNaN(date.getTime())
          ? 'Unknown time'
          : formatSimpleDateTime(date);

        const idx = record.idx.toString();

        // Escape HTML and convert line breaks to <br>
        const message = escapeHtml(rawMessage).replace(/\r\n|\n|\r/g, '<br>');

        return `<li class="data-display">[${ts}] (#${idx})<br>${message}</li>`;
      })
      .join('');

    logsList.innerHTML = items;
  }
}

// Helpers
function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatSimpleDateTime(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
