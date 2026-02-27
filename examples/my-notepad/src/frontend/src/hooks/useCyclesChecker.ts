import { useEffect } from 'react';
import { MyCanisterDashboard } from '@web3nl/my-canister-dashboard';
import { inferCanisterId } from '@web3nl/vite-plugin-canister-dapp/runtime';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export function useCyclesChecker() {
  const { agent, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (!isAuthenticated || !agent) return;

    (async () => {
      try {
        const canisterId = inferCanisterId();
        const dashboard = MyCanisterDashboard.create(agent, canisterId);
        const result = await dashboard.checkCyclesBalance();
        if ('error' in result) {
          addToast(
            `${result.error} Visit the Canister Dashboard to top up.`,
            'warning'
          );
        }
      } catch {
        // Cycles check is non-critical — fail silently
      }
    })();
  }, [isAuthenticated, agent, addToast]);
}
