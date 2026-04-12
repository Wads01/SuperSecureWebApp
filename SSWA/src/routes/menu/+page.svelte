<script lang="ts">
	let { data, form } = $props();
</script>

<main class="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
	<h1 class="text-2xl font-semibold">Cafe Menu</h1>

	<p class="text-sm text-gray-600">
		Use this page to test frontend order creation against the secured `/api/orders` backend endpoint.
	</p>

	{#if form?.error}
		<p class="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{form.error}</p>
	{/if}

	{#if form?.success}
		<p class="rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
			{form.success}
			{#if form.createdOrderId}
				Order ID: {form.createdOrderId}
			{/if}
		</p>
	{/if}

	<form method="POST" action="?/createOrder" class="space-y-4 rounded border p-4">
		<div class="overflow-x-auto rounded border">
			<table class="min-w-full text-sm">
				<thead class="bg-gray-100 text-left">
					<tr>
						<th class="px-3 py-2">Item</th>
						<th class="px-3 py-2">Category</th>
						<th class="px-3 py-2">Price (PHP)</th>
						<th class="px-3 py-2">Quantity (1-20)</th>
					</tr>
				</thead>
				<tbody>
					{#each data.items as item}
						<tr class="border-t">
							<td class="px-3 py-2">{item.name}</td>
							<td class="px-3 py-2">{item.category}</td>
							<td class="px-3 py-2">{item.pricePesos.toFixed(2)}</td>
							<td class="px-3 py-2">
								<input
									type="number"
									name={`qty_${item.id}`}
									min="0"
									max="20"
									step="1"
									value="0"
									class="w-24 rounded border px-2 py-1"
								/>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">Order Notes (optional, max 300)</span>
			<textarea name="notes" rows="3" maxlength="300" class="rounded border px-3 py-2"></textarea>
		</label>

		{#if data.userRole === 'USER'}
			<button type="submit" class="rounded bg-black px-3 py-2 text-white">Create Order</button>
		{:else}
			<p class="text-sm text-amber-700">
				Only users with Role B can submit orders. Other roles can still use this page to view menu data.
			</p>
		{/if}
	</form>
</main>