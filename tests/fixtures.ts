/**
 * Playwright test fixtures with II headless Linux CI patches.
 *
 * Applies the same fixes as derive-principal.mjs to every test context:
 *   1. addInitScript: isUserVerifyingPlatformAuthenticatorAvailable → true
 *   2. addInitScript: credentials.get → NotAllowedError (stops UI from blocking)
 *   3. context.route: Node.js HTTP proxy for *.localhost (DNS + gzip + bundle patch)
 *   4. II bundle patch: force DUMMY_AUTH path (Vr.dummy_auth check → true)
 *   5. II bundle patch: unique seed per context (avoids credential conflicts between tests)
 */
import { test as base } from '@playwright/test';
import type { BrowserContext } from '@playwright/test';
import http from 'http';
import zlib from 'zlib';

const HOP_BY_HOP = new Set([
  'content-encoding', 'transfer-encoding', 'connection', 'keep-alive',
]);

async function applyIIPatches(context: BrowserContext, seed: number): Promise<void> {
  await context.addInitScript(() => {
    try {
      if (typeof PublicKeyCredential !== 'undefined') {
        Object.defineProperty(
          PublicKeyCredential,
          'isUserVerifyingPlatformAuthenticatorAvailable',
          { value: () => Promise.resolve(true), writable: true, configurable: true }
        );
      }
    } catch (_) {}
    try {
      navigator.credentials.get = function () {
        return Promise.reject(new DOMException('No credentials available', 'NotAllowedError'));
      };
    } catch (_) {}
  });

  await context.route(
    (url) => url.hostname !== 'localhost' && url.hostname.endsWith('.localhost'),
    (route) => {
      const url = new URL(route.request().url());
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: parseInt(url.port) || 80,
          path: url.pathname + url.search,
          method: route.request().method(),
          headers: { ...route.request().headers(), host: url.host },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (c: Buffer) => chunks.push(c));
          res.on('end', () => {
            const rawBody = Buffer.concat(chunks);
            const encoding = (res.headers['content-encoding'] ?? '').toLowerCase();

            const headers: Record<string, string> = {};
            for (const [k, v] of Object.entries(res.headers)) {
              if (!HOP_BY_HOP.has(k) && v !== undefined) {
                headers[k] = Array.isArray(v) ? v.join('\n') : String(v);
              }
            }

            let body: Buffer;
            try {
              if (encoding === 'gzip' || encoding === 'x-gzip') body = zlib.gunzipSync(rawBody);
              else if (encoding === 'br') body = zlib.brotliDecompressSync(rawBody);
              else if (encoding === 'deflate') body = zlib.inflateSync(rawBody);
              else body = rawBody;
            } catch (_) {
              body = rawBody;
            }

            const p = url.pathname;
            if (p.includes('/_app/immutable/entry/start') && p.endsWith('.js')) {
              let src = body.toString('utf8');
              src = src.replaceAll('Vr.dummy_auth[0]?.[0]!==void 0?', 'true?');
              src = src.replace('return BigInt(0)}', `return BigInt(${seed})}`);
              body = Buffer.from(src, 'utf8');
            }

            route
              .fulfill({ status: res.statusCode ?? 200, headers, body })
              .catch(() => {});
          });
        }
      );
      req.on('error', () => route.abort());
      const postBody = route.request().postDataBuffer();
      if (postBody) req.write(postBody);
      req.end();
    }
  );
}

export const test = base.extend<object>({
  context: async ({ context }, use) => {
    const seed = Math.floor(Math.random() * 2 ** 32);
    await applyIIPatches(context, seed);
    await use(context);
  },
});

export { expect } from '@playwright/test';
