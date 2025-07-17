import { Principal } from '@dfinity/principal';

/**
 * Infer the canister ID from the current window location.
 * In production, we expect the canister ID to be in the hostname (e.g., https://canister-id.icp0.io).
 * In development, we try catch this function. It may succeed when served from dfx (http://canister-id.localhost:port) or it may fail when served from a dev server (http://localhost:port).
 * I case of dev server, you need to manually obtain a canister-id
 */
export function inferCanisterIdFromLocation(): Principal {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // Pattern for localhost: u6s2n-gx777-77774-qaaba-cai.localhost
  const localhostMatch = /^([a-z0-9-]+)\.localhost$/.exec(hostname);
  if (localhostMatch?.[1] != null) {
    if (protocol !== 'http:') {
      throw new Error(
        `Invalid protocol for localhost: ${protocol}. Only http: is allowed for localhost.`
      );
    }
    return Principal.fromText(localhostMatch[1]);
  }

  // Pattern for IC: u6s2n-gx777-77774-qaaba-cai.icp0.io
  const icMatch = /^([a-z0-9-]+)\.icp0\.io$/.exec(hostname);
  if (icMatch?.[1] != null) {
    if (protocol !== 'https:') {
      throw new Error(
        `Invalid protocol for production: ${protocol}. Only https: is allowed for icp0.io.`
      );
    }
    return Principal.fromText(icMatch[1]);
  }

  throw new Error(`Could not infer canister ID from hostname: ${hostname}`);
}
