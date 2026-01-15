import { ManagementApi } from '../api/management';
import { addEventListener, getElement, showLoading, hideLoading } from '../dom';
import { NETWORK_ERROR_MESSAGE, reportError } from '../error';

// --- Types ---
export type LogLevel = 'info' | 'success' | 'warning' | 'error';

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface ParsedLogMessage {
  category: string;
  message: string;
  keyValuePairs: KeyValuePair[];
}

interface ParsedLogEntry {
  category: string;
  message: string;
  level: LogLevel;
  keyValuePairs: KeyValuePair[];
  absoluteTimestamp: string;
  relativeTimestamp: string;
  index: string;
}

// --- Exported parsing functions (for testing) ---

/**
 * Parse a raw log message into category, message, and key-value pairs.
 * Expected format: "category: message key=value key=value"
 */
export function parseLogMessage(rawMessage: string): ParsedLogMessage {
  // Find the first colon to split category from rest
  const colonIndex = rawMessage.indexOf(':');
  if (colonIndex === -1) {
    // No colon found, use default category
    return { category: 'log', message: rawMessage.trim(), keyValuePairs: [] };
  }

  const category = rawMessage.slice(0, colonIndex).trim();
  const rest = rawMessage.slice(colonIndex + 1).trim();

  // Extract key=value pairs using regex
  // Matches word=non-whitespace patterns
  const keyValuePattern = /\b(\w+)=(\S+)/g;
  const keyValuePairs: KeyValuePair[] = [];
  let match: RegExpExecArray | null;

  while ((match = keyValuePattern.exec(rest)) !== null) {
    keyValuePairs.push({ key: match[1]!, value: match[2]! });
  }

  // Message is the part before the first key=value pair (if any)
  let message = rest;
  if (keyValuePairs.length > 0) {
    const firstKv = keyValuePairs[0]!;
    const firstKvIndex = rest.indexOf(`${firstKv.key}=`);
    if (firstKvIndex > 0) {
      message = rest.slice(0, firstKvIndex).trim();
    } else if (firstKvIndex === 0) {
      message = '';
    }
  }

  return { category, message, keyValuePairs };
}

/**
 * Infer log level from category and message content.
 */
export function inferLogLevel(category: string, message: string): LogLevel {
  const lowerCategory = category.toLowerCase();
  const lowerMessage = message.toLowerCase();

  // Error patterns
  if (
    lowerCategory.includes('error') ||
    lowerMessage.includes('error') ||
    lowerMessage.includes('failed')
  ) {
    return 'error';
  }

  // Warning patterns
  if (
    lowerMessage.includes('skipping') ||
    lowerMessage.includes('in-flight') ||
    lowerMessage.includes('still processing')
  ) {
    return 'warning';
  }

  // Success patterns
  if (
    lowerMessage.includes('succeeded') ||
    lowerMessage.includes('completed') ||
    lowerMessage.includes('transfer ok') ||
    lowerMessage.includes('rule set') ||
    lowerMessage.includes('rule cleared') ||
    lowerMessage.includes('timer set') ||
    lowerMessage.includes('timer cleared')
  ) {
    return 'success';
  }

  // Default to info
  return 'info';
}

/**
 * Format a date as a relative time string (e.g., "2 min ago").
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Handle future dates
  if (diffMs < 0) {
    return 'just now';
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return diffSeconds <= 1 ? 'just now' : `${diffSeconds}s ago`;
  }
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 min ago' : `${diffMinutes} min ago`;
  }
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  if (diffDays < 7) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }

  return 'over a month ago';
}

// --- Private helpers ---

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

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderLogEntry(entry: ParsedLogEntry): string {
  const escapedCategory = escapeHtml(entry.category);
  const escapedMessage = escapeHtml(entry.message).replace(
    /\r\n|\n|\r/g,
    '<br>'
  );

  // Render key-value pairs as styled spans
  const kvHtml =
    entry.keyValuePairs.length > 0
      ? `<div class="log-kv-pairs">${entry.keyValuePairs
          .map(
            kv =>
              `<span class="log-kv"><span class="log-kv-key">${escapeHtml(kv.key)}</span>=<span class="log-kv-value">${escapeHtml(kv.value)}</span></span>`
          )
          .join('')}</div>`
      : '';

  // Build timestamp section (hide relative if timestamp was invalid)
  const timestampHtml = entry.relativeTimestamp
    ? `<span class="log-timestamp">
        <span class="log-timestamp-relative">${entry.relativeTimestamp}</span>
        <span class="log-timestamp-absolute">${entry.absoluteTimestamp}</span>
      </span>`
    : `<span class="log-timestamp">
        <span class="log-timestamp-absolute" style="margin-left: 0;">${entry.absoluteTimestamp}</span>
      </span>`;

  return `
    <li class="log-entry log-level-${entry.level}">
      <div class="log-header">
        <span class="log-badge log-badge-${entry.level}">${escapedCategory}</span>
        <span class="log-index">#${entry.index}</span>
        ${timestampHtml}
      </div>
      <div class="log-body">
        <span class="log-message">${escapedMessage}</span>
        ${kvHtml}
      </div>
    </li>
  `;
}

// --- Main class ---

export class CanisterLogsManager {
  private constructor() {
    // Private constructor to enforce use of static create method
  }

  static async create(): Promise<CanisterLogsManager> {
    const instance = new CanisterLogsManager();
    await instance.renderLogs();
    instance.attachEventListeners();
    return instance;
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
    try {
      const managementApi = new ManagementApi();
      const { canister_log_records } = await managementApi.getCanisterLogs();

      const logsList = getElement('logs-list');

      if (canister_log_records.length === 0) {
        logsList.innerHTML =
          '<li class="log-entry log-level-info"><div class="log-body"><span class="log-message">No logs found.</span></div></li>';
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

          // Parse timestamp
          const timestampMs = Number(record.timestamp_nanos / 1_000_000n);
          const date = new Date(timestampMs);
          const isValidDate = !isNaN(date.getTime());

          // Parse message into structured parts
          const { category, message, keyValuePairs } =
            parseLogMessage(rawMessage);
          const level = inferLogLevel(category, message);

          // Build parsed entry
          const entry: ParsedLogEntry = {
            category,
            message,
            level,
            keyValuePairs,
            absoluteTimestamp: isValidDate
              ? formatSimpleDateTime(date)
              : 'Unknown time',
            relativeTimestamp: isValidDate ? formatRelativeTime(date) : '',
            index: record.idx.toString(),
          };

          return renderLogEntry(entry);
        })
        .join('');

      logsList.innerHTML = items;
    } catch (e) {
      reportError(NETWORK_ERROR_MESSAGE, e);
    }
  }
}
