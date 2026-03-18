<svelte:head>
  <title>My Canister Dapp - Fully owned decentralized apps</title>
</svelte:head>

<div class="page">
  <div class="gradient-orb orb-top"></div>
  <div class="gradient-orb orb-bottom"></div>

  <main>
    <section class="hero">
      <div class="logo">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="64"
          height="64"
        >
          <rect
            x="4"
            y="4"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            rx="2"
          />
          <circle cx="16" cy="16" r="3" fill="currentColor" />
        </svg>
      </div>

      <h1>My Canister Dapp</h1>
      <p class="tagline">Fully owned decentralized apps</p>

      <div class="cta-buttons">
        <a
          href="https://github.com/Web3NL/my-canister-dapp"
          class="btn btn-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <a href="/launch/faq" class="btn btn-secondary">FAQ</a>
      </div>
    </section>

    <section class="features">
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M12 8v8" />
              <path d="M8 12h8" />
            </svg>
          </div>
          <h3>Own your canister</h3>
          <p>
            You are the controller. No platform lock-in, full ownership of your
            on-chain app.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8" />
              <path d="M12 17v4" />
              <path d="M7 8l3 3-3 3" />
            </svg>
          </div>
          <h3>No CLI needed</h3>
          <p>
            Launch dapps from your browser. No terminal, no dfx — just click and
            go.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <h3>Internet Identity</h3>
          <p>
            Secure passwordless authentication via ICP's native identity system.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"
              />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </div>
          <h3>Open source</h3>
          <p>Build dapps with our open-source Rust crates and CLI tools.</p>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <p>
      Built on the <a
        href="https://internetcomputer.org"
        target="_blank"
        rel="noopener noreferrer">Internet Computer</a
      >
      &middot;
      <a
        href="https://github.com/Web3NL/my-canister-dapp"
        target="_blank"
        rel="noopener noreferrer">GitHub</a
      >
    </p>
  </footer>
</div>

<style>
  .page {
    min-height: 100vh;
    background: #0a0a0f;
    color: #f0f0f0;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .gradient-orb {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }

  .orb-top {
    width: 600px;
    height: 600px;
    top: -200px;
    right: -100px;
    background: radial-gradient(
      circle,
      rgba(88, 28, 135, 0.15) 0%,
      transparent 70%
    );
  }

  .orb-bottom {
    width: 500px;
    height: 500px;
    bottom: -150px;
    left: -100px;
    background: radial-gradient(
      circle,
      rgba(29, 78, 216, 0.1) 0%,
      transparent 70%
    );
  }

  main {
    flex: 1;
    position: relative;
    z-index: 1;
    max-width: 960px;
    margin: 0 auto;
    padding: 0 1.5rem;
    width: 100%;
    box-sizing: border-box;
  }

  .hero {
    text-align: center;
    padding: 8rem 0 4rem;
  }

  .logo {
    color: #c4b5fd;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 3rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0 0 0.75rem;
    background: linear-gradient(135deg, #f0f0f0 0%, #c4b5fd 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .tagline {
    font-size: 1.25rem;
    color: #9ca3af;
    margin: 0 0 2.5rem;
  }

  .cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .btn-primary {
    background: linear-gradient(135deg, #7c3aed, #4f46e5);
    color: #fff;
  }

  .btn-primary:hover {
    box-shadow: 0 0 20px rgba(124, 58, 237, 0.4);
    transform: translateY(-1px);
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.06);
    color: #d1d5db;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-1px);
  }

  .features {
    padding: 2rem 0 6rem;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }

  .feature-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 1.75rem;
    backdrop-filter: blur(10px);
    transition: all 0.2s ease;
  }

  .feature-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }

  .feature-icon {
    color: #a78bfa;
    margin-bottom: 1rem;
  }

  .feature-card h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
    color: #f0f0f0;
  }

  .feature-card p {
    font-size: 0.9rem;
    color: #9ca3af;
    line-height: 1.6;
    margin: 0;
  }

  footer {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 2rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  footer p {
    font-size: 0.85rem;
    color: #6b7280;
    margin: 0;
  }

  footer a {
    color: #9ca3af;
    text-decoration: none;
  }

  footer a:hover {
    color: #c4b5fd;
  }

  @media (max-width: 640px) {
    .hero {
      padding: 5rem 0 3rem;
    }

    h1 {
      font-size: 2rem;
    }

    .tagline {
      font-size: 1.05rem;
    }

    .feature-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
