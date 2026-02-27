import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { AuthClient } from '@icp-sdk/auth/client';
import { HttpAgent } from '@icp-sdk/core/agent';
import {
  inferEnvironment,
  isDevMode,
} from '@web3nl/vite-plugin-canister-dapp/runtime';
import { MyCanisterDashboard } from '@web3nl/my-canister-dashboard';
import { inferCanisterId } from '@web3nl/vite-plugin-canister-dapp/runtime';
import { useToast } from './ToastContext';
import { ERROR_MESSAGES } from '../utils/constants';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  principal: string | null;
  agent: HttpAgent | null;
}

interface AuthContextValue extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    principal: null,
    agent: null,
  });
  const { addToast } = useToast();

  const setupAgent = useCallback(async (client: AuthClient) => {
    const identity = client.getIdentity();
    const env = inferEnvironment();
    const agent = await HttpAgent.create({
      identity,
      host: env.host,
    });
    if (isDevMode()) {
      await agent.fetchRootKey();
    }
    return { agent, identity };
  }, []);

  const checkAuthorization = useCallback(
    async (agent: HttpAgent) => {
      try {
        const canisterId = inferCanisterId();
        const dashboard = MyCanisterDashboard.create(agent, canisterId);
        return await dashboard.isAuthenticated();
      } catch {
        addToast(ERROR_MESSAGES.NOT_AUTHORIZED, 'warning');
        return false;
      }
    },
    [addToast]
  );

  // Initialize auth client on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const client = await AuthClient.create();
        if (cancelled) return;
        setAuthClient(client);

        if (await client.isAuthenticated()) {
          const { agent } = await setupAgent(client);
          const authorized = await checkAuthorization(agent);
          if (cancelled) return;
          if (authorized) {
            setState({
              isAuthenticated: true,
              isLoading: false,
              principal: client.getIdentity().getPrincipal().toString(),
              agent,
            });
            return;
          }
        }
        if (!cancelled) {
          setState(s => ({ ...s, isLoading: false }));
        }
      } catch {
        if (!cancelled) {
          setState(s => ({ ...s, isLoading: false }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setupAgent, checkAuthorization]);

  const login = useCallback(async () => {
    if (!authClient) return;
    setState(s => ({ ...s, isLoading: true }));
    try {
      const env = inferEnvironment();
      await new Promise<void>((resolve, reject) => {
        authClient.login({
          identityProvider: env.identityProvider,
          onSuccess: () => resolve(),
          onError: err => reject(new Error(err)),
        });
      });
      const { agent } = await setupAgent(authClient);
      const authorized = await checkAuthorization(agent);
      if (authorized) {
        setState({
          isAuthenticated: true,
          isLoading: false,
          principal: authClient.getIdentity().getPrincipal().toString(),
          agent,
        });
      } else {
        setState(s => ({ ...s, isLoading: false }));
      }
    } catch {
      addToast(ERROR_MESSAGES.LOGIN_FAILED, 'error');
      setState(s => ({ ...s, isLoading: false }));
    }
  }, [authClient, setupAgent, checkAuthorization, addToast]);

  const logout = useCallback(async () => {
    if (authClient) {
      await authClient.logout();
    }
    setState({
      isAuthenticated: false,
      isLoading: false,
      principal: null,
      agent: null,
    });
  }, [authClient]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
