import { writable } from 'svelte/store';

/** Admin status: undefined = not checked yet, boolean = checked */
export const isAdminStore = writable<boolean | undefined>(undefined);
