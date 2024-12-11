<script>
	import NavBar from '../components/NavBar.svelte';
	import Search from '../components/Search.svelte';
	import SongList from '../components/SongList.svelte';

	let loading = $state(true);
</script>

<NavBar />
<Search {loading} />
<SongList {loading} />
