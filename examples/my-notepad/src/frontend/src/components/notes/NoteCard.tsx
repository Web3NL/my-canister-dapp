import { Link } from 'react-router-dom';
import type { Note } from '$declarations/my-notepad.did';
import { formatDate } from '../../utils/formatDate';
import styles from '../../styles/notes.module.css';

const colorClassMap: Record<string, string | undefined> = {
  red: styles.cardRed,
  blue: styles.cardBlue,
  green: styles.cardGreen,
  yellow: styles.cardYellow,
  purple: styles.cardPurple,
};

interface Props {
  note: Note;
}

export function NoteCard({ note }: Props) {
  const colorClass = colorClassMap[note.color] ?? '';

  return (
    <Link to={`/note/${note.id}`} className={`${styles.card} ${colorClass}`}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>{note.title}</span>
        {note.pinned && (
          <span className={styles.cardPinned} title="Pinned">
            Pin
          </span>
        )}
      </div>
      {note.content && <p className={styles.cardContent}>{note.content}</p>}
      <div className={styles.cardFooter}>
        <span>{formatDate(note.updated_at)}</span>
      </div>
    </Link>
  );
}
