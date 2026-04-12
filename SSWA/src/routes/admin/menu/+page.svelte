<script lang="ts">
	let { data, form } = $props();
</script>

<main class="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
	<h1 class="text-2xl font-semibold">Admin Menu Pricing</h1>

	<p class="text-sm text-gray-600">
		Use this page to test admin-only menu price updates with range validation.
	</p>

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
					<th class="px-3 py-2">Item</th>
					<th class="px-3 py-2">Category</th>
					<th class="px-3 py-2">Current Price (PHP)</th>
					<th class="px-3 py-2">Update Price</th>
				</tr>
			</thead>
			<tbody>
				{#each data.items as item}
					<tr class="border-t">
						<td class="px-3 py-2">{item.name}</td>
						<td class="px-3 py-2">{item.category}</td>
						<td class="px-3 py-2">{item.pricePesos.toFixed(2)}</td>
						<td class="px-3 py-2">
							<form method="POST" action="?/setPrice" class="flex items-center gap-2">
								<input type="hidden" name="menuItemId" value={item.id} />
								<input
									type="number"
									name="pricePesos"
									min="1"
									max="500"
									step="0.01"
									value={item.pricePesos.toFixed(2)}
									class="w-28 rounded border px-2 py-1"
								/>
								<button type="submit" class="rounded bg-black px-2 py-1 text-white">Save</button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>