import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type {
  Note,
  AddNoteArg,
  UpdateNoteArg,
} from '$declarations/my-notepad.did';
import { useAuth } from './AuthContext';
import { useBackend } from '../hooks/useBackend';
import { useToast } from './ToastContext';
import { ERROR_MESSAGES } from '../utils/constants';

type ViewMode = 'grid' | 'list';

interface NotesState {
  notes: Note[];
  isLoading: boolean;
  searchQuery: string;
  colorFilter: string | null;
  viewMode: ViewMode;
}

type NotesAction =
  | { type: 'SET_NOTES'; notes: Note[] }
  | { type: 'ADD_NOTE'; note: Note }
  | { type: 'UPDATE_NOTE'; note: Note }
  | { type: 'DELETE_NOTE'; id: number }
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'SET_COLOR_FILTER'; color: string | null }
  | { type: 'SET_VIEW_MODE'; mode: ViewMode };

function notesReducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case 'SET_NOTES':
      return { ...state, notes: action.notes, isLoading: false };
    case 'ADD_NOTE':
      return { ...state, notes: [action.note, ...state.notes] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(n =>
          n.id === action.note.id ? action.note : n
        ),
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(n => n.id !== action.id),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };
    case 'SET_COLOR_FILTER':
      return { ...state, colorFilter: action.color };
    case 'SET_VIEW_MODE':
      localStorage.setItem('notepad-view-mode', action.mode);
      return { ...state, viewMode: action.mode };
  }
}

function getInitialViewMode(): ViewMode {
  const stored = localStorage.getItem('notepad-view-mode');
  return stored === 'list' ? 'list' : 'grid';
}

interface NotesContextValue {
  notes: Note[];
  filteredNotes: Note[];
  isLoading: boolean;
  searchQuery: string;
  colorFilter: string | null;
  viewMode: ViewMode;
  loadNotes: () => Promise<void>;
  addNote: (arg: AddNoteArg) => Promise<Note | null>;
  updateNote: (arg: UpdateNoteArg) => Promise<Note | null>;
  deleteNote: (id: number) => Promise<boolean>;
  setSearch: (query: string) => void;
  setColorFilter: (color: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
  getNoteById: (id: number) => Note | undefined;
}

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const backend = useBackend();
  const { addToast } = useToast();

  const [state, dispatch] = useReducer(notesReducer, {
    notes: [],
    isLoading: true,
    searchQuery: '',
    colorFilter: null,
    viewMode: getInitialViewMode(),
  });

  const loadNotes = useCallback(async () => {
    if (!backend) return;
    dispatch({ type: 'SET_LOADING', isLoading: true });
    try {
      const notes = await backend.get_notes();
      dispatch({ type: 'SET_NOTES', notes });
    } catch {
      addToast(ERROR_MESSAGES.BACKEND_CALL_FAILED, 'error');
      dispatch({ type: 'SET_LOADING', isLoading: false });
    }
  }, [backend, addToast]);

  useEffect(() => {
    if (isAuthenticated && backend) {
      loadNotes();
    } else {
      dispatch({ type: 'SET_NOTES', notes: [] });
    }
  }, [isAuthenticated, backend, loadNotes]);

  const addNote = useCallback(
    async (arg: AddNoteArg): Promise<Note | null> => {
      if (!backend) return null;
      try {
        const result = await backend.add_note(arg);
        if ('Ok' in result) {
          dispatch({ type: 'ADD_NOTE', note: result.Ok });
          return result.Ok;
        }
        addToast(result.Err, 'error');
        return null;
      } catch {
        addToast(ERROR_MESSAGES.BACKEND_CALL_FAILED, 'error');
        return null;
      }
    },
    [backend, addToast]
  );

  const updateNote = useCallback(
    async (arg: UpdateNoteArg): Promise<Note | null> => {
      if (!backend) return null;
      try {
        const result = await backend.update_note(arg);
        if ('Ok' in result) {
          dispatch({ type: 'UPDATE_NOTE', note: result.Ok });
          return result.Ok;
        }
        addToast(result.Err, 'error');
        return null;
      } catch {
        addToast(ERROR_MESSAGES.BACKEND_CALL_FAILED, 'error');
        return null;
      }
    },
    [backend, addToast]
  );

  const deleteNote = useCallback(
    async (id: number): Promise<boolean> => {
      if (!backend) return false;
      try {
        const result = await backend.delete_note(id);
        if ('Ok' in result) {
          dispatch({ type: 'DELETE_NOTE', id });
          return true;
        }
        addToast(result.Err, 'error');
        return false;
      } catch {
        addToast(ERROR_MESSAGES.BACKEND_CALL_FAILED, 'error');
        return false;
      }
    },
    [backend, addToast]
  );

  const setSearch = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH', query });
  }, []);

  const setColorFilter = useCallback((color: string | null) => {
    dispatch({ type: 'SET_COLOR_FILTER', color });
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', mode });
  }, []);

  const getNoteById = useCallback(
    (id: number) => state.notes.find(n => n.id === id),
    [state.notes]
  );

  const filteredNotes = useMemo(() => {
    let result = [...state.notes];

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      result = result.filter(
        n =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      );
    }

    if (state.colorFilter) {
      result = result.filter(n => n.color === state.colorFilter);
    }

    result.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return Number(b.updated_at) - Number(a.updated_at);
    });

    return result;
  }, [state.notes, state.searchQuery, state.colorFilter]);

  return (
    <NotesContext.Provider
      value={{
        notes: state.notes,
        filteredNotes,
        isLoading: state.isLoading,
        searchQuery: state.searchQuery,
        colorFilter: state.colorFilter,
        viewMode: state.viewMode,
        loadNotes,
        addNote,
        updateNote,
        deleteNote,
        setSearch,
        setColorFilter,
        setViewMode,
        getNoteById,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes(): NotesContextValue {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
}
