<script lang="ts">
	interface Props {
		onMenuToggle: () => void;
		pageTitle?: string;
	}

	let { onMenuToggle, pageTitle }: Props = $props();
</script>

<nav class="fixed top-0 left-0 right-0 z-50 bg-[var(--color-background)] border-brutal">
	<div class="flex items-center justify-between px-4 py-3">
		<!-- Left section: Hamburger -->
		<button
			onclick={onMenuToggle}
			class="flex flex-col gap-1 p-2 hover:bg-[var(--color-secondary)] transition-colors"
			aria-label="Toggle menu"
		>
			<span class="w-6 h-0.5 bg-[var(--color-foreground)]"></span>
			<span class="w-6 h-0.5 bg-[var(--color-foreground)]"></span>
			<span class="w-6 h-0.5 bg-[var(--color-foreground)]"></span>
		</button>

		<!-- Center section: Logo + Title -->
		<a href="/" class="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
			<img src="/soup.svg" alt="Soup" class="h-10 w-10" />
			<div class="flex items-baseline gap-2">
				<h1 class="text-2xl font-bold">Soup's Kitchen</h1>
				{#if pageTitle}
					<span class="text-lg text-gray-600">{pageTitle}</span>
				{/if}
			</div>
		</a>

		<!-- Right section: Profile icon -->
		<a
			href="/settings"
			class="w-10 h-10 rounded-full bg-[var(--color-primary)] border-brutal flex items-center justify-center hover:bg-[var(--color-accent)] transition-colors shadow-brutal-sm"
			aria-label="Settings"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				stroke="currentColor"
				class="w-6 h-6"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.964 0a9 9 0 10-11.964 0m11.964 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
				/>
			</svg>
		</a>
	</div>
</nav>

<!-- Spacer to prevent content from going under fixed navbar -->
<div class="h-[64px]"></div>
