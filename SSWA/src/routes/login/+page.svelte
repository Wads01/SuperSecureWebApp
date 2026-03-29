<script lang="ts">
	let { form } = $props();
</script>

<main class="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 p-6">
	<h1 class="text-2xl font-semibold">Login</h1>

	{#if form?.error}
		<p class="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{form.error}</p>
	{/if}

	<form method="POST" class="flex flex-col gap-4 rounded border p-4">
		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">Email</span>
			<input
				name="email"
				type="email"
				autocomplete="email"
				required
				class="rounded border px-3 py-2"
			/>
		</label>

		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">Password</span>
			<input
				name="password"
				type="password"
				autocomplete="current-password"
				required
				class="rounded border px-3 py-2"
			/>
		</label>

		<button type="submit" class="rounded bg-black px-3 py-2 text-white">Sign in</button>
	</form>

	<p class="text-sm text-gray-600">
		No account yet?
		<a href="/register" class="underline">Create one</a>
	</p>
</main>
