import { exec } from 'child_process';
import { promisify } from 'util';
import { AccountIdentifier } from '@icp-sdk/canisters/ledger/icp';
import type { Principal } from '@icp-sdk/core/principal';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const execAsync = promisify(exec);

const DFX_IDENTITY = 'ident-1';

export async function transferToPrincipal(principal: Principal, amount: string): Promise<void> {
  await useDfxIdentity();

  const accountId = await accountIdentifierFromPrincipal(principal);
  const accountIdHex = accountId.toHex();

  const { stderr } = await execAsync(`dfx ledger transfer ${accountIdHex} --memo 0 --amount ${amount}`);
  if (stderr) {
    throw new Error(`DFX Transfer Error: ${stderr}`);
  }
}


async function accountIdentifierFromPrincipal(principal: Principal): Promise<AccountIdentifier> {
  const principalText = principal.toText();

  const { stdout, stderr } = await execAsync(`dfx ledger account-id --of-principal ${principalText}`);
  if (stderr) {
    throw new Error(`DFX Error: ${stderr}`);
  }

  return AccountIdentifier.fromHex(stdout.trim());
}

async function useDfxIdentity(): Promise<void> {
  const { stderr } = await execAsync(`dfx identity use ${DFX_IDENTITY}`);
  // dfx identity use outputs success message to stderr, so only throw on actual errors
  if (stderr && !stderr.includes(`Using identity: "${DFX_IDENTITY}"`)) {
    throw new Error(`DFX Identity Error: ${stderr}`);
  }
}

export function saveTestData(filename: string, data: string): void {
  const outputDir = path.join(process.cwd(), 'test-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, filename),
    data
  );
}

export function readTestData(filename: string): string {
  const outputDir = path.join(process.cwd(), 'test-output');
  const filePath = path.join(outputDir, filename);

  if (!fs.existsSync(filePath)) {
    return ''; // test will fail
  }

  return fs.readFileSync(filePath, 'utf8').trim();
}

export function myCanisterAppDfxUrl(): string {
  // Get canister ID and hostname from global env
  const canisterId = getDfxEnv('VITE_MY_CANISTER_APP_CANISTER_ID');
  const hostname = getDfxEnv('VITE_HOSTNAME');

  return `http://${canisterId}.${hostname}`;
}

export function loadDfxEnv(): void {
  const envPath = path.join(process.cwd(), 'tests', 'test.env');

  if (!fs.existsSync(envPath)) {
    throw new Error('Test environment file not found at tests/test.env');
  }

  dotenv.config({ path: envPath });
}

export function getDfxEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`DFX environment variable ${key} not found. Make sure to call loadDfxEnv() first.`);
  }

  return value;
}

export function installedHelloWorldExampleCanisterFrontendUrl(): string {
  // Get canister ID from test output and hostname from global env
  const canisterId = readTestData('installed-canister-id');
  const hostname = getDfxEnv('VITE_HOSTNAME');

  return `http://${canisterId}.${hostname}`;
}

export function installedHelloWorldExampleCanisterDashboardUrl(): string {
  // Get canister ID from test output and hostname from global env
  const canisterId = readTestData('installed-canister-id');
  const hostname = getDfxEnv('VITE_HOSTNAME');

  return `http://${canisterId}.${hostname}/canister-dashboard`;
}