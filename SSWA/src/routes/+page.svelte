<script lang="ts">
	let { data } = $props();
</script>

<main class="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
	<h1 class="text-2xl font-semibold">SSWA Dashboard</h1>

	{#if data.user}
		{#if data.lastAccountUse}
			<div class="rounded border border-blue-300 bg-blue-50 p-4 text-sm text-blue-900">
				<p class="font-medium">Previous account activity</p>
				<p>
					Last successful login:
					{data.lastAccountUse.previousSuccessfulLoginAt
						? new Date(data.lastAccountUse.previousSuccessfulLoginAt).toLocaleString()
						: 'No previous successful login recorded'}
				</p>
				<p>
					Last unsuccessful login attempt:
					{data.lastAccountUse.previousFailedLoginAt
						? new Date(data.lastAccountUse.previousFailedLoginAt).toLocaleString()
						: 'No failed attempt recorded'}
				</p>
			</div>
		{/if}

		<div class="rounded border p-4">
			<p><span class="font-medium">Email:</span> {data.user.email}</p>
			<p><span class="font-medium">Role:</span> {data.user.role}</p>
			<p><span class="font-medium">Status:</span> {data.user.status}</p>
		</div>

		<nav class="flex flex-wrap gap-2">
			<a href="/manager/users" class="rounded border px-3 py-2">User Management</a>
			<a href="/account/password" class="rounded border px-3 py-2">Change Password</a>
			<a href="/forgot-password" class="rounded border px-3 py-2">Forgot Password</a>
			{#if data.user.role === 'ADMIN'}
				<a href="/admin/logs" class="rounded border px-3 py-2">Security Logs</a>
			{/if}
		</nav>

		<form method="POST" action="/logout">
			<button type="submit" class="rounded bg-black px-3 py-2 text-white">Sign out</button>
		</form>
	{/if}
</main>
