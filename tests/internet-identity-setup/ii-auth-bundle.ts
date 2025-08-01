import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

declare global {
  interface Window {
    IIAuthBundle: {
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
        const loginOptions = {
          identityProvider,
          onSuccess: async () => {
            const identity = client.getIdentity();
            const principal = identity.getPrincipal();
            const principalText = principal.toText();
            
            Principal.fromText(principalText);
            
            resolve(principalText);
          },
          onError: (error: any) => {
            reject(new Error(`Authentication failed: ${String(error)}`));
          }
        };
        
        if (derivationOrigin != null) {
          (loginOptions as any).derivationOrigin = derivationOrigin;
        }
        
        await client.login(loginOptions);
      } catch (error) {
        reject(new Error(`Auth client error: ${String(error)}`));
      }
    }).catch(reject);
  });
}

function createAuthButton(): void {
  const existing = document.querySelector('[data-tid="ii-auth-btn"]');
  if (existing) {
    existing.remove();
  }

  const button = document.createElement('button');
  button.setAttribute('data-tid', 'ii-auth-btn');
  button.textContent = 'Auth with II';

  const resultDiv = document.createElement('div');
  resultDiv.setAttribute('data-tid', 'ii-auth-result');

  document.body.appendChild(button);
  document.body.appendChild(resultDiv);
}

window.IIAuthBundle = {
  performAuth,
  createAuthButton
};

createAuthButton();