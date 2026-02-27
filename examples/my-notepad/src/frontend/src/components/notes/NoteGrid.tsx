import type { Note } from '$declarations/my-notepad.did';
import { NoteCard } from './NoteCard';
import styles from '../../styles/notes.module.css';

interface Props {
  notes: Note[];
  viewMode: 'grid' | 'list';
}

export function NoteGrid({ notes, viewMode }: Props) {
  return (
    <div className={viewMode === 'grid' ? styles.grid : styles.list}>
      {notes.map(note => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
