import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNotes } from '../contexts/NotesContext';
import { useToast } from '../contexts/ToastContext';
import { NoteForm } from '../components/notes/NoteForm';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate } from '../utils/formatDate';
import styles from '../styles/notes.module.css';

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getNoteById, updateNote, deleteNote } = useNotes();
  const { addToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const noteId = Number(id);
  const note = getNoteById(noteId);

  if (!note) {
    return (
      <EmptyState
        icon="❓"
        title="Note not found"
        message="This note may have been deleted."
        action={
          <Link to="/" className={styles.btnPrimary}>
            Back to Notes
          </Link>
        }
      />
    );
  }

  async function handleUpdate(title: string, content: string, color: string) {
    setIsSubmitting(true);
    const updated = await updateNote({
      id: noteId,
      title: [title],
      content: [content],
      color: [color],
      pinned: [],
    });
    setIsSubmitting(false);
    if (updated) {
      addToast('Note updated', 'success');
      setIsEditing(false);
    }
  }

  async function handleTogglePin() {
    await updateNote({
      id: noteId,
      title: [],
      content: [],
      color: [],
      pinned: [!note!.pinned],
    });
  }

  async function handleDelete() {
    setShowDeleteConfirm(false);
    const deleted = await deleteNote(noteId);
    if (deleted) {
      addToast('Note deleted', 'success');
      navigate('/');
    }
  }

  if (isEditing) {
    return (
      <>
        <h2 style={{ marginBottom: 20 }}>Edit Note</h2>
        <NoteForm
          initialTitle={note.title}
          initialContent={note.content}
          initialColor={note.color}
          submitLabel="Save Changes"
          isSubmitting={isSubmitting}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className={styles.detailHeader}>
        <Link to="/" className={styles.btnSecondary}>
          Back
        </Link>
        <div className={styles.detailActions}>
          <button
            className={styles.btnIcon}
            onClick={handleTogglePin}
            title={note.pinned ? 'Unpin' : 'Pin'}
          >
            {note.pinned ? 'Unpin' : 'Pin'}
          </button>
          <button
            className={styles.btnSecondary}
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
          <button
            className={styles.btnDanger}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </button>
        </div>
      </div>
      <div className={styles.detailMeta}>
        <span>Created: {formatDate(note.created_at)}</span>
        <span>Updated: {formatDate(note.updated_at)}</span>
      </div>
      <h2 style={{ marginBottom: 16 }}>{note.title}</h2>
      <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
        {note.content || 'No content.'}
      </p>

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Note"
          message={`Are you sure you want to delete "${note.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
