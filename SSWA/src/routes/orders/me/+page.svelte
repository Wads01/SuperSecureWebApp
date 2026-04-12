<script lang="ts">
	let { data, form } = $props();

	function canCancel(status: string): boolean {
		return status === 'PENDING';
	}
</script>

<main class="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
	<h1 class="text-2xl font-semibold">My Orders</h1>

	<p class="text-sm text-gray-600">This page calls `/api/orders/me` and `/api/orders/:id` for cancel actions.</p>

	{#if form?.error}
		<p class="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{form.error}</p>
	{/if}

	{#if form?.success}
		<p class="rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">{form.success}</p>
	{/if}

	{#if !data.isRoleB}
		<p class="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700">
			Only Role B users can access order management.
		</p>
	{:else if data.orders.length === 0}
		<p class="rounded border px-3 py-2 text-sm text-gray-700">No orders yet. Create one from the menu page.</p>
	{:else}
		<div class="space-y-4">
			{#each data.orders as order}
				<section class="rounded border p-4">
					<div class="flex flex-wrap items-center justify-between gap-2">
						<div>
							<p class="font-medium">Order #{order.id}</p>
							<p class="text-sm text-gray-600">
								Status: {order.status} | Total: PHP {order.totalPesos.toFixed(2)}
							</p>
							<p class="text-xs text-gray-500">Created: {new Date(order.createdAt).toLocaleString()}</p>
						</div>

						{#if canCancel(order.status)}
							<form method="POST" action="?/cancel">
								<input type="hidden" name="orderId" value={order.id} />
								<button type="submit" class="rounded bg-red-600 px-3 py-2 text-white">Cancel</button>
							</form>
						{/if}
					</div>

					{#if order.notes}
						<p class="mt-3 text-sm text-gray-700"><span class="font-medium">Notes:</span> {order.notes}</p>
					{/if}

					<div class="mt-3 overflow-x-auto rounded border">
						<table class="min-w-full text-sm">
							<thead class="bg-gray-100 text-left">
								<tr>
									<th class="px-3 py-2">Item</th>
									<th class="px-3 py-2">Qty</th>
									<th class="px-3 py-2">Unit</th>
									<th class="px-3 py-2">Line Total</th>
								</tr>
							</thead>
							<tbody>
								{#each order.orderItems as item}
									<tr class="border-t">
										<td class="px-3 py-2">{item.menuItem.name}</td>
										<td class="px-3 py-2">{item.quantity}</td>
										<td class="px-3 py-2">{item.unitPricePesos.toFixed(2)}</td>
										<td class="px-3 py-2">{item.lineTotalPesos.toFixed(2)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</section>
			{/each}
		</div>
	{/if}
</main>