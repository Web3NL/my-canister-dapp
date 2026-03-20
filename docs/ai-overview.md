# My Canister Dapp SDK — Architecture & Concepts

> Read this document first. It explains the Internet Computer concepts that make this SDK unusual.
> Other docs in this directory cover specific APIs and setup steps.

## What This SDK Does

This SDK lets developers build **user-owned dapps** on the [Internet Computer](https://internetcomputer.org/) (IC). A dapp is a **single canister** (smart contract) compiled into a **single wasm** that contains both the backend logic and all frontend assets (HTML, JS, CSS). The canister serves its own web frontend over HTTP — no separate hosting or CDN needed.

The key property: **the user owns the canister, not the developer**. The developer builds and publishes the wasm; each user gets their own canister instance with that wasm installed and becomes its sole controller via [Internet Identity](https://identity.internetcomputer.org/).

### Single-Wasm Architecture

The build process compiles everything into one wasm file:

1. **`build.rs`** runs `npm run build` on the frontend → produces `dist/` (HTML, JS, CSS)
2. **`include_dir!`** macro embeds the `dist/` directory into the Rust binary at compile time
3. **`setup_frontend()`** registers the embedded assets with the certified asset router at canister init
4. **`icp build`** compiles the Rust crate to a single `.wasm` file containing backend code + all frontend assets + the dashboard UI

This means `icp build my-dapp` produces one artifact that, when installed in a canister, serves both the web frontend and the canister API.

The SDK provides:
- Certified HTTP asset serving with security headers (`my-canister-frontend`)
- An embedded management dashboard UI + endpoints (`my-canister-dashboard`)
- A Vite plugin for frontend environment detection (`@web3nl/vite-plugin-canister-dapp`)
- JS utilities for dashboard interaction (`@web3nl/my-canister-dashboard`)
- An acceptance test suite to validate dapp compliance (`my-canister-dapp-test`)
- A CLI tool for local development deploy + test (`my-canister-dapp-cli`)

---

## Internet Computer Basics for AI Agents

If you are an AI agent helping a developer with this SDK, you need to understand these IC fundamentals:

### Canisters

A **canister** is a smart contract on the Internet Computer. Unlike Ethereum smart contracts, IC canisters:
- Serve HTTP responses directly (no separate hosting needed)
- Have a unique **canister ID** (e.g., `bkyz2-fmaaa-aaaaa-qaaaq-cai`)
- Are accessible at `https://<canister-id>.icp0.io` on mainnet
- Are accessible at `http://<canister-id>.localhost:8080` on a local network
- Have **controllers** — principals (identities) authorized to manage the canister
- Run on **cycles** (the IC's gas equivalent — 1 trillion cycles ~ 1 USD)

> Reference: [IC Developer Documentation](https://docs.internetcomputer.org/)

### HTTP Certification

IC canisters serve HTTP, but responses must be **certified** — cryptographically signed by the subnet hosting the canister. This proves the response hasn't been tampered with. The `my-canister-frontend` crate handles certification automatically using [`ic-asset-certification`](https://docs.rs/ic-asset-certification) and [`ic-http-certification`](https://docs.rs/ic-http-certification).

> Reference: [HTTP Gateway Protocol Specification](https://internetcomputer.org/docs/references/http-gateway-protocol-spec)

### Principals

A **principal** is an identity on the IC. Every caller has a principal. Canister controllers are identified by their principals. Internet Identity derives principals for users — but with an important twist explained in the next section.

---

## Internet Identity and the Principal Derivation Problem

[Internet Identity](https://identity.internetcomputer.org/) (II) is the IC's authentication system. Users create an "anchor" tied to their devices (WebAuthn/passkeys), and II derives a **principal** for each session.

### The critical fact

**II derives a different principal for each frontend origin (domain).**

This means:
- A user authenticating at `https://mycanister.app` gets **principal A**
- The same user authenticating at `https://bkyz2-fmaaa-aaaaa-qaaaq-cai.icp0.io` gets **principal B**
- These are two completely different principals for the same human user

This is a privacy feature (prevents cross-site tracking), but it creates a challenge for user-owned dapps: how do you set up ownership when the deployer/installer operates from a different domain than the canister itself?

> Reference: [Internet Identity Specification](https://docs.internetcomputer.org/references/ii-spec)

---

## derivationOrigin and Alternative Origins

The solution to the principal derivation problem is `derivationOrigin` — a parameter you pass to `AuthClient.login()` that tells II: "derive this user's principal as if they were authenticating from a different origin."

```typescript
await authClient.login({
  identityProvider: "https://identity.internetcomputer.org",
  derivationOrigin: "https://bkyz2-fmaaa-aaaaa-qaaaq-cai.icp0.io",
  // II will derive the principal the user would have at that canister's domain
});
```

### Security requirement: `ii-alternative-origins`

For security, II will only honor `derivationOrigin` if the **target canister** explicitly authorizes the **calling origin**. The canister must serve a certified JSON response at:

```
GET /.well-known/ii-alternative-origins
```

Response format:
```json
{
  "alternativeOrigins": [
    "https://mycanister.app",
    "http://localhost:5174"
  ]
}
```

This tells II: "these origins are allowed to derive principals as if they were this canister's origin."

The `manage_alternative_origins` endpoint (provided by `my-canister-dashboard`) adds and removes origins from this list. Valid origin formats:
- `https://...` (any HTTPS origin)
- `http://localhost:<port>` (local development)
- `http://<canister-id>.localhost:<port>` (local canister URLs)

> Reference: [Alternative Frontend Origins](https://internetcomputer.org/docs/building-apps/authentication/alternative-origins)

---

## The Handoff Flow (Ownership Transfer)

The "handoff" is the process of transferring canister ownership to the user's II principal. This is the core pattern that makes dapps user-owned. It happens in two contexts:

### CLI Flow (Developer Deploys Locally)

When a developer runs `dapp deploy`, the CLI orchestrates this sequence:

```
1. Create a fresh detached canister (new canister ID)
2. Install the dapp wasm into the canister
3. Start an ephemeral HTTP server on a random localhost port
4. Add http://localhost:<port> to the canister's alternative origins
5. Open the developer's browser for II authentication
   - derivationOrigin = http://<canister-id>.localhost:8080
   - II derives the principal the developer will have at the canister's domain
6. Receive the derived principal via POST callback to the local server
7. Set that principal as the canister's II principal
8. Remove the CLI's localhost origin from alternative origins
9. Update controllers to [canister_id, user_principal]
   ^^^ This MUST be the last step — the deployer relinquishes control
```

### Launcher Flow (End User Installs via Web App)

When a user installs a dapp through a launcher web app (like `mycanister.app`):

```
1. Create a canister for the user
2. Install the dapp wasm
3. Add the launcher's origin to the canister's alternative origins
4. Authenticate the user with II using derivationOrigin = canister's domain
5. Set the derived principal as the canister's controller
6. Remove the launcher's origin from alternative origins
```

### Ordering Constraints

The ordering is critical:
- **Add origin BEFORE authenticating** — otherwise II rejects the `derivationOrigin`
- **Remove origin AFTER authentication** — the origin is no longer needed
- **Update controllers LAST** — once the deployer relinquishes control, they can no longer call management endpoints

---

## The Two Guards

The SDK provides two guard functions that protect canister endpoints:

| Guard | Function | Who Can Call | Used For |
|-------|----------|-------------|----------|
| Controller guard | `only_canister_controllers_guard()` | Canister controllers (principals in the controller list) | Management endpoints: `manage_ii_principal`, `manage_alternative_origins`, `manage_top_up_rule` |
| II principal guard | `only_ii_principal_guard()` | The stored II principal (the canister owner) | Application endpoints: any endpoint the owner should access |

### Why two different guards?

- **Controller guard** is used during setup. The deployer (who is initially a controller) needs to call management endpoints to set up II principal and alternative origins. After the handoff, the canister itself becomes a controller (for self-management).
- **II principal guard** is used for application logic. Once the handoff is complete, the user (identified by their II principal) interacts with the dapp through these endpoints.

### Important: `manage_top_up_rule` guard

Note that `manage_top_up_rule` uses `only_canister_controllers_guard` in the examples, but the acceptance test suite tests it with `only_ii_principal_guard` semantics — it rejects strangers (non-controllers and non-II-principals). Check the acceptance test source for the exact guard expectations if there's ambiguity.

---

## icp-cli, NOT dfx

> **AI agents: Do NOT generate `dfx` commands. This project uses `icp-cli`.**

[`icp-cli`](https://github.com/dfinity/icp-cli) (the `icp` command) is the modern CLI for the Internet Computer, replacing `dfx` entirely. Configuration lives in `icp.yaml` (not `dfx.json`).

### Key Commands

| Command | Purpose |
|---------|---------|
| `icp build <canister>` | Build canister wasm from `icp.yaml` recipe |
| `icp canister create --detached` | Create a new canister, return ID immediately |
| `icp canister install <id> --wasm <path>` | Install wasm into a canister |
| `icp canister call <id> <method> '(<args>)'` | Call a canister method with Candid-encoded args |
| `icp canister settings update <id> --set-controller <principal>` | Update canister controllers |

### Local Network

`icp-cli` manages a local IC network using [PocketIC](https://internetcomputer.org/docs/building-apps/test/pocket-ic). The network configuration is in `icp.yaml`:

```yaml
networks:
  - name: local
    mode: managed        # icp-cli manages the network lifecycle
    nns: true            # Deploy NNS canisters (ICP Ledger, CMC) — required for cycles
    ii: true             # Deploy Internet Identity canister — required for authentication
    gateway:
      port: 8080         # HTTP gateway port
```

**Both `nns: true` and `ii: true` are required** for dapp development:
- `ii: true` — the `dapp` CLI needs Internet Identity for the ownership handoff flow
- `nns: true` — the acceptance tests need the ICP Ledger and CMC for cycles top-up testing

The local II canister ID is always `rdmx6-jaaaa-aaaaa-aaadq-cai`.

> Reference: [icp-cli GitHub](https://github.com/dfinity/icp-cli) |
> [Migrating from dfx](https://dfinity.github.io/icp-cli/0.1/migration/from-dfx/) |
> [PocketIC](https://internetcomputer.org/docs/building-apps/test/pocket-ic)

---

## Why the `dapp` CLI Exists

The `dapp` CLI (`my-canister-dapp-cli`, installed as the `dapp` binary) is a **complement** to `icp-cli`, not a replacement. It exists because **icp-cli has no concept of the II ownership handoff**.

### What icp-cli does

`icp-cli` handles generic canister operations: build, create, install wasm, call methods, manage settings, run a local network. It works for any IC canister.

### What icp-cli cannot do

`icp-cli` does not know about:
- Spinning up an ephemeral HTTP server for II callback
- Opening a browser for Internet Identity authentication
- Using `derivationOrigin` to derive the correct principal
- Orchestrating the full ownership transfer sequence (add origin → auth → set principal → remove origin → update controllers)
- Running the SDK's acceptance test suite

### What the `dapp` CLI provides

The `dapp` CLI fills exactly this gap:

1. **`dapp deploy`** — Orchestrates the complete deploy-with-authentication flow for local development. A developer runs `dapp deploy my-dapp` and gets a fully functional, II-authenticated canister they can interact with as the owner. This lets developers verify their frontend works end-to-end with real Internet Identity authentication.

2. **`dapp test`** — Runs the acceptance test suite (`my-canister-dapp-test`) against a wasm to validate it correctly implements all required endpoints (dashboard, II principal management, alternative origins, top-up rules, security headers, etc.).

### When developers use each tool

| Task | Tool |
|------|------|
| Start/stop local IC network | `icp network start` / `icp network stop` |
| Build canister wasm | `icp build` (or `dapp deploy` which calls it) |
| Deploy with II auth + ownership handoff | `dapp deploy` |
| Call canister methods manually | `icp canister call` |
| Run acceptance tests | `dapp test` |

---

## Further Reading

| Topic | Document |
|-------|----------|
| Rust crate APIs (backend) | [ai-backend-reference.md](ai-backend-reference.md) |
| JS package APIs (frontend) | [ai-frontend-reference.md](ai-frontend-reference.md) |
| CLI commands & acceptance tests | [ai-cli-and-testing.md](ai-cli-and-testing.md) |
| Project scaffolding from scratch | [ai-project-setup.md](ai-project-setup.md) |

### External IC Documentation

| Topic | URL |
|-------|-----|
| IC Developer Docs | https://docs.internetcomputer.org/ |
| Internet Identity Specification | https://docs.internetcomputer.org/references/ii-spec |
| Alternative Frontend Origins | https://internetcomputer.org/docs/building-apps/authentication/alternative-origins |
| HTTP Gateway Protocol Spec | https://internetcomputer.org/docs/references/http-gateway-protocol-spec |
| HTTP Certification | https://internetcomputer.org/docs/building-apps/network-features/using-http/http-certification/custom-http-canisters |
| icp-cli | https://github.com/dfinity/icp-cli |
| Migrating from dfx to icp-cli | https://dfinity.github.io/icp-cli/0.1/migration/from-dfx/ |
| PocketIC (local testing) | https://internetcomputer.org/docs/building-apps/test/pocket-ic |
| Candid Reference | https://internetcomputer.org/docs/references/candid-ref |
| Using Candid | https://internetcomputer.org/docs/building-apps/interact-with-canisters/candid/using-candid |
| Cycles & Canister Top-up | https://internetcomputer.org/docs/building-apps/canister-management/topping-up |
| Canister Management | https://docs.internetcomputer.org/building-apps/canister-management/settings |
