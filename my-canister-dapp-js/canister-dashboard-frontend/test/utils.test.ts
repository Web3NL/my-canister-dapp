import { describe, it, expect } from 'vitest';
import { isValidPrincipal, isValidOrigin } from '../src/utils';

describe('utils', () => {
  describe('isValidPrincipal', () => {
    it('should return true for valid canister principal', () => {
      expect(isValidPrincipal('rdmx6-jaaaa-aaaaa-aaadq-cai')).toBe(true);
    });

    it('should return true for valid user principal', () => {
      expect(isValidPrincipal('aaaaa-aa')).toBe(true);
    });

    it('should return true for anonymous principal', () => {
      expect(isValidPrincipal('2vxsx-fae')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isValidPrincipal('')).toBe(false);
    });

    it('should return false for random text', () => {
      expect(isValidPrincipal('not-a-principal')).toBe(false);
    });

    it('should return false for invalid checksum', () => {
      // Modified last character to invalidate checksum
      expect(isValidPrincipal('rdmx6-jaaaa-aaaaa-aaadq-cab')).toBe(false);
    });

    it('should return false for whitespace', () => {
      expect(isValidPrincipal('   ')).toBe(false);
    });

    it('should return false for principal with spaces', () => {
      expect(isValidPrincipal('rdmx6-jaaaa aaaaa-aaadq-cai')).toBe(false);
    });
  });

  describe('isValidOrigin', () => {
    describe('valid origins', () => {
      it('should accept https URLs', () => {
        expect(isValidOrigin('https://example.com')).toBe(true);
        expect(isValidOrigin('https://subdomain.example.com')).toBe(true);
        expect(isValidOrigin('https://deep.nested.subdomain.example.com')).toBe(true);
      });

      it('should accept https URLs with paths', () => {
        expect(isValidOrigin('https://example.com/path')).toBe(true);
        expect(isValidOrigin('https://example.com/path/to/resource')).toBe(true);
      });

      it('should accept http localhost with port', () => {
        expect(isValidOrigin('http://localhost:8080')).toBe(true);
        expect(isValidOrigin('http://localhost:3000')).toBe(true);
        // Note: port 80 gets normalized away by URL parser since it's the default HTTP port
        // So 'http://localhost:80' becomes 'http://localhost' which fails the port check
        expect(isValidOrigin('http://localhost:8000')).toBe(true);
      });

      it('should accept http subdomain.localhost with port', () => {
        expect(isValidOrigin('http://canister.localhost:8080')).toBe(true);
        expect(isValidOrigin('http://abc-xyz.localhost:4943')).toBe(true);
        expect(isValidOrigin('http://deep.nested.localhost:8080')).toBe(true);
      });
    });

    describe('invalid origins', () => {
      it('should reject http non-localhost URLs', () => {
        expect(isValidOrigin('http://example.com')).toBe(false);
        expect(isValidOrigin('http://example.com:8080')).toBe(false);
      });

      it('should reject http localhost without port', () => {
        expect(isValidOrigin('http://localhost')).toBe(false);
        expect(isValidOrigin('http://localhost/')).toBe(false);
      });

      it('should reject http subdomain.localhost without port', () => {
        expect(isValidOrigin('http://canister.localhost')).toBe(false);
      });

      it('should reject invalid URLs', () => {
        expect(isValidOrigin('not-a-url')).toBe(false);
        expect(isValidOrigin('')).toBe(false);
        expect(isValidOrigin('ftp://example.com')).toBe(false);
      });

      it('should reject file URLs', () => {
        expect(isValidOrigin('file:///path/to/file')).toBe(false);
      });

      it('should reject URLs with invalid protocols', () => {
        expect(isValidOrigin('ws://example.com')).toBe(false);
        expect(isValidOrigin('wss://example.com')).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle trailing slashes', () => {
        expect(isValidOrigin('https://example.com/')).toBe(true);
        expect(isValidOrigin('http://localhost:8080/')).toBe(true);
      });

      it('should handle query parameters', () => {
        expect(isValidOrigin('https://example.com?param=value')).toBe(true);
      });

      it('should handle ports on https', () => {
        expect(isValidOrigin('https://example.com:443')).toBe(true);
        expect(isValidOrigin('https://example.com:8443')).toBe(true);
      });

      it('should handle IP-like localhost (though not typical)', () => {
        // This is http with non-localhost hostname, should be false
        expect(isValidOrigin('http://127.0.0.1:8080')).toBe(false);
      });
    });
  });
});
