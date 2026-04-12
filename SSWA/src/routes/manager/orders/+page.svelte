<script lang="ts">
	let { data, form } = $props();

	function canGoPrevious(): boolean {
		return data.page > 1;
	}

	function canGoNext(): boolean {
		return data.page * data.pageSize < data.totalCount;
	}
</script>

<main class="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 p-6">
	<!-- Header tile -->
	<div class="rounded-2xl bg-choc-800 p-5 flex items-center justify-between text-van-100">
		<div>
			<p class="text-xs font-semibold uppercase tracking-widest text-van-300">Manager</p>
			<h1 class="mt-0.5 text-2xl font-bold">Orders</h1>
		</div>
		<a href="/" class="rounded-xl bg-choc-700 px-4 py-2 text-sm font-semibold text-van-100 hover:bg-choc-600 transition-colors">
			← Dashboard
		</a>
	</div>

	{#if data.error || form?.error}
		<div class="rounded-2xl bg-straw-100 border-2 border-straw-500 p-4 text-sm font-semibold text-straw-600">
			{data.error ?? form?.error}
		</div>
	{/if}

	{#if form?.success}
		<div class="rounded-2xl bg-van-200 border-2 border-van-300 p-4 text-sm font-semibold text-choc-800">
			{form.success}
		</div>
	{/if}

	<!-- Orders table bento block -->
	<div class="rounded-2xl bg-van-50 overflow-hidden">
		<div class="p-4 pb-2">
			<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">
				{data.totalCount} {data.totalCount === 1 ? 'order' : 'orders'}
			</p>
		</div>
		<div class="overflow-x-auto px-4 pb-4">
			<table class="min-w-full text-sm">
				<thead>
					<tr class="border-b-2 border-van-300">
						<th class="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Order</th>
						<th class="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">User</th>
						<th class="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Scope</th>
						<th class="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Status</th>
						<th class="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Total (PHP)</th>
						<th class="pb-2 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Action</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-van-200">
					{#each data.orders as order}
						<tr class="hover:bg-van-100 transition-colors">
							<td class="py-3 pr-4">
								<p class="font-mono text-xs font-semibold text-choc-800">{order.id}</p>
								<p class="text-xs text-choc-600">{new Date(order.createdAt).toLocaleString()}</p>
							</td>
							<td class="py-3 pr-4 text-sm font-semibold text-choc-800">{order.user.email}</td>
							<td class="py-3 pr-4 font-mono text-xs text-choc-600">{order.scopeId ?? '-'}</td>
							<td class="py-3 pr-4">
								<span class="rounded-lg bg-van-200 px-2 py-0.5 text-xs font-bold text-choc-700">{order.status}</span>
							</td>
							<td class="py-3 pr-4 text-sm font-semibold text-choc-800">{order.totalPesos.toFixed(2)}</td>
							<td class="py-3">
								<form method="POST" action="?/setStatus" class="flex items-center gap-2">
									<input type="hidden" name="orderId" value={order.id} />
									<select name="status" class="rounded-xl border-2 border-van-300 bg-van-100 px-2 py-1 text-sm text-choc-800 outline-none focus:border-straw-500">
										{#each data.statusOptions as status}
											<option value={status} selected={status === order.status}>{status}</option>
										{/each}
									</select>
									<button type="submit" class="rounded-xl bg-straw-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-straw-600 transition-colors">Apply</button>
								</form>
							</td>
						</tr>
					{/each}
					{#if data.orders.length === 0}
						<tr>
							<td colspan="6" class="py-8 text-center text-sm text-choc-600">No orders found.</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Pagination -->
	<div class="flex items-center gap-3">
		{#if canGoPrevious()}
			<a href={`/manager/orders?page=${data.page - 1}&pageSize=${data.pageSize}`}
				class="rounded-xl bg-van-200 px-4 py-2 text-sm font-semibold text-choc-800 hover:bg-van-300 transition-colors">
				← Previous
			</a>
		{/if}
		<span class="text-sm text-choc-600">Page {data.page} · {data.totalCount} orders</span>
		{#if canGoNext()}
			<a href={`/manager/orders?page=${data.page + 1}&pageSize=${data.pageSize}`}
				class="rounded-xl bg-van-200 px-4 py-2 text-sm font-semibold text-choc-800 hover:bg-van-300 transition-colors">
				Next →
			</a>
		{/if}
	</div>
</main>