// src/stores/userStore.ts
import { writable } from 'svelte/store';

// Define the shape of the user object
export interface User {
	id: string;
	display_name: string;
	profile_url: string;
}

// Initialize the store with null as the default value
export const userStore = writable<User | null>(null);

// Helper functions for setting and clearing the user
export function setUser(user: User): void {
	userStore.set(user);
}

export function clearUser(): void {
	userStore.set(null);
}
