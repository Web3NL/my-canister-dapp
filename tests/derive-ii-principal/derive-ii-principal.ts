import { AuthClient, type AuthClientLoginOptions } from '@icp-sdk/auth/client';
import { Principal } from '@icp-sdk/core/principal';

declare global {
  interface Window {
    DeriveIIPrincipal: {
      performAuth: (identityProvider: string, derivationOrigin?: string) => Promise<string>;
      createAuthButton: () => void;
    };
  }
}

async function performAuth(identityProvider: string, derivationOrigin?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    AuthClient.create({
      keyType: 'Ed25519'
    }).then(async (client) => {
      try {
        const loginOptions: AuthClientLoginOptions = {
          identityProvider,
          onSuccess: async () => {
            const identity = client.getIdentity();
            const principal = identity.getPrincipal();
            const principalText = principal.toText();
            
            Principal.fromText(principalText);
            
            resolve(principalText);
          },
          onError: (error: unknown) => {
            reject(new Error(`Authentication failed: ${String(error)}`));
          }
        };
        
        if (derivationOrigin != null) {
          loginOptions.derivationOrigin = derivationOrigin;
        }
        
        await client.login(loginOptions);
      } catch (error) {
        reject(new Error(`Auth client error: ${String(error)}`));
      }
    }).catch(reject);
  });
}

function createAuthButton(): void {
  const existing = document.querySelector('[data-tid="derive-ii-auth-btn"]');
  if (existing) {
    existing.remove();
  }

  const button = document.createElement('button');
  button.setAttribute('data-tid', 'derive-ii-auth-btn');
  button.textContent = 'Derive II Principal';

  const resultDiv = document.createElement('div');
  resultDiv.setAttribute('data-tid', 'derive-ii-auth-result');

  document.body.appendChild(button);
  document.body.appendChild(resultDiv);
}

window.DeriveIIPrincipal = {
  performAuth,
  createAuthButton
};

createAuthButton();