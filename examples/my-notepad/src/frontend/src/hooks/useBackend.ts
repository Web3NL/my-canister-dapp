import { useMemo } from 'react';
import { inferCanisterId } from '@web3nl/vite-plugin-canister-dapp/runtime';
import { createActor } from '$declarations/index';
import { useAuth } from '../contexts/AuthContext';

export function useBackend() {
  const { agent } = useAuth();

  return useMemo(() => {
    if (!agent) return null;
    const canisterId = inferCanisterId();
    return createActor(canisterId, { agent });
  }, [agent]);
}
