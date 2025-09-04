/**
 * Configuration interface for My Canister Dashboard in development mode
 */
export interface CanisterDashboardDevConfig {
  /** Canister ID (optional) */
  canisterId: string | undefined;
  /** DFX host URL for example http://localhost:8080 */
  dfxHost: string;
  /** Internet Identity provider URL for example http://iiCanisterId.localhost:8080 */
  identityProvider: string;
}
