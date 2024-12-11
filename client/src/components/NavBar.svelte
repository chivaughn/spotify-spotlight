<script lang="ts">
	import { onMount } from 'svelte';
	import { getUser, logout } from '../lib/spotify';
	import { setUser, userStore } from '../store/userStore';
	import type { User } from '../store/userStore';

	let user: User | null = null;

	function loginToSpotify() {
		window.location.href = 'http://localhost:3000/login'; // Adjust for your server's address
	}

	async function fetchUser() {
		try {
			const data = await getUser();

			if (data && data.data) {
				setUser(data.data);
			}
		} catch (error) {
			console.error('Failed to fetch user:', error);
		}
	}

	// Subscribe to the store
	$: userStore.subscribe((value) => {
		user = value;
	});

	onMount(() => {
		fetchUser();
	});
</script>

<div class="flex items-center justify-between bg-gray-900 px-6 py-4 text-white shadow-md">
	<!-- Spotify Logo -->
	<span class="flex items-center space-x-2">
		<img src="/spotify-logo.png" alt="Spotify Logo" class="h-8 w-8" />
	</span>

	<!-- Login Button -->
	{#if user}<!-- Display User Name and Logout Button -->
		<div class="flex items-center space-x-4">
			<span>Welcome, {user.display_name}</span>
			<button
				class="rounded-full bg-red-600 px-6 py-2 font-bold text-white transition duration-200 hover:bg-red-700"
				on:click={logout}
			>
				Logout
			</button>
		</div>
	{:else}
		<button
			class="rounded-full bg-green-600 px-6 py-2 font-bold text-white transition duration-200 hover:bg-green-600"
			on:click={loginToSpotify}
		>
			Login
		</button>
	{/if}
</div>
