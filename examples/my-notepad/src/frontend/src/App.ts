// Main Application Manager

import { createActor } from '$declarations/index.js';
import { authManager } from './auth';
import { createCyclesChecker } from './cyclesChecker';
import {
  addEventListener,
  getInputValue,
  getTextareaValue,
  clearInput,
  setText,
  setHtml,
  toggleVisibility,
  showError,
  clearAllNotifications,
  showLoading,
  hideLoading,
} from './dom';
import {
  NOT_AUTHORIZED_MESSAGE,
  BACKEND_CALL_FAILED_MESSAGE,
  CYCLES_CHECK_FAILED_MESSAGE,
} from './constants';
import { inferCanisterId } from '@web3nl/vite-plugin-canister-dapp/runtime';

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: bigint;
}

interface AddNoteResult {
  Ok?: Note;
  Err?: string;
}

interface DeleteNoteResult {
  Ok?: null;
  Err?: string;
}

export class AppManager {
  private notes: Note[] = [];

  private constructor() {}

  static async create(): Promise<AppManager> {
    const instance = new AppManager();
    await instance.initialize();
    return instance;
  }

  private async initialize(): Promise<void> {
    const isAuthenticated = await authManager.init();

    if (isAuthenticated) {
      const isAuthorized = await authManager.checkAuthorization();
      if (!isAuthorized) {
        showError(NOT_AUTHORIZED_MESSAGE);
        await authManager.logout();
        this.setLoggedOutState();
        return;
      }
      this.setLoggedInState();
      await this.checkCycles();
      await this.loadNotes();
    } else {
      this.setLoggedOutState();
    }
  }

  private setLoggedInState(): void {
    const principal = authManager.getPrincipalText();

    toggleVisibility('auth-logged-out', false);
    toggleVisibility('auth-logged-in', true);
    setText('principal', principal);
    toggleVisibility('dashboard-section', true);
    toggleVisibility('notes-section', true);

    addEventListener('logout-btn', 'click', () => this.handleLogout());
    addEventListener('dashboard-btn', 'click', () =>
      this.handleOpenDashboard()
    );
    addEventListener('add-note-form', 'submit', e => this.handleAddNote(e));
  }

  private setLoggedOutState(): void {
    toggleVisibility('auth-logged-out', true);
    toggleVisibility('auth-logged-in', false);
    setText('principal', '');
    toggleVisibility('dashboard-section', false);
    toggleVisibility('notes-section', false);

    addEventListener('login-btn', 'click', () => this.handleLogin());
  }

  private async checkCycles(): Promise<void> {
    try {
      const agent = authManager.getAgent();
      if (agent) {
        const cyclesChecker = createCyclesChecker();
        await cyclesChecker.checkAndWarn(agent);
      }
    } catch {
      showError(CYCLES_CHECK_FAILED_MESSAGE);
    }
  }

  private async handleLogin(): Promise<void> {
    showLoading();
    try {
      const success = await authManager.login();

      if (success) {
        const isAuthorized = await authManager.checkAuthorization();
        if (!isAuthorized) {
          showError(NOT_AUTHORIZED_MESSAGE);
          await authManager.logout();
          this.setLoggedOutState();
          return;
        }
        this.setLoggedInState();
        await this.checkCycles();
        await this.loadNotes();
      }
    } finally {
      hideLoading();
    }
  }

  private async handleLogout(): Promise<void> {
    showLoading();
    try {
      await authManager.logout();
      this.notes = [];
      clearAllNotifications();
      this.setLoggedOutState();
    } finally {
      hideLoading();
    }
  }

  private handleOpenDashboard(): void {
    window.open('/canister-dashboard', '_blank', 'noopener,noreferrer');
  }

  private getBackend() {
    const canisterId = inferCanisterId();
    const agent = authManager.getAgent();
    if (!agent) {
      throw new Error('No authenticated agent available');
    }
    return createActor(canisterId, { agent });
  }

  private async loadNotes(): Promise<void> {
    try {
      const backend = this.getBackend();
      this.notes = (await backend.get_notes()) as Note[];
      this.renderNotes();
    } catch (error) {
      showError(BACKEND_CALL_FAILED_MESSAGE);
      console.error('Failed to load notes:', error);
    }
  }

  private async handleAddNote(e?: Event): Promise<void> {
    e?.preventDefault();

    const title = getInputValue('note-title');
    const content = getTextareaValue('note-content');

    if (!title) return;

    showLoading();
    try {
      const backend = this.getBackend();
      const result = (await backend.add_note(title, content)) as AddNoteResult;

      if ('Ok' in result && result.Ok) {
        this.notes.unshift(result.Ok);
        this.renderNotes();
        clearInput('note-title');
        clearInput('note-content');
      } else if ('Err' in result) {
        showError(result.Err ?? 'Failed to add note');
      }
    } catch (error) {
      showError(BACKEND_CALL_FAILED_MESSAGE);
      console.error('Failed to add note:', error);
    } finally {
      hideLoading();
    }
  }

  private async handleDeleteNote(id: number): Promise<void> {
    showLoading();
    try {
      const backend = this.getBackend();
      const result = (await backend.delete_note(id)) as DeleteNoteResult;

      if ('Ok' in result) {
        this.notes = this.notes.filter(n => n.id !== id);
        this.renderNotes();
      } else if ('Err' in result) {
        showError(result.Err ?? 'Failed to delete note');
      }
    } catch (error) {
      showError(BACKEND_CALL_FAILED_MESSAGE);
      console.error('Failed to delete note:', error);
    } finally {
      hideLoading();
    }
  }

  private renderNotes(): void {
    const container = document.getElementById('notes-list');
    if (!container) return;

    if (this.notes.length === 0) {
      setHtml(
        'notes-list',
        '<p class="empty-state">No notes yet. Add your first note above!</p>'
      );
      return;
    }

    const sorted = [...this.notes].sort(
      (a, b) => Number(b.created_at) - Number(a.created_at)
    );

    container.innerHTML = '';
    for (const note of sorted) {
      const card = document.createElement('div');
      card.className = 'note-card';

      const header = document.createElement('div');
      header.className = 'note-header';

      const title = document.createElement('h3');
      title.className = 'note-title';
      title.textContent = note.title;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'note-delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => this.handleDeleteNote(note.id));

      header.appendChild(title);
      header.appendChild(deleteBtn);

      const content = document.createElement('p');
      content.className = 'note-content';
      content.textContent = note.content || '(no content)';

      const date = document.createElement('span');
      date.className = 'note-date';
      const ts = Number(note.created_at);
      date.textContent = ts > 0 ? new Date(ts * 1000).toLocaleString() : '';

      card.appendChild(header);
      card.appendChild(content);
      if (ts > 0) card.appendChild(date);
      container.appendChild(card);
    }
  }
}
