import type { CanisterStatusResponse } from '@icp-sdk/canisters/ic-management';
import { ManagementApi } from '../api/management';

interface StatusStore {
  getStatus: () => Promise<CanisterStatusResponse>;
  refresh: () => Promise<CanisterStatusResponse>;
}

function createStatusStore(): StatusStore {
  let statusCache: CanisterStatusResponse | null = null;
  let inFlight: Promise<CanisterStatusResponse> | null = null;

  const fetchStatus = async (): Promise<CanisterStatusResponse> => {
    const api = new ManagementApi();
    return api.getCanisterStatus();
  };

  const refresh = async (): Promise<CanisterStatusResponse> => {
    if (!inFlight) {
      inFlight = fetchStatus()
        .then(status => {
          statusCache = status;
          return status;
        })
        .finally(() => {
          inFlight = null;
        });
    }
    return inFlight;
  };

  const getStatus = async (): Promise<CanisterStatusResponse> => {
    if (statusCache) return statusCache;
    if (inFlight) return inFlight;
    return refresh();
  };

  return {
    getStatus,
    refresh,
  };
}

export const canisterStatusStore: StatusStore = createStatusStore();
