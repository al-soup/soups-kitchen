<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { page } from '$app/stores';

	let { children } = $props();

	let isSidebarOpen = $state(false);

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
	}

	function closeSidebar() {
		isSidebarOpen = false;
	}

	const pageTitles: Record<string, string> = {
		'/habits': 'Habit Tracker',
		'/blog': 'Blog',
		'/cv': 'CV',
		'/settings': 'Settings'
	};

	let pageTitle = $derived(pageTitles[$page.url.pathname] || '');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="min-h-screen flex flex-col">
	<Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

	<div class="min-h-screen flex flex-col transition-all duration-300 {isSidebarOpen ? 'blur-sm' : ''}">
		<Navbar onMenuToggle={toggleSidebar} pageTitle={pageTitle} />

		<main class="flex-1 container mx-auto px-4 py-8">
			{@render children()}
		</main>

		<Footer />
	</div>
</div>
