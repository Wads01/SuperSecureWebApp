<script lang="ts">
	let { data, form } = $props();

	const itemImages: Record<string, string> = {
		'Espresso': '/orderpic/espresso.jpg',
		'Americano': '/orderpic/americano.jpg',
		'Cappuccino': '/orderpic/cappucino.jpg',
		'Latte': '/orderpic/latte.jpg',
		'Mocha': '/orderpic/mocha.jpg',
		'Cold Brew': '/orderpic/coldbrew.jpg',
		'Matcha Latte': '/orderpic/matcha.jpg',
		'Croissant': '/orderpic/croissant.jpg',
	};
</script>

<div class="min-h-screen bg-van-100">
	<!-- Full-width header -->
	<div class="bg-choc-800 px-8 py-6 grid grid-cols-3 items-center text-van-100">
		<div></div>
		<div class="text-center">
			<p class="text-xs font-semibold uppercase tracking-widest text-van-300">Cafe</p>
			<h1 class="mt-0.5 text-4xl font-bold">Menu</h1>
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

		{#if form?.success}
			<div class="rounded-2xl bg-van-200 border-2 border-van-300 p-4 text-sm font-semibold text-choc-800">
				{form.success}
				{#if form.createdOrderId}
					<span class="ml-2 font-mono text-xs">{form.createdOrderId}</span>
				{/if}
			</div>
		{/if}

		<!-- Menu cards + order form -->
		<form method="POST" action="?/createOrder" class="grid gap-3">
			<div class="rounded-2xl bg-van-50 p-5">
				<p class="mb-4 text-xs font-semibold uppercase tracking-widest text-choc-600">{data.items.length} items available</p>
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
					{#each data.items as item}
						<div class="rounded-2xl bg-van-100 overflow-hidden border-2 border-van-200 flex flex-col">
							{#if itemImages[item.name]}
								<img
									src={itemImages[item.name]}
									alt={item.name}
									class="w-full h-36 object-cover"
								/>
							{/if}
							<div class="p-3 flex flex-col gap-2 flex-1">
								<div>
									<p class="font-bold text-choc-800 leading-tight">{item.name}</p>
									<span class="mt-1 inline-block rounded-lg bg-van-200 px-2 py-0.5 text-xs font-bold text-choc-700">{item.category}</span>
								</div>
								<p class="text-sm font-semibold text-choc-800">₱{item.pricePesos.toFixed(2)}</p>
								<div class="mt-auto">
									<label class="block text-xs font-semibold uppercase tracking-widest text-choc-600 mb-1">Qty</label>
									<input
										type="number"
										name={`qty_${item.id}`}
										min="0"
										max="20"
										step="1"
										value="0"
										class="w-full rounded-xl border-2 border-van-300 bg-van-50 px-2 py-1.5 text-sm text-choc-800 outline-none focus:border-straw-500"
									/>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div class="rounded-2xl bg-van-50 p-5 grid gap-4">
				<label class="grid gap-1.5">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">Order notes (optional, max 300)</span>
					<textarea name="notes" rows="3" maxlength="300"
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2 text-sm text-choc-800 outline-none focus:border-straw-500 resize-none"></textarea>
				</label>

				{#if data.userRole === 'USER'}
					<button type="submit" class="rounded-xl bg-straw-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-straw-600 transition-colors self-start">
						Place Order →
					</button>
				{:else}
					<p class="rounded-xl bg-straw-100 border-2 border-straw-500 px-4 py-3 text-sm font-semibold text-straw-600">
						Only customers can place orders.
					</p>
				{/if}
			</div>
		</form>

		</div>
	</div>
</div>