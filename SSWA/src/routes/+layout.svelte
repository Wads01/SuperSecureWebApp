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

{#if data.user && (showBackButton || secondaryLinks.length > 0)}
	<div class="mx-auto w-full max-w-6xl px-4 pt-4 pb-1.5">
		<div class="flex flex-wrap items-center justify-center gap-2">
			{#if showBackButton}
				<button
					type="button"
					onclick={navigateBack}
					class="rounded-xl bg-van-200 px-3 py-1.5 text-xs font-semibold text-choc-700 hover:bg-van-300 transition-colors"
				>
					← Back
				</button>
			{/if}
			{#each secondaryLinks as link}
				<a
					href={link.href}
					class="rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors {page.url.pathname === link.href ? 'bg-choc-800 text-van-100' : 'bg-van-200 text-choc-700 hover:bg-van-300'}"
				>
					{link.label}
				</a>
			{/each}
		</div>
	</div>
{/if}

{@render children()}
