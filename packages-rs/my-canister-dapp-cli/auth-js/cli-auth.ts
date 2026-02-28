import {
  AuthClient,
  type AuthClientLoginOptions,
} from '@icp-sdk/auth/client';

declare global {
  interface Window {
    CLI_AUTH_CONFIG: {
      identityProvider: string;
      derivationOrigin: string;
      callbackUrl: string;
    };
  }
}

// Pre-create AuthClient before button click so that client.login()
// can run synchronously from the user gesture (avoids popup blocker).
let client: AuthClient | null = null;

async function setup(): Promise<void> {
  const { identityProvider, derivationOrigin, callbackUrl } =
    window.CLI_AUTH_CONFIG;
  const statusEl = document.getElementById('status')!;
  const buttonContainer = document.getElementById('button-container')!;

  try {
    statusEl.textContent = 'Initializing...';
    client = await AuthClient.create({ keyType: 'Ed25519' });

    // Create the login button (must be clicked by user to avoid popup blocker)
    const button = document.createElement('button');
    button.textContent = 'Login with Internet Identity';
    button.onclick = () => {
      if (!client) {
        statusEl.textContent = 'ERROR: AuthClient not initialized';
        statusEl.className = 'error';
        return;
      }

      button.disabled = true;
      button.textContent = 'Authenticating...';
      statusEl.textContent = 'Please complete authentication in the popup...';

      const loginOptions: AuthClientLoginOptions = {
        identityProvider,
        derivationOrigin,
        onSuccess: async () => {
          const principal = client!.getIdentity().getPrincipal().toText();
          statusEl.textContent = `Authenticated! Principal: ${principal}`;
          statusEl.className = 'success';

          try {
            await fetch(callbackUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: principal,
            });
            statusEl.textContent = `Done! You can close this tab. Principal: ${principal}`;
          } catch (e) {
            statusEl.textContent = `Authenticated but failed to send callback: ${e}`;
            statusEl.className = 'error';
          }
        },
        onError: (error: unknown) => {
          button.disabled = false;
          button.textContent = 'Login with Internet Identity';
          statusEl.textContent = `ERROR: Authentication failed: ${String(error)}`;
          statusEl.className = 'error';
        },
      };
      client.login(loginOptions);
    };

    buttonContainer.appendChild(button);
    statusEl.textContent = '';
  } catch (e) {
    statusEl.textContent = `ERROR: Failed to initialize: ${e}`;
    statusEl.className = 'error';
  }
}

setup();
