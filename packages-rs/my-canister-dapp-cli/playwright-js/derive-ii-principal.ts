import { AuthClient, type AuthClientLoginOptions } from '@icp-sdk/auth/client';

declare global {
  interface Window {
    DeriveIIPrincipal: {
      setup: (identityProvider: string) => Promise<void>;
    };
  }
}

// Pre-created AuthClient — must be ready before the button click
// so that client.login() runs synchronously from the user gesture
// (otherwise the popup blocker blocks window.open)
let client: AuthClient | null = null;

async function setup(identityProvider: string): Promise<void> {
  client = await AuthClient.create({ keyType: 'Ed25519' });

  const button = document.createElement('button');
  button.setAttribute('data-tid', 'login-button');
  button.textContent = 'Login';

  const principalDiv = document.createElement('div');
  principalDiv.id = 'principal';

  button.onclick = () => {
    if (!client) {
      principalDiv.textContent = 'ERROR: AuthClient not initialized';
      return;
    }

    const loginOptions: AuthClientLoginOptions = {
      identityProvider,
      onSuccess: () => {
        const principal = client!.getIdentity().getPrincipal().toText();
        principalDiv.textContent = principal;
      },
      onError: (error: unknown) => {
        principalDiv.textContent = `ERROR: Authentication failed: ${String(error)}`;
      },
    };
    client.login(loginOptions);
  };

  document.body.appendChild(button);
  document.body.appendChild(principalDiv);
}

window.DeriveIIPrincipal = { setup };
