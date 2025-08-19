import { toastsStore } from '@dfinity/gix-components';
import type { ToastLevel } from '@dfinity/gix-components';

function showTopToast(params: { text: string; level: ToastLevel }): symbol {
  return toastsStore.show({ ...params, position: 'top' });
}

export const showErrorToast = (text: string) =>
  showTopToast({ text, level: 'error' });
export const showWarnToast = (text: string) =>
  showTopToast({ text, level: 'warn' });
