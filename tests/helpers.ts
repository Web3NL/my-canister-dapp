import { exec } from 'child_process';
import { promisify } from 'util';
import { AccountIdentifier } from '@dfinity/ledger-icp';
import { Principal } from '@dfinity/principal';
import fs from 'fs';
import path from 'path';

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
    throw new Error(`Test data file not found: ${filename}`);
  }

  return fs.readFileSync(filePath, 'utf8').trim();
}


