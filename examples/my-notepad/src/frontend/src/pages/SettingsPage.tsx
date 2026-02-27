import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import styles from '../styles/notes.module.css';

export default function SettingsPage() {
  const { principal } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <h2 style={{ marginBottom: 24 }}>Settings</h2>
      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Theme</label>
          <button
            className={styles.btnSecondary}
            onClick={toggleTheme}
            style={{ alignSelf: 'flex-start' }}
          >
            Switch to {theme === 'light' ? 'dark' : 'light'} mode
          </button>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Principal</label>
          <code style={{ fontSize: '0.8125rem', wordBreak: 'break-all' }}>
            {principal}
          </code>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Canister Dashboard</label>
          <a
            href="/canister-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnSecondary}
            style={{
              alignSelf: 'flex-start',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Open Dashboard
          </a>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Keyboard Shortcuts</label>
          <div
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <p>
              <kbd>Ctrl/Cmd + N</kbd> — New note
            </p>
            <p>
              <kbd>/</kbd> — Focus search
            </p>
            <p>
              <kbd>Escape</kbd> — Back to notes
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
