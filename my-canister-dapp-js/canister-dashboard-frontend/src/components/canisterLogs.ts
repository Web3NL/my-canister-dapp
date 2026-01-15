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

// --- Value Formatters ---

/**
 * Format raw cycles value to T (trillions) with 2 decimal places.
 * 1 T = 1,000,000,000,000 (10^12)
 */
export function formatCycles(value: string): string {
  const num = BigInt(value);
  const trillion = 1_000_000_000_000n;
  const whole = num / trillion;
  const remainder = num % trillion;
  const decimal = (remainder * 100n) / trillion;
  return `${whole}.${decimal.toString().padStart(2, '0')} T`;
}

/**
 * Format e8s to ICP with 4 decimal places.
 * 1 ICP = 100,000,000 e8s (10^8)
 */
export function formatE8s(value: string): string {
  const num = BigInt(value);
  const e8s = 100_000_000n;
  const whole = num / e8s;
  const remainder = num % e8s;
  const decimal = remainder.toString().padStart(8, '0').slice(0, 4);
  return `${whole}.${decimal} ICP`;
}

/**
 * Format seconds to human-readable duration.
 */
export function formatDuration(seconds: string): string {
  const s = parseInt(seconds, 10);
  if (s >= 86400) {
    const days = Math.floor(s / 86400);
    return days === 1 ? '1 day' : `${days} days`;
  }
  if (s >= 3600) {
    const hours = Math.floor(s / 3600);
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }
  if (s >= 60) {
    const minutes = Math.floor(s / 60);
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
  }
  return s === 1 ? '1 second' : `${s} seconds`;
}

/**
 * Pretty print a key name (snake_case → Title Case).
 */
export function formatKeyName(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
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

// --- Message Pretty Printing ---

interface PrettyMessage {
  text: string;
  level: LogLevel;
}

const MESSAGE_MAP: Record<string, PrettyMessage> = {
  'rule set': { text: 'Rule Set', level: 'success' },
  'rule cleared': { text: 'Rule Cleared', level: 'success' },
  'timer cleared': { text: 'Timer Stopped', level: 'success' },
  tick: { text: 'Tick', level: 'info' },
  'active rule': { text: 'Active Rule', level: 'info' },
  'cycles above threshold; skipping': {
    text: 'Cycles Above Threshold (Skipped)',
    level: 'warning',
  },
  'below threshold': { text: 'Below Threshold', level: 'info' },
  'starting transfer + notify flow': {
    text: 'Starting Top-Up Flow',
    level: 'info',
  },
  'flow completed': { text: 'Top-Up Completed', level: 'success' },
  'no rule set; skipping': { text: 'No Rule Set (Skipped)', level: 'warning' },
  'notify succeeded': { text: 'Notify Succeeded', level: 'success' },
  'notify previous block succeeded': {
    text: 'Previous Block Succeeded',
    level: 'success',
  },
  'notify still processing': {
    text: 'Notify Still Processing',
    level: 'warning',
  },
  'notify processing; will retry later': {
    text: 'Notify Processing (Will Retry)',
    level: 'warning',
  },
  'notify failed non-retriable; proceeding to new transfer': {
    text: 'Previous Notify Failed',
    level: 'warning',
  },
  'transfer ok': { text: 'Transfer Successful', level: 'success' },
};

/**
 * Convert raw message to pretty display text and determine log level.
 */
export function prettifyMessage(
  rawMessage: string,
  category: string
): PrettyMessage {
  const lowerMessage = rawMessage.toLowerCase();

  // Check exact matches first
  const exactMatch = MESSAGE_MAP[lowerMessage];
  if (exactMatch) return exactMatch;

  // Check prefix matches
  for (const [pattern, pretty] of Object.entries(MESSAGE_MAP)) {
    if (lowerMessage.startsWith(pattern)) {
      return pretty;
    }
  }

  // Special pattern matches
  if (lowerMessage.startsWith('timer set every')) {
    return { text: 'Timer Started', level: 'success' };
  }
  if (lowerMessage.startsWith('convert cycles')) {
    return { text: 'Converting Cycles to ICP', level: 'info' };
  }
  if (lowerMessage.startsWith('xrc cycles_per_icp')) {
    return { text: 'Exchange Rate', level: 'info' };
  }
  if (lowerMessage.startsWith('notifying previous')) {
    return { text: 'Retrying Previous Block', level: 'info' };
  }
  if (lowerMessage.startsWith('notifying block')) {
    return { text: 'Notifying CMC', level: 'info' };
  }
  if (
    lowerMessage.startsWith('transfer ') &&
    lowerMessage.includes('e8s to cmc')
  ) {
    return { text: 'ICP Transfer to CMC', level: 'info' };
  }
  if (lowerMessage.includes('failed to compute')) {
    return { text: 'Failed to Compute ICP', level: 'error' };
  }
  if (lowerMessage.includes('mint in-flight')) {
    return { text: 'Mint In-Flight (Skipped)', level: 'warning' };
  }
  if (lowerMessage.includes('cmc mint error')) {
    return { text: 'CMC Mint Error', level: 'error' };
  }

  // Fallback: capitalize first letter of each word
  const text = rawMessage.replace(/\b\w/g, c => c.toUpperCase());
  return { text, level: inferLogLevel(category, rawMessage) };
}

// --- Value Formatting ---

// Keys that represent cycle values
const CYCLE_KEYS = [
  'amount',
  'threshold',
  'current',
  'cycles',
  'cycles_per_icp',
];
// Keys that represent e8s (ICP) values
const E8S_KEYS = ['icp_e8s', 'transfer_amount_e8s', 'fee'];
// Keys that represent durations in seconds
const DURATION_KEYS = ['every'];

/**
 * Format a value based on its key type.
 */
export function formatValue(key: string, value: string): string {
  const lowerKey = key.toLowerCase();

  if (CYCLE_KEYS.includes(lowerKey)) {
    return formatCycles(value);
  }
  if (E8S_KEYS.includes(lowerKey)) {
    return formatE8s(value);
  }
  if (DURATION_KEYS.includes(lowerKey)) {
    // Remove trailing 's' if present (e.g., "3600s" -> "3600")
    const seconds = value.replace(/s$/, '');
    return formatDuration(seconds);
  }

  // Interval enum values - already human readable
  if (lowerKey === 'interval') {
    return value;
  }

  // Block index - format as number
  if (lowerKey === 'block_index') {
    return `#${value}`;
  }

  return value;
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
  // Category in UPPERCASE
  const escapedCategory = escapeHtml(entry.category).toUpperCase();
  const escapedMessage = escapeHtml(entry.message).replace(
    /\r\n|\n|\r/g,
    '<br>'
  );

  // Render key-value pairs as table rows (not inline)
  const kvHtml =
    entry.keyValuePairs.length > 0
      ? `<div class="log-kv-table">${entry.keyValuePairs
          .map(kv => {
            const prettyKey = formatKeyName(kv.key);
            const prettyValue = formatValue(kv.key, kv.value);
            return `<div class="log-kv-row">
              <span class="log-kv-key">${escapeHtml(prettyKey)}</span>
              <span class="log-kv-value">${escapeHtml(prettyValue)}</span>
            </div>`;
          })
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

          // Pretty print message and determine level
          const { text: prettyMessage, level } = prettifyMessage(
            message,
            category
          );

          // Build parsed entry
          const entry: ParsedLogEntry = {
            category,
            message: prettyMessage,
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
