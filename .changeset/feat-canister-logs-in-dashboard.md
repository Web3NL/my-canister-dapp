---
'canister-dashboard-frontend': minor
---

feat: canister logs in dashboard

- Add Canister Logs section to the dashboard and component
- Add api call (fetches from management canister)
- Add data-testid attributes to Refresh buttons: `refresh-balance-btn`, `refresh-logs-btn` to avoid conflicts
- Update E2E to use data-testid for balance refresh button
