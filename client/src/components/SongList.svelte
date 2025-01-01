<script>
	// @ts-nocheck

	import { onMount } from 'svelte';
	import { collection, query, where, getDocs, onSnapshot, getDoc } from 'firebase/firestore';
	import { db } from '../lib/firebase.ts';
	let { loading } = $props();

	let today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
	/**
	 * @type {string | any[]}
	 */
	let songs = $state([]);

	function fetchSongsForToday() {
		try {
			const today = new Date();
			const year = today.getFullYear();
			const month = today.getMonth() + 1; // Months are 0-based
			const day = today.getDate();

			// Format date as YYYY-M-D
			const formattedDateShort = `${year}-${month}-${day}`;

			// Format date as YYYY-MM-DD
			const formattedDateLong = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

			// Reference the songs collection
			const songsCollectionRef = collection(db, 'songs');

			// Query for songs added on either date format
			const todayQuery = query(
				songsCollectionRef,
				where('date', 'in', [formattedDateShort, formattedDateLong])
			);

			const unsubscribe = onSnapshot(todayQuery, async (snapshot) => {
				if (snapshot.empty) {
					loading = false;
					console.log('No songs found for today.');
					songs = []; // Clear the songs list if no data is found
				} else {
					// Fetch user data for each song
					const fetchedSongs = await Promise.all(
						snapshot.docs.map(async (docSnapshot) => {
							const songData = docSnapshot.data();
							const addedById = songData.added_by;

							let user = null;
							if (addedById) {
								try {
									// Reference the user document using the ID
									const userDoc = await getDoc(doc(db, 'users', addedById));
									if (userDoc.exists()) {
										user = { id: userDoc.id, ...userDoc.data() };
									}
								} catch (error) {
									console.error(`Failed to fetch user for ID: ${addedById}`, error);
								}
							}

							return {
								id: docSnapshot.id, // Song document ID
								...songData, // Song data
								user // Linked user data or null
							};
						})
					);

					songs = fetchedSongs; // Update the songs with user data
					loading = false;

					console.log('Songs updated for today with user details:', songs);
				}
			});

			// Return the unsubscribe function to stop listening when needed
			return unsubscribe;
		} catch (error) {
			console.error('Error fetching songs for today:', error);
		}
	}

	onMount(() => {
		// Start listening to Firestore changes
		const unsubscribe = fetchSongsForToday();
	});
</script>

<div class="mx-auto max-w-4xl p-6">
	<h2 class="mb-6 text-4xl font-bold text-gray-900">Today's Songs</h2>

	<div class="space-y-4">
		{#if loading == true}
			<!-- Loading Spinner -->
			<div class="flex items-center justify-center p-6">
				<div class="h-12 w-12 animate-spin rounded-full border-t-4 border-green-500"></div>
			</div>
		{:else}
			{#each songs as song}
				<div
					class="flex items-center rounded-lg bg-gray-900 p-4 shadow-lg transition-colors hover:bg-gray-800"
				>
					<!-- Album Art Placeholder -->
					<div
						class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-gray-700"
					>
						<img
							src={song.song_album}
							alt="{song.song_name} album cover"
							class="h-full w-full object-cover"
						/>
					</div>

					<!-- Song Details -->
					<div class="ml-4 flex flex-col">
						<span class="text-lg font-semibold text-white">{song.song_name}</span>
						<span class="text-sm text-gray-400">by {song.artist_name}</span>
						<span class="mt-1 text-xs text-gray-500"
							>Added by: {song.user.disdisplayName ?? song.display_name ?? song.added_by}</span
						>
					</div>

					<!-- Info Icon Button -->
					<a
						aria-label="spotify link"
						href={song.spotify_link}
						target="_blank"
						class="ml-auto flex items-center rounded-full px-4 py-2 font-semibold text-white transition-colors"
					>
						<i class="fas fa-info-circle text-2xl"></i>
					</a>
				</div>
			{/each}

			{#if songs.length === 0}
				<p class="mt-6 text-center text-gray-500">No songs added yet for today.</p>
			{/if}
		{/if}
	</div>
</div>

<style>
	h2 {
		text-align: center;
	}

	ul {
		list-style: none;
		padding: 0;
	}

	li {
		padding: 5px;
		border-bottom: 1px solid #ccc;
	}

	p {
		text-align: center;
		font-style: italic;
	}
</style>
