import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { LoadingOverlay } from '../ui/LoadingOverlay';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useCyclesChecker } from '../../hooks/useCyclesChecker';
import styles from '../../styles/layout.module.css';

export function Layout() {
  useKeyboardShortcuts();
  useCyclesChecker();

  return (
    <>
      <Header />
      <main className={styles.main}>
        <Suspense fallback={<LoadingOverlay />}>
          <Outlet />
        </Suspense>
      </main>
    </>
  );
}
