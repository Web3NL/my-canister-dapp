import { writable } from 'svelte/store';

// Toggle maintenance mode for the application
export const maintenanceMode = writable(false);
