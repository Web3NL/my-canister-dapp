export const ERROR_MESSAGES = {
  LOGIN_FAILED: 'Failed to login with Internet Identity. Please try again.',
  NOT_AUTHORIZED:
    'You are not authorized. Please set up your principal in the Canister Dashboard.',
  BACKEND_CALL_FAILED: 'Failed to communicate with the backend.',
  CYCLES_CHECK_FAILED: 'Could not check cycles balance.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
} as const;
