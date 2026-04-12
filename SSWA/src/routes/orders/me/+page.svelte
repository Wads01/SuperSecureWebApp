<script lang="ts">
	let { data, form } = $props();

	function canCancel(status: string): boolean {
		return status === 'PENDING';
	}
</script>

<div class="min-h-screen bg-van-100">
	<!-- Full-width header -->
	<div class="bg-choc-800 px-8 py-6 grid grid-cols-3 items-center text-van-100">
		<div></div>
		<div class="text-center">
			<p class="text-xs font-semibold uppercase tracking-widest text-van-300">Cafe</p>
			<h1 class="mt-0.5 text-4xl font-bold">My Orders</h1>
		</div>
		<div class="flex justify-end gap-2">
			<a href="/menu" class="rounded-xl bg-straw-500 px-4 py-2 text-sm font-bold text-white hover:bg-straw-600 transition-colors">
				New Order →
			</a>
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

		{#if form?.success}
			<div class="rounded-2xl bg-van-200 border-2 border-van-300 p-4 text-sm font-semibold text-choc-800">
				{form.success}
			</div>
		{/if}

		{#if !data.isRoleB}
			<div class="rounded-2xl bg-straw-100 border-2 border-straw-500 p-5 text-sm font-semibold text-straw-600">
				Only customers can access order history.
			</div>
		{:else if data.orders.length === 0}
			<div class="rounded-2xl bg-van-50 p-8 text-center">
				<p class="text-sm text-choc-600">No orders yet.</p>
				<a href="/menu" class="mt-3 inline-block rounded-xl bg-straw-500 px-4 py-2 text-sm font-bold text-white hover:bg-straw-600 transition-colors">
					Browse the menu →
				</a>
			</div>
		{:else}
			<div class="grid gap-3">
				{#each data.orders as order}
					<div class="rounded-2xl bg-van-50 p-5">
						<div class="flex flex-wrap items-start justify-between gap-3">
							<div>
								<p class="font-mono text-xs font-semibold text-choc-600">Order #{order.id}</p>
								<p class="mt-1 text-xs text-choc-600">{new Date(order.createdAt).toLocaleString()}</p>
								<div class="mt-2 flex flex-wrap gap-2">
									<span class="rounded-lg bg-van-200 px-2 py-0.5 text-xs font-bold text-choc-700">{order.status}</span>
									<span class="rounded-lg bg-choc-700 px-2 py-0.5 text-xs font-bold text-van-100">PHP {order.totalPesos.toFixed(2)}</span>
								</div>
							</div>

							{#if canCancel(order.status)}
								<form method="POST" action="?/cancel">
									<input type="hidden" name="orderId" value={order.id} />
									<button type="submit" class="rounded-xl bg-straw-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-straw-600 transition-colors">
										Cancel
									</button>
								</form>
							{/if}
						</div>

						{#if order.notes}
							<p class="mt-3 text-sm text-choc-700"><span class="font-semibold">Notes:</span> {order.notes}</p>
						{/if}

						<div class="mt-4 overflow-x-auto rounded-xl border-2 border-van-300">
							<table class="min-w-full text-sm">
								<thead>
									<tr class="border-b-2 border-van-300">
										<th class="px-3 pb-2 pt-2 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Item</th>
										<th class="px-3 pb-2 pt-2 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Qty</th>
										<th class="px-3 pb-2 pt-2 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Unit (PHP)</th>
										<th class="px-3 pb-2 pt-2 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Total (PHP)</th>
									</tr>
								</thead>
								<tbody class="divide-y divide-van-200">
									{#each order.orderItems as item}
										<tr>
											<td class="px-3 py-2 font-semibold text-choc-800">{item.menuItem.name}</td>
											<td class="px-3 py-2 text-choc-700">{item.quantity}</td>
											<td class="px-3 py-2 text-choc-700">{item.unitPricePesos.toFixed(2)}</td>
											<td class="px-3 py-2 font-semibold text-choc-800">{item.lineTotalPesos.toFixed(2)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		</div>
	</div>
</div>