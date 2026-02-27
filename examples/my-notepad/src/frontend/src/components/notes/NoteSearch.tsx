import { useNotes } from '../../contexts/NotesContext';
import { NOTE_COLORS } from '../../utils/noteColors';
import styles from '../../styles/notes.module.css';

export function NoteSearch() {
  const {
    searchQuery,
    colorFilter,
    viewMode,
    setSearch,
    setColorFilter,
    setViewMode,
  } = useNotes();

  return (
    <div className={styles.toolbar}>
      <input
        data-search-input
        type="text"
        className={styles.searchInput}
        placeholder="Search notes... (press /)"
        value={searchQuery}
        onChange={e => setSearch(e.target.value)}
      />
      <div className={styles.colorFilters}>
        {NOTE_COLORS.map(color => (
          <button
            key={color.id}
            type="button"
            className={`${styles.colorChip} ${colorFilter === color.id ? styles.colorChipActive : ''}`}
            style={{ backgroundColor: color.cssColor }}
            onClick={() =>
              setColorFilter(colorFilter === color.id ? null : color.id)
            }
            aria-label={`Filter ${color.label}`}
            title={`Filter: ${color.label}`}
          />
        ))}
      </div>
      <div className={styles.viewToggle}>
        <button
          type="button"
          className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
          onClick={() => setViewMode('grid')}
          aria-label="Grid view"
          title="Grid view"
        >
          Grid
        </button>
        <button
          type="button"
          className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
          onClick={() => setViewMode('list')}
          aria-label="List view"
          title="List view"
        >
          List
        </button>
      </div>
    </div>
  );
}
