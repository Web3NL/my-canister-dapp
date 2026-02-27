import styles from '../../styles/ui.module.css';

export function LoadingOverlay() {
  return (
    <div className={styles.overlay}>
      <div className={styles.spinner} />
    </div>
  );
}
