import { Link } from 'react-router-dom';
import { useNotes } from '../contexts/NotesContext';
import { NoteSearch } from '../components/notes/NoteSearch';
import { NoteGrid } from '../components/notes/NoteGrid';
import { NotesSkeleton } from '../components/notes/NotesSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import styles from '../styles/notes.module.css';

export default function NotesPage() {
  const {
    filteredNotes,
    isLoading,
    viewMode,
    notes,
    searchQuery,
    colorFilter,
  } = useNotes();

  if (isLoading) {
    return <NotesSkeleton />;
  }

  const hasFilters = searchQuery || colorFilter;

  return (
    <>
      {notes.length > 0 && <NoteSearch />}
      {filteredNotes.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon="🔍"
            title="No matching notes"
            message="Try adjusting your search or filters."
          />
        ) : (
          <EmptyState
            icon="📝"
            title="No notes yet"
            message="Create your first note to get started."
            action={
              <Link to="/new" className={styles.btnPrimary}>
                Create Note
              </Link>
            }
          />
        )
      ) : (
        <NoteGrid notes={filteredNotes} viewMode={viewMode} />
      )}
    </>
  );
}
