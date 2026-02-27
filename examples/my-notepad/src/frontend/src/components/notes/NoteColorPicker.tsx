import { NOTE_COLORS } from '../../utils/noteColors';
import styles from '../../styles/notes.module.css';

interface Props {
  selected: string;
  onChange: (color: string) => void;
}

export function NoteColorPicker({ selected, onChange }: Props) {
  return (
    <div className={styles.colorFilters}>
      {NOTE_COLORS.map(color => (
        <button
          key={color.id}
          type="button"
          className={`${styles.colorChip} ${selected === color.id ? styles.colorChipActive : ''}`}
          style={{ backgroundColor: color.cssColor }}
          onClick={() => onChange(color.id)}
          aria-label={color.label}
          title={color.label}
        />
      ))}
    </div>
  );
}
