// Theme management for light/dark mode

const THEME_STORAGE_KEY = 'canister-dashboard-theme';

type Theme = 'light' | 'dark';

function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getStoredTheme(): Theme | null {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return null;
}

function getCurrentTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

function applyTheme(theme: Theme): void {
  // CSS handles icon visibility based on data-theme attribute
  document.documentElement.dataset.theme = theme;
}

function toggleTheme(): void {
  const current = getCurrentTheme();
  const newTheme: Theme = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  applyTheme(newTheme);
}

export function initializeTheme(): void {
  // Apply theme immediately
  const theme = getCurrentTheme();
  applyTheme(theme);

  // Set up toggle button
  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }

  // Listen for system theme changes
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', e => {
      // Only auto-switch if user hasn't set a preference
      if (!getStoredTheme()) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
}
