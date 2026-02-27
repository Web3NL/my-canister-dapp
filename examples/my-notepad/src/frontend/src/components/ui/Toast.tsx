import type { Toast as ToastData } from '../../contexts/ToastContext';
import styles from '../../styles/ui.module.css';

const typeClassMap: Record<string, string | undefined> = {
  error: styles.toastError,
  warning: styles.toastWarning,
  success: styles.toastSuccess,
  info: styles.toastInfo,
};

interface Props {
  toast: ToastData;
  onClose: () => void;
}

export function Toast({ toast, onClose }: Props) {
  return (
    <div className={`${styles.toast} ${typeClassMap[toast.type] ?? ''}`}>
      <span className={styles.toastMessage}>{toast.message}</span>
      <button
        className={styles.toastClose}
        onClick={onClose}
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
}
