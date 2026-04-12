<script lang="ts">
	let { data, form } = $props();
</script>

<div class="min-h-screen bg-van-100 p-4">
	<div class="mx-auto max-w-6xl grid gap-3">

		<!-- Header tile -->
		<div class="rounded-2xl bg-choc-800 p-5 flex items-center justify-between text-van-100">
			<div>
				<p class="text-xs font-semibold uppercase tracking-widest text-van-300">Admin</p>
				<h1 class="mt-0.5 text-2xl font-bold">User Management</h1>
			</div>
			<a href="/" class="rounded-xl bg-choc-700 px-4 py-2 text-sm font-semibold text-van-100 hover:bg-choc-600 transition-colors">
				← Dashboard
			</a>
		</div>

		{#if form?.error}
			<div class="rounded-2xl bg-straw-100 border-2 border-straw-500 p-4 text-sm font-semibold text-straw-600">
				{form.error}
			</div>
		{/if}

		{#if form?.success}
			<div class="rounded-2xl bg-van-200 border-2 border-van-300 p-4 text-sm font-semibold text-choc-800">
				{form.success}
			</div>
		{/if}

		<!-- Users bento block -->
		<div class="rounded-2xl bg-van-50 overflow-hidden">
			<div class="p-4 pb-2">
				<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">
					{data.users.length} {data.users.length === 1 ? 'user' : 'users'}
				</p>
			</div>
			<div class="overflow-x-auto px-4 pb-4">
				<table class="min-w-full text-sm">
					<thead>
						<tr class="border-b-2 border-van-300">
							<th class="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Email</th>
							<th class="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Role</th>
							<th class="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Status</th>
							<th class="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Scope</th>
							<th class="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Set Role</th>
							<th class="pb-2 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Set Status</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-van-200">
						{#each data.users as user}
							<tr class="hover:bg-van-100 transition-colors align-top">
								<td class="py-3 pr-4 font-semibold text-choc-800">{user.email}</td>
								<td class="py-3 pr-4">
									<span class="rounded-lg bg-van-200 px-2 py-0.5 text-xs font-bold text-choc-700">{user.role}</span>
								</td>
								<td class="py-3 pr-4">
									<span class="rounded-lg px-2 py-0.5 text-xs font-bold
										{user.status === 'ACTIVE' ? 'bg-van-300 text-choc-800' : 'bg-straw-100 text-straw-600'}">
										{user.status}
									</span>
								</td>
								<td class="py-3 pr-4 font-mono text-xs text-choc-600">{user.scopeId ?? '-'}</td>
								<td class="py-3 pr-4">
									<form method="POST" action="?/setRole" class="flex items-center gap-2">
										<input type="hidden" name="targetUserId" value={user.id} />
										<select name="role" class="rounded-xl border-2 border-van-300 bg-van-100 px-2 py-1 text-sm text-choc-800 outline-none focus:border-straw-500">
											{#each data.assignableRoles as role}
												<option value={role} selected={role === user.role}>{role}</option>
											{/each}
										</select>
										<button type="submit" class="rounded-xl bg-straw-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-straw-600 transition-colors">Save</button>
									</form>
								</td>
								<td class="py-3">
									<form method="POST" action="?/setStatus">
										<input type="hidden" name="targetUserId" value={user.id} />
										{#if user.status === 'ACTIVE'}
											<input type="hidden" name="nextStatus" value="DISABLED" />
											<button type="submit" class="rounded-xl bg-straw-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-straw-600 transition-colors">Disable</button>
										{:else}
											<input type="hidden" name="nextStatus" value="ACTIVE" />
											<button type="submit" class="rounded-xl bg-choc-600 px-3 py-1.5 text-xs font-bold text-van-100 hover:bg-choc-700 transition-colors">Enable</button>
										{/if}
									</form>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

	</div>
</div>