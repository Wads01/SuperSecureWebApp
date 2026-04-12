<script lang="ts">
	let { data, form } = $props();
</script>

<main class="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 p-6">
	<h1 class="text-2xl font-semibold">Admin User Management</h1>

	<p class="text-sm text-gray-600">Test admin-only role assignment and account status management from this page.</p>

	{#if form?.error}
		<p class="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{form.error}</p>
	{/if}

	{#if form?.success}
		<p class="rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">{form.success}</p>
	{/if}

	<div class="overflow-x-auto rounded border">
		<table class="min-w-full text-sm">
			<thead class="bg-gray-100 text-left">
				<tr>
					<th class="px-3 py-2">Email</th>
					<th class="px-3 py-2">Role</th>
					<th class="px-3 py-2">Status</th>
					<th class="px-3 py-2">Scope</th>
					<th class="px-3 py-2">Role Action</th>
					<th class="px-3 py-2">Status Action</th>
				</tr>
			</thead>
			<tbody>
				{#each data.users as user}
					<tr class="border-t align-top">
						<td class="px-3 py-2">{user.email}</td>
						<td class="px-3 py-2">{user.role}</td>
						<td class="px-3 py-2">{user.status}</td>
						<td class="px-3 py-2">{user.scopeId ?? '-'}</td>
						<td class="px-3 py-2">
							<form method="POST" action="?/setRole" class="flex items-center gap-2">
								<input type="hidden" name="targetUserId" value={user.id} />
								<select name="role" class="rounded border px-2 py-1">
									{#each data.assignableRoles as role}
										<option value={role} selected={role === user.role}>{role}</option>
									{/each}
								</select>
								<button type="submit" class="rounded bg-black px-2 py-1 text-white">Save</button>
							</form>
						</td>
						<td class="px-3 py-2">
							<form method="POST" action="?/setStatus">
								<input type="hidden" name="targetUserId" value={user.id} />
								{#if user.status === 'ACTIVE'}
									<input type="hidden" name="nextStatus" value="DISABLED" />
									<button type="submit" class="rounded bg-red-600 px-2 py-1 text-white">Disable</button>
								{:else}
									<input type="hidden" name="nextStatus" value="ACTIVE" />
									<button type="submit" class="rounded bg-green-700 px-2 py-1 text-white">Enable</button>
								{/if}
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>