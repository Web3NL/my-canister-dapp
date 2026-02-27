import { NavLink } from 'react-router-dom';
import styles from '../../styles/layout.module.css';

export function Navigation() {
  return (
    <nav className={styles.nav}>
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
        }
      >
        Notes
      </NavLink>
      <NavLink
        to="/new"
        className={({ isActive }) =>
          `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
        }
      >
        New
      </NavLink>
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
        }
      >
        Settings
      </NavLink>
    </nav>
  );
}
