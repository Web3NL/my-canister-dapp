// Generic/common
export const NETWORK_ERROR_MESSAGE =
  'Network error occurred. Please try again.';
export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';
export const DASHBOARD_INIT_ERROR_MESSAGE = 'Failed to initialize dashboard.';
// Validation messages
export const INVALID_PRINCIPAL_MESSAGE = 'Invalid principal format.';
export const INVALID_ORIGIN_MESSAGE =
  "URL must start with 'http://localhost:', 'http://*.localhost:', or 'https://'";
export const SELECT_THRESHOLD_AMOUNT_MESSAGE =
  'Please select threshold and amount.';
// Environment/agent
export const CANISTER_ID_ERROR_MESSAGE = 'Unable to determine canister ID.';
export const HTTP_AGENT_ERROR_MESSAGE = 'Failed to create HTTP agent.';
// Auth/session
export const NOT_AUTHORIZED_MESSAGE =
  'You are not authorized to access this application.';
export const LOGOUT_FAILED_MESSAGE = 'Logout failed. Please try again.';
export const AUTH_MANAGER_NOT_INITIALIZED_MESSAGE =
  'Auth manager not initialized';
export const USER_NOT_AUTHENTICATED_MESSAGE = 'User is not authenticated';
// Alternative origins
export const FAILED_ADD_ALT_ORIGIN_MESSAGE_PREFIX =
  'Failed to add alternative origin';
export const UNKNOWN_ADD_ALT_ORIGIN_MESSAGE =
  'Unknown error adding alternative origin';
export const FAILED_REMOVE_ALT_ORIGIN_MESSAGE_PREFIX =
  'Failed to remove alternative origin';
export const UNKNOWN_REMOVE_ALT_ORIGIN_MESSAGE =
  'Unknown error removing alternative origin';
// Top-up and controllers
export const INSUFFICIENT_BALANCE_MESSAGE =
  'Insufficient balance for this operation.';
export const TOP_UP_RULE_ERROR_PREFIX = 'TopUpRule Error:';
export const TOP_UP_ERROR_PREFIX = 'TopUpError:';
export const DUPLICATE_CONTROLLER_MESSAGE = 'Controller already exists.';
export const CONTROLLER_NOT_FOUND_MESSAGE = 'Controller not found.';
export const REQUIRED_CONTROLLERS_MESSAGE =
  'Cannot remove required controllers.';

import { showError } from './dom';
export { showError };

export function reportError(message: string, error?: unknown): void {
  if (error) console.error(message, error);
  else console.error(message);
  // Also surface the message in the UI error area
  try {
    showError(message);
  } catch {
    // DOM might not be ready yet; ignore
  }
}
