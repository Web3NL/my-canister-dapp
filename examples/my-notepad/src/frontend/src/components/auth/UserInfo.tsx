import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/auth.module.css';

export function UserInfo() {
  const { principal, logout } = useAuth();

  return (
    <div className={styles.userInfo}>
      <span className={styles.principal} title={principal ?? ''}>
        {principal}
      </span>
      <button className={styles.logoutBtn} onClick={logout}>
        Logout
      </button>
    </div>
  );
}
