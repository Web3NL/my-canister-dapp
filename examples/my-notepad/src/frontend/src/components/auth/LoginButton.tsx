import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/auth.module.css';

export function LoginButton() {
  const { login, isLoading } = useAuth();

  return (
    <button className={styles.loginBtn} onClick={login} disabled={isLoading}>
      {isLoading ? 'Connecting...' : 'Login with Internet Identity'}
    </button>
  );
}
