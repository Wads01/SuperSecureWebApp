<script lang="ts">
	import { page } from '$app/state';
</script>

<main class="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
	<h1 class="text-2xl font-semibold">Something went wrong</h1>
	<p class="text-gray-600">{page.error?.message ?? 'An unexpected error occurred.'}</p>
	<a href="/" class="rounded bg-black px-3 py-2 text-white">Return to dashboard</a>
</main>
