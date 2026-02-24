// Entry Point
// Vanilla TypeScript - no framework dependencies

import './styles.css';
import { AppManager } from './App';
import { getElement, setText } from './dom';

// Theme Management
const THEME_KEY = 'hello-world-theme';

function initializeTheme(): void {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');

  document.documentElement.dataset.theme = theme;
  updateThemeIcon(theme);

  // Setup theme toggle
  const toggleBtn = getElement('theme-toggle');
  toggleBtn.addEventListener('click', toggleTheme);
}

function toggleTheme(): void {
  const current = document.documentElement.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';

  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme: string): void {
  setText('theme-icon', theme === 'dark' ? '☀️' : '🌙');
}

// Application Initialization
document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  void AppManager.create();
});
