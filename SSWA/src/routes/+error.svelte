<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="min-h-screen bg-van-100 flex items-center justify-center p-4">
	<div class="w-full max-w-sm grid gap-3">
		<div class="rounded-2xl bg-straw-500 p-5 text-white">
			<p class="text-xs font-semibold uppercase tracking-widest text-straw-100">Error</p>
			<h1 class="mt-1 text-2xl font-bold">Something went wrong</h1>
		</div>
		<div class="rounded-2xl bg-straw-100 p-5">
			<p class="text-sm text-straw-600">{page.error?.message ?? 'An unexpected error occurred.'}</p>
		</div>
		<a href="/" class="rounded-2xl bg-choc-800 p-4 text-center text-sm font-bold text-van-100 hover:bg-choc-700 transition-colors">
			← Return to dashboard
		</a>
	</div>
</div>
