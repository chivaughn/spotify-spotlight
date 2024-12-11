<script lang="ts">
	import { getUser, searchSongs } from '../lib/spotify';
	import { token } from '../lib/spotify';
	import { db } from '../lib/firebase';
	import { userStore } from '../store/userStore';
	import type { User } from '../store/userStore';
	let { loading } = $props();

	// Auto-subscribe to the store
	let user: User | null = $state(null);

	// Subscribe to the store
	$effect(() => {
		userStore.subscribe((value) => {
			user = value;
		});
	});

	import { collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';

	let showDropdown = $state(false);

	let searchQuery = $state('');
	/**
	 * @type {any[]}
	 */
	let searchResults: Array<{ id: string; name: string; artists: { name: string }[] }> = $state([]);

	async function search() {
		showDropdown = true;

		if (searchQuery) {
			searchResults = await searchSongs(searchQuery, token);
		}
	}

	async function handleKeyDown(event: { key: string }) {
		if (event.key === 'Enter') {
			await search();
		}
	}

	/**
	 * @param {any} song
	 */

	const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

	async function addOrReplaceSong(song: any) {
		try {
			showDropdown = false;

			const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

			// Reference the songs collection
			const songsCollectionRef = collection(db, `songs`);

			// Query for any existing songs added by the current user for today
			const userSongQuery = query(
				songsCollectionRef,
				where('added_by', '==', user?.id),
				where('date', '==', today)
			);
			const querySnapshot = await getDocs(userSongQuery);
			// Delete existing songs by the user for today
			for (const doc of querySnapshot.docs) {
				await deleteDoc(doc.ref);
			}

			// Add the new song with an auto-generated ID
			const docRef = await addDoc(songsCollectionRef, {
				song_id: song.id,
				song_name: song.name,
				song_album: song.album.images[0].url,
				spotify_link: song.external_urls.spotify,
				artist_name: song.artists.map((a: { name: string }) => a.name).join(', '),
				added_at: Date.now(),
				added_by: user?.id,
				date: today // Store the date in the document
			});
			searchQuery = '';

			console.log(`Song added with ID: ${docRef.id}`);
		} catch (error) {
			console.error('Error adding or replacing song:', error);
		}
	}
</script>

{#if user}
	<div class="relative mx-auto mt-6 w-full max-w-lg p-4">
		<!-- Search Input -->
		<div class="flex items-center overflow-hidden rounded-lg bg-white shadow">
			<input
				id="search-box"
				type="text"
				bind:value={searchQuery}
				onkeydown={handleKeyDown}
				placeholder="Search for a song..."
				class="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
			/>
			<button
				onclick={search}
				class="rounded-r-lg bg-green-500 px-4 py-2 text-white transition hover:bg-green-600"
			>
				Search
			</button>
		</div>

		<!-- Dropdown with search results -->
		{#if showDropdown}
			<div
				class="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-lg bg-white shadow-lg"
			>
				{#if searchResults.length > 0}
					{#each searchResults as song}
						<button
							type="button"
							class="w-full border-t border-gray-200 px-4 py-3 text-left hover:bg-gray-100 focus:outline-none"
							onclick={() => addOrReplaceSong(song)}
						>
							<p class="font-semibold text-gray-900">{song.name}</p>
							<p class="text-sm text-gray-600">
								by {song.artists.map((a) => a.name).join(', ')}
							</p>
						</button>
					{/each}
				{:else}
					<div class="flex items-center justify-center p-6">
						<div class="h-12 w-12 animate-spin rounded-full border-t-4 border-green-500"></div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
</style>
