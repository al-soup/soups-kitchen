<script lang="ts">
	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	const apps = [
		{ name: 'Habit Tracker', href: '/habits', icon: '✓' },
		{ name: 'Blog', href: '/blog', icon: '✎' },
		{ name: 'CV', href: '/cv', icon: '☰' }
	];
</script>

<!-- Transparent Backdrop for closing -->
{#if isOpen}
	<div
		class="fixed inset-0 z-40"
		onclick={onClose}
		role="presentation"
	></div>
{/if}

<!-- Sidebar -->
<aside
	class="fixed top-0 left-0 h-full w-80 bg-[var(--color-background)] border-brutal z-50 transform transition-transform duration-300 ease-in-out {isOpen
		? 'translate-x-0'
		: '-translate-x-full'}"
>
	<div class="flex flex-col h-full">
		<!-- Header with close button -->
		<div class="flex items-center justify-between p-4 border-b-[3px] border-[var(--color-border)]">
			<h2 class="text-xl font-bold">Apps</h2>
			<button
				onclick={onClose}
				class="p-2 hover:bg-[var(--color-secondary)] transition-colors"
				aria-label="Close menu"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2"
					stroke="currentColor"
					class="w-6 h-6"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<!-- Navigation links -->
		<nav class="flex-1 overflow-y-auto p-4">
			<ul class="space-y-2">
				{#each apps as app}
					<li>
						<a
							href={app.href}
							onclick={onClose}
							class="flex items-center gap-3 p-4 border-brutal bg-[var(--color-background)] hover:bg-[var(--color-primary)] transition-colors shadow-brutal-sm hover:shadow-brutal-md hover:translate-x-1 hover:-translate-y-1 transition-all"
						>
							<span class="text-2xl">{app.icon}</span>
							<span class="font-bold">{app.name}</span>
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</aside>
