<script lang="ts">
	let { data, form } = $props();
</script>

<div class="min-h-screen bg-van-100">
	<!-- Full-width header -->
	<div class="bg-choc-800 px-8 py-6 grid grid-cols-3 items-center text-van-100">
		<div></div>
		<div class="text-center">
			<p class="text-xs font-semibold uppercase tracking-widest text-van-300">Manager</p>
			<h1 class="mt-0.5 text-4xl font-bold">User Management</h1>
		</div>
		<div class="flex justify-end">
			<a href="/" class="rounded-xl bg-choc-700 px-4 py-2 text-sm font-semibold text-van-100 hover:bg-choc-600 transition-colors">
				← Dashboard
			</a>
		</div>
	</div>
	<div class="px-8 py-4">
		<div class="grid gap-3">

		{#if form?.error}
			<div class="rounded-2xl bg-straw-100 border-2 border-straw-500 p-4 text-sm font-semibold text-straw-600">
				{form.error}
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
							<th class="pb-2 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Action</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-van-200">
						{#each data.users as user}
							<tr class="hover:bg-van-100 transition-colors">
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
								<td class="py-3 pr-4 text-xs text-choc-600 font-mono">{user.scopeId ?? '-'}</td>
								<td class="py-3">
									<form method="POST" action="?/setStatus">
										<input type="hidden" name="targetUserId" value={user.id} />
										{#if user.status === 'ACTIVE'}
											<input type="hidden" name="nextStatus" value="DISABLED" />
											<button type="submit" class="rounded-xl bg-straw-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-straw-600 transition-colors">
												Disable
											</button>
										{:else}
											<input type="hidden" name="nextStatus" value="ACTIVE" />
											<button type="submit" class="rounded-xl bg-choc-600 px-3 py-1.5 text-xs font-bold text-van-100 hover:bg-choc-700 transition-colors">
												Enable
											</button>
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
</div>
