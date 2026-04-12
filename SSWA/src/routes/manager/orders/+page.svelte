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
	<h1 class="text-2xl font-semibold">Manager Orders Dashboard</h1>

	<p class="text-sm text-gray-600">Use this page to test manager/admin order reads and status transitions.</p>

	{#if data.error}
		<p class="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{data.error}</p>
	{/if}

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
					<th class="px-3 py-2">Order</th>
					<th class="px-3 py-2">User</th>
					<th class="px-3 py-2">Scope</th>
					<th class="px-3 py-2">Status</th>
					<th class="px-3 py-2">Total (PHP)</th>
					<th class="px-3 py-2">Action</th>
				</tr>
			</thead>
			<tbody>
				{#each data.orders as order}
					<tr class="border-t">
						<td class="px-3 py-2">
							<p>{order.id}</p>
							<p class="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
						</td>
						<td class="px-3 py-2">{order.user.email}</td>
						<td class="px-3 py-2">{order.scopeId ?? '-'}</td>
						<td class="px-3 py-2">{order.status}</td>
						<td class="px-3 py-2">{order.totalPesos.toFixed(2)}</td>
						<td class="px-3 py-2">
							<form method="POST" action="?/setStatus" class="flex items-center gap-2">
								<input type="hidden" name="orderId" value={order.id} />
								<select name="status" class="rounded border px-2 py-1">
									{#each data.statusOptions as status}
										<option value={status} selected={status === order.status}>{status}</option>
									{/each}
								</select>
								<button type="submit" class="rounded bg-black px-2 py-1 text-white">Apply</button>
							</form>
						</td>
					</tr>
				{/each}
				{#if data.orders.length === 0}
					<tr class="border-t">
						<td colspan="6" class="px-3 py-4 text-center text-gray-500">No orders found.</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>

	<div class="flex items-center gap-2">
		{#if canGoPrevious()}
			<a
				href={`/manager/orders?page=${data.page - 1}&pageSize=${data.pageSize}`}
				class="rounded border px-3 py-2"
			>
				Previous
			</a>
		{/if}
		<span class="text-sm text-gray-700">Page {data.page} | Total Orders: {data.totalCount}</span>
		{#if canGoNext()}
			<a
				href={`/manager/orders?page=${data.page + 1}&pageSize=${data.pageSize}`}
				class="rounded border px-3 py-2"
			>
				Next
			</a>
		{/if}
	</div>
</main>