<script lang="ts">
	let { data, form } = $props();
</script>

<div class="min-h-screen bg-van-100 p-4">
	<div class="mx-auto max-w-4xl grid gap-3">

		<!-- Header tile -->
		<div class="rounded-2xl bg-choc-800 p-5 flex items-center justify-between text-van-100">
			<div>
				<p class="text-xs font-semibold uppercase tracking-widest text-van-300">Admin</p>
				<h1 class="mt-0.5 text-2xl font-bold">Menu Pricing</h1>
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

		<!-- Menu items bento block -->
		<div class="rounded-2xl bg-van-50 overflow-hidden">
			<div class="p-4 pb-2">
				<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">
					{data.items.length} {data.items.length === 1 ? 'item' : 'items'}
				</p>
			</div>
			<div class="overflow-x-auto px-4 pb-4">
				<table class="min-w-full text-sm">
					<thead>
						<tr class="border-b-2 border-van-300">
							<th class="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Item</th>
							<th class="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Category</th>
							<th class="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Current Price (PHP)</th>
							<th class="pb-2 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Update Price</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-van-200">
						{#each data.items as item}
							<tr class="hover:bg-van-100 transition-colors">
								<td class="py-3 pr-4 font-semibold text-choc-800">{item.name}</td>
								<td class="py-3 pr-4">
									<span class="rounded-lg bg-van-200 px-2 py-0.5 text-xs font-bold text-choc-700">{item.category}</span>
								</td>
								<td class="py-3 pr-4 text-sm font-semibold text-choc-800">{item.pricePesos.toFixed(2)}</td>
								<td class="py-3">
									<form method="POST" action="?/setPrice" class="flex items-center gap-2">
										<input type="hidden" name="menuItemId" value={item.id} />
										<input
											type="number"
											name="pricePesos"
											min="1"
											max="500"
											step="0.01"
											value={item.pricePesos.toFixed(2)}
											class="w-28 rounded-xl border-2 border-van-300 bg-van-100 px-2 py-1 text-sm text-choc-800 outline-none focus:border-straw-500"
										/>
										<button type="submit" class="rounded-xl bg-straw-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-straw-600 transition-colors">Save</button>
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