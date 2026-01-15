import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseLogMessage,
  inferLogLevel,
  formatRelativeTime,
  escapeHtml,
} from '../../src/components/canisterLogs';

describe('canisterLogs', () => {
  describe('parseLogMessage', () => {
    it('should parse category and message from standard log format', () => {
      const result = parseLogMessage('top-up: rule cleared');
      expect(result.category).toBe('top-up');
      expect(result.message).toBe('rule cleared');
      expect(result.keyValuePairs).toEqual([]);
    });

    it('should extract key-value pairs', () => {
      const result = parseLogMessage(
        'top-up: rule set amount=500000000000 threshold=250000000000 interval=Hourly'
      );
      expect(result.category).toBe('top-up');
      expect(result.message).toBe('rule set');
      expect(result.keyValuePairs).toEqual([
        { key: 'amount', value: '500000000000' },
        { key: 'threshold', value: '250000000000' },
        { key: 'interval', value: 'Hourly' },
      ]);
    });

    it('should handle message with key=value at start', () => {
      const result = parseLogMessage('top-up: amount=100 threshold=50');
      expect(result.category).toBe('top-up');
      expect(result.message).toBe('');
      expect(result.keyValuePairs).toHaveLength(2);
    });

    it('should handle CMC mint error format', () => {
      const result = parseLogMessage('CMC mint error: some error message');
      expect(result.category).toBe('CMC mint error');
      expect(result.message).toBe('some error message');
    });

    it('should handle message without colon', () => {
      const result = parseLogMessage('Mint in-flight; skipping this tick');
      expect(result.category).toBe('log');
      expect(result.message).toBe('Mint in-flight; skipping this tick');
    });

    it('should handle cycles above threshold with key-value pairs', () => {
      const result = parseLogMessage(
        'top-up: cycles above threshold; skipping current=350720226345 threshold=250000000000'
      );
      expect(result.category).toBe('top-up');
      expect(result.message).toBe('cycles above threshold; skipping');
      expect(result.keyValuePairs).toHaveLength(2);
      expect(result.keyValuePairs[0]).toEqual({
        key: 'current',
        value: '350720226345',
      });
      expect(result.keyValuePairs[1]).toEqual({
        key: 'threshold',
        value: '250000000000',
      });
    });

    it('should handle timer set message', () => {
      const result = parseLogMessage('top-up: timer set every 3600s');
      expect(result.category).toBe('top-up');
      expect(result.message).toBe('timer set every 3600s');
      expect(result.keyValuePairs).toEqual([]);
    });

    it('should handle active rule with multiple key-value pairs', () => {
      const result = parseLogMessage(
        'top-up: active rule amount=500000000000 threshold=250000000000 interval=Hourly every=3600s'
      );
      expect(result.category).toBe('top-up');
      expect(result.message).toBe('active rule');
      expect(result.keyValuePairs).toHaveLength(4);
    });

    it('should handle empty message after colon', () => {
      const result = parseLogMessage('top-up:');
      expect(result.category).toBe('top-up');
      expect(result.message).toBe('');
      expect(result.keyValuePairs).toEqual([]);
    });

    it('should handle multiple colons in message', () => {
      const result = parseLogMessage('CMC: error: nested: value');
      expect(result.category).toBe('CMC');
      expect(result.message).toBe('error: nested: value');
    });
  });

  describe('inferLogLevel', () => {
    it('should return error for error messages', () => {
      expect(inferLogLevel('CMC mint error', 'some error')).toBe('error');
      expect(inferLogLevel('top-up', 'transfer failed')).toBe('error');
    });

    it('should return error when category contains error', () => {
      expect(inferLogLevel('error', 'something happened')).toBe('error');
      expect(inferLogLevel('Network Error', 'connection lost')).toBe('error');
    });

    it('should return warning for skipping messages', () => {
      expect(inferLogLevel('top-up', 'cycles above threshold; skipping')).toBe(
        'warning'
      );
      expect(inferLogLevel('log', 'Mint in-flight; skipping this tick')).toBe(
        'warning'
      );
    });

    it('should return warning for still processing messages', () => {
      expect(inferLogLevel('top-up', 'notify still processing')).toBe(
        'warning'
      );
    });

    it('should return success for completed operations', () => {
      expect(inferLogLevel('top-up', 'rule set')).toBe('success');
      expect(inferLogLevel('top-up', 'rule cleared')).toBe('success');
      expect(inferLogLevel('top-up', 'flow completed')).toBe('success');
      expect(inferLogLevel('top-up', 'notify succeeded')).toBe('success');
      expect(inferLogLevel('top-up', 'transfer ok')).toBe('success');
    });

    it('should return success for timer operations', () => {
      expect(inferLogLevel('top-up', 'timer set every 3600s')).toBe('success');
      expect(inferLogLevel('top-up', 'timer cleared')).toBe('success');
    });

    it('should return info for neutral messages', () => {
      expect(inferLogLevel('top-up', 'tick')).toBe('info');
      expect(inferLogLevel('top-up', 'active rule')).toBe('info');
      expect(inferLogLevel('top-up', 'below threshold')).toBe('info');
    });

    it('should be case insensitive', () => {
      expect(inferLogLevel('TOP-UP', 'RULE SET')).toBe('success');
      expect(inferLogLevel('CMC MINT ERROR', 'FAILED')).toBe('error');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-15T20:09:28.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return "just now" for times within 1 second', () => {
      const date = new Date('2026-01-15T20:09:28.000Z');
      expect(formatRelativeTime(date)).toBe('just now');
    });

    it('should return "just now" for exactly 1 second ago', () => {
      const date = new Date('2026-01-15T20:09:27.000Z');
      expect(formatRelativeTime(date)).toBe('just now');
    });

    it('should return seconds ago for times under a minute', () => {
      const date = new Date('2026-01-15T20:08:58.000Z'); // 30 seconds ago
      expect(formatRelativeTime(date)).toBe('30s ago');
    });

    it('should return "1 min ago" for exactly 1 minute', () => {
      const date = new Date('2026-01-15T20:08:28.000Z');
      expect(formatRelativeTime(date)).toBe('1 min ago');
    });

    it('should return minutes ago for times under an hour', () => {
      const date = new Date('2026-01-15T20:07:28.000Z'); // 2 minutes ago
      expect(formatRelativeTime(date)).toBe('2 min ago');
    });

    it('should return "1 hour ago" for exactly 1 hour', () => {
      const date = new Date('2026-01-15T19:09:28.000Z');
      expect(formatRelativeTime(date)).toBe('1 hour ago');
    });

    it('should return hours ago for times under a day', () => {
      const date = new Date('2026-01-15T17:09:28.000Z'); // 3 hours ago
      expect(formatRelativeTime(date)).toBe('3 hours ago');
    });

    it('should return "1 day ago" for exactly 1 day', () => {
      const date = new Date('2026-01-14T20:09:28.000Z');
      expect(formatRelativeTime(date)).toBe('1 day ago');
    });

    it('should return days ago for times under a week', () => {
      const date = new Date('2026-01-13T20:09:28.000Z'); // 2 days ago
      expect(formatRelativeTime(date)).toBe('2 days ago');
    });

    it('should return "1 week ago" for exactly 7 days', () => {
      const date = new Date('2026-01-08T20:09:28.000Z');
      expect(formatRelativeTime(date)).toBe('1 week ago');
    });

    it('should return weeks ago for times under a month', () => {
      const date = new Date('2026-01-01T20:09:28.000Z'); // 14 days ago = 2 weeks
      expect(formatRelativeTime(date)).toBe('2 weeks ago');
    });

    it('should return "over a month ago" for older times', () => {
      const date = new Date('2025-12-01T20:09:28.000Z'); // 45 days ago
      expect(formatRelativeTime(date)).toBe('over a month ago');
    });

    it('should handle future dates gracefully', () => {
      const date = new Date('2026-01-15T20:10:28.000Z'); // 1 minute in future
      expect(formatRelativeTime(date)).toBe('just now');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should escape single quotes', () => {
      expect(escapeHtml("test'value")).toBe("test&#39;value");
    });

    it('should escape ampersands', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('should handle strings without special characters', () => {
      expect(escapeHtml('hello world')).toBe('hello world');
    });

    it('should handle empty strings', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should escape all special characters in one string', () => {
      expect(escapeHtml('<div class="test" data-val=\'x\'>a & b</div>')).toBe(
        '&lt;div class=&quot;test&quot; data-val=&#39;x&#39;&gt;a &amp; b&lt;/div&gt;'
      );
    });
  });
});
