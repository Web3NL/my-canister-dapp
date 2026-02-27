import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotes } from '../contexts/NotesContext';
import { useToast } from '../contexts/ToastContext';
import { NoteForm } from '../components/notes/NoteForm';

export default function NewNotePage() {
  const { addNote } = useNotes();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(title: string, content: string, color: string) {
    setIsSubmitting(true);
    const note = await addNote({
      title,
      content,
      color: color === 'default' ? [] : [color],
    });
    setIsSubmitting(false);
    if (note) {
      addToast('Note created', 'success');
      navigate('/');
    }
  }

  return (
    <>
      <h2 style={{ marginBottom: 20 }}>New Note</h2>
      <NoteForm
        submitLabel="Create Note"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/')}
      />
    </>
  );
}
