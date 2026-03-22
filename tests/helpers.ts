import { exec } from 'child_process';
import { promisify } from 'util';
import type { Principal } from '@icp-sdk/core/principal';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const execAsync = promisify(exec);

const ICP_IDENTITY = 'ident-1';

export async function transferToPrincipal(principal: Principal, amount: string): Promise<void> {
  const principalText = principal.toText();

  const { stderr } = await execAsync(`icp token transfer ${amount} ${principalText} -n local --identity ${ICP_IDENTITY}`);
  if (stderr) {
    throw new Error(`ICP Transfer Error: ${stderr}`);
  }
}

export function saveTestData(filename: string, data: string): void {
  const outputDir = path.join(process.cwd(), 'tests', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, filename),
    data
  );
}

export function readTestData(filename: string): string {
  const outputDir = path.join(process.cwd(), 'tests', 'output');
  const filePath = path.join(outputDir, filename);

  if (!fs.existsSync(filePath)) {
    return ''; // test will fail
  }

  return fs.readFileSync(filePath, 'utf8').trim();
}

export function icpDappLauncherUrl(): string {
  const canisterId = getTestEnv('VITE_ICP_DAPP_LAUNCHER_CANISTER_ID');
  const hostname = getTestEnv('VITE_HOSTNAME');

  return `http://${canisterId}.${hostname}`;
}

export function loadTestEnv(): void {
  const envPath = path.join(process.cwd(), 'tests', 'test.env');

  if (!fs.existsSync(envPath)) {
    throw new Error('Test environment file not found at tests/test.env');
  }

  dotenv.config({ path: envPath });
}

function getTestEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Test environment variable ${key} not found. Make sure to call loadTestEnv() first.`);
  }

  return value;
}

export function installedHelloWorldExampleCanisterFrontendUrl(): string {
  const canisterId = readTestData('installed-canister-id');
  const hostname = getTestEnv('VITE_HOSTNAME');

  return `http://${canisterId}.${hostname}`;
}

export function installedHelloWorldExampleCanisterDashboardUrl(): string {
  const canisterId = readTestData('installed-canister-id');
  const hostname = process.env.VITE_HOSTNAME ?? '';

  return `http://${canisterId}.${hostname}/canister-dashboard`;
}
