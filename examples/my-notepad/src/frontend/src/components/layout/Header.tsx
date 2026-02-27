import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Navigation } from './Navigation';
import { UserInfo } from '../auth/UserInfo';
import styles from '../../styles/layout.module.css';

export function Header() {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <img src="/favicon.svg" alt="My Notepad" className={styles.logo} />
        {isAuthenticated && <Navigation />}
      </div>
      <div className={styles.headerRight}>
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
        {isAuthenticated && <UserInfo />}
      </div>
    </header>
  );
}
