<script lang="ts">
	let { data } = $props();
</script>

<main class="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
	<h1 class="text-2xl font-semibold">SSWA Dashboard</h1>

	{#if data.user}
		<div class="rounded border p-4">
			<p><span class="font-medium">Email:</span> {data.user.email}</p>
			<p><span class="font-medium">Role:</span> {data.user.role}</p>
			<p><span class="font-medium">Status:</span> {data.user.status}</p>
		</div>

		<nav class="flex flex-wrap gap-2">
			<a href="/manager/users" class="rounded border px-3 py-2">User Management</a>
			{#if data.user.role === 'ADMIN'}
				<a href="/admin/logs" class="rounded border px-3 py-2">Security Logs</a>
			{/if}
		</nav>

		<form method="POST" action="/logout">
			<button type="submit" class="rounded bg-black px-3 py-2 text-white">Sign out</button>
		</form>
	{/if}
</main>
