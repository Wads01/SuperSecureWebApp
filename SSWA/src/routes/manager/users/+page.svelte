<script lang="ts">
	let { data, form } = $props();
</script>

<main class="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
	<h1 class="text-2xl font-semibold">User Management</h1>

	{#if form?.error}
		<p class="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{form.error}</p>
	{/if}

	<div class="overflow-x-auto rounded border">
		<table class="min-w-full text-sm">
			<thead class="bg-gray-100 text-left">
				<tr>
					<th class="px-3 py-2">Email</th>
					<th class="px-3 py-2">Role</th>
					<th class="px-3 py-2">Status</th>
					<th class="px-3 py-2">Scope</th>
					<th class="px-3 py-2">Action</th>
				</tr>
			</thead>
			<tbody>
				{#each data.users as user}
					<tr class="border-t">
						<td class="px-3 py-2">{user.email}</td>
						<td class="px-3 py-2">{user.role}</td>
						<td class="px-3 py-2">{user.status}</td>
						<td class="px-3 py-2">{user.scopeId ?? '-'}</td>
						<td class="px-3 py-2">
							<form method="POST" action="?/setStatus" class="flex items-center gap-2">
								<input type="hidden" name="targetUserId" value={user.id} />
								{#if user.status === 'ACTIVE'}
									<input type="hidden" name="nextStatus" value="DISABLED" />
									<button class="rounded bg-red-600 px-2 py-1 text-white" type="submit">Disable</button>
								{:else}
									<input type="hidden" name="nextStatus" value="ACTIVE" />
									<button class="rounded bg-green-700 px-2 py-1 text-white" type="submit">Enable</button>
								{/if}
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>
