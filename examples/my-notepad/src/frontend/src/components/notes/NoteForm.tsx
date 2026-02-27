import { useState, useRef, useEffect, type FormEvent } from 'react';
import { NoteColorPicker } from './NoteColorPicker';
import styles from '../../styles/notes.module.css';

interface Props {
  initialTitle?: string;
  initialContent?: string;
  initialColor?: string;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (title: string, content: string, color: string) => void;
  onCancel?: () => void;
}

export function NoteForm({
  initialTitle = '',
  initialContent = '',
  initialColor = 'default',
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [color, setColor] = useState(initialColor);
  const [titleError, setTitleError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(200, textarea.scrollHeight)}px`;
    }
  }, [content]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError('Title is required');
      return;
    }
    if (trimmedTitle.length > 200) {
      setTitleError('Title must be under 200 characters');
      return;
    }
    setTitleError('');
    onSubmit(trimmedTitle, content, color);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="note-title">
          Title
        </label>
        <input
          id="note-title"
          className={styles.formInput}
          type="text"
          value={title}
          onChange={e => {
            setTitle(e.target.value);
            if (titleError) setTitleError('');
          }}
          placeholder="Note title"
          maxLength={200}
          autoFocus
        />
        {titleError && <span className={styles.formError}>{titleError}</span>}
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="note-content">
          Content
        </label>
        <textarea
          ref={textareaRef}
          id="note-content"
          className={styles.formTextarea}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write your note..."
          maxLength={10000}
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Color</label>
        <NoteColorPicker selected={color} onChange={setColor} />
      </div>
      <div className={styles.formActions}>
        <button
          type="submit"
          className={styles.btnPrimary}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
