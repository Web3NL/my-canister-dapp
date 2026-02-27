import styles from '../../styles/notes.module.css';

export function NotesSkeleton() {
  return (
    <div className={styles.skeleton}>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div
            className={`${styles.skeletonLine} ${styles.skeletonLineShort}`}
          />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLine} />
          <div
            className={`${styles.skeletonLine} ${styles.skeletonLineXShort}`}
          />
        </div>
      ))}
    </div>
  );
}
