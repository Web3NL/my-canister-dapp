export const NETWORK_ERROR_MESSAGE =
  'Network error occurred. Please try again.';
export const INVALID_PRINCIPAL_MESSAGE = 'Invalid principal format.';
export const INSUFFICIENT_BALANCE_MESSAGE =
  'Insufficient balance for this operation.';
export const DUPLICATE_CONTROLLER_MESSAGE = 'Controller already exists.';
export const CONTROLLER_NOT_FOUND_MESSAGE = 'Controller not found.';
export const REQUIRED_CONTROLLERS_MESSAGE =
  'Cannot remove required controllers.';
export const INVALID_ORIGIN_MESSAGE =
  "URL must start with 'http://localhost:', 'http://*.localhost:', or 'https://'";
export const CANISTER_ID_ERROR_MESSAGE = 'Unable to determine canister ID.';
export const HTTP_AGENT_ERROR_MESSAGE = 'Failed to create HTTP agent.';
export const DASHBOARD_INIT_ERROR_MESSAGE = 'Failed to initialize dashboard.';

export { showError } from './dom';
