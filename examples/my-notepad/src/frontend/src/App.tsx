import { lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotesProvider } from './contexts/NotesContext';
import { Layout } from './components/layout/Layout';
import { ToastContainer } from './components/ui/ToastContainer';
import { LoadingOverlay } from './components/ui/LoadingOverlay';
import { LoginButton } from './components/auth/LoginButton';
import styles from './styles/auth.module.css';

const NotesPage = lazy(() => import('./pages/NotesPage'));
const NewNotePage = lazy(() => import('./pages/NewNotePage'));
const NoteDetailPage = lazy(() => import('./pages/NoteDetailPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.authPage}>
        <img src="/favicon.svg" alt="My Notepad" className={styles.authLogo} />
        <h1 className={styles.authTitle}>My Notepad</h1>
        <p className={styles.authSubtitle}>
          A user-owned notepad dapp on the Internet Computer. Login with
          Internet Identity to manage your notes.
        </p>
        <LoginButton />
      </div>
    );
  }

  return (
    <NotesProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<NotesPage />} />
            <Route path="new" element={<NewNotePage />} />
            <Route path="note/:id" element={<NoteDetailPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </NotesProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AuthGate />
          <ToastContainer />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
