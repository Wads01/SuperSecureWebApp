<script lang="ts">
	import './layout.css';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import { getSecondaryNavLinks } from '$lib/navigation/role-nav';

	let { children, data } = $props();

	function navigateBack(): void {
		if (!browser) {
			return;
		}

		if (window.history.length > 1) {
			window.history.back();
			return;
		}

		window.location.assign('/');
	}

	const secondaryLinks = $derived(getSecondaryNavLinks(data.user?.role));
	const showBackButton = $derived(page.url.pathname !== '/login');
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="mx-auto w-full max-w-6xl px-4 pt-4">
	<div class="flex flex-wrap items-center gap-2">
		{#if showBackButton}
			<button
				type="button"
				onclick={navigateBack}
				class="rounded border px-3 py-2 text-sm hover:bg-gray-100"
			>
				Back
			</button>
		{/if}

		{#if data.user && secondaryLinks.length > 0}
			{#each secondaryLinks as link}
				<a
					href={link.href}
					class={`rounded border px-3 py-2 text-sm hover:bg-gray-100 ${page.url.pathname === link.href ? 'bg-gray-100 font-medium' : ''}`}
				>
					{link.label}
				</a>
			{/each}
		{/if}
	</div>
</div>

{@render children()}
