interface NoteColor {
  id: string;
  label: string;
  cssColor: string;
}

export const NOTE_COLORS: NoteColor[] = [
  { id: 'default', label: 'Default', cssColor: 'var(--color-bg-tertiary)' },
  { id: 'red', label: 'Red', cssColor: '#ef4444' },
  { id: 'blue', label: 'Blue', cssColor: '#3b82f6' },
  { id: 'green', label: 'Green', cssColor: '#10b981' },
  { id: 'yellow', label: 'Yellow', cssColor: '#eab308' },
  { id: 'purple', label: 'Purple', cssColor: '#8b5cf6' },
];
