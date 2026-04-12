<script lang="ts">
	let { data } = $props();
</script>

<div class="min-h-screen bg-van-100">
	<!-- Full-width header -->
	<div class="bg-choc-800 px-8 py-6 grid grid-cols-3 items-center text-van-100">
		<div></div>
		<div class="text-center">
			<p class="text-xs font-semibold uppercase tracking-widest text-van-300">Admin</p>
			<h1 class="mt-0.5 text-4xl font-bold">Security Logs</h1>
		</div>
		<div class="flex justify-end">
			<a href="/" class="rounded-xl bg-choc-700 px-4 py-2 text-sm font-semibold text-van-100 hover:bg-choc-600 transition-colors">
				← Dashboard
			</a>
		</div>
	</div>
	<div class="px-8 py-4">
		<div class="grid gap-3">

		<!-- Filter bento block -->
		<div class="rounded-2xl bg-van-50 p-5">
			<p class="mb-3 text-xs font-semibold uppercase tracking-widest text-choc-600">Filters</p>
			<form method="GET" class="grid grid-cols-2 gap-3 md:grid-cols-3">
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">Search</span>
					<input name="q" value={data.filters.q} placeholder="Route, IP, resource…"
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">Event type</span>
					<select name="eventType" class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2 text-sm text-choc-800 outline-none focus:border-straw-500">
						<option value="">All</option>
						{#each data.options.eventTypes as eventType}
							<option value={eventType} selected={data.filters.eventType === eventType}>{eventType}</option>
						{/each}
					</select>
				</label>
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">Outcome</span>
					<select name="outcome" class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2 text-sm text-choc-800 outline-none focus:border-straw-500">
						<option value="">All</option>
						{#each data.options.outcomes as outcome}
							<option value={outcome} selected={data.filters.outcome === outcome}>{outcome}</option>
						{/each}
					</select>
				</label>
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">Route</span>
					<input name="route" value={data.filters.route}
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">IP</span>
					<input name="ip" value={data.filters.ip}
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
				<div class="flex items-end gap-2">
					<button type="submit" class="flex-1 rounded-xl bg-straw-500 px-3 py-2 text-sm font-bold text-white hover:bg-straw-600 transition-colors">
						Apply
					</button>
					<a href="/admin/logs" class="flex-1 rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2 text-center text-sm font-semibold text-choc-600 hover:border-choc-600 transition-colors">
						Reset
					</a>
				</div>
			</form>
		</div>

		<!-- Logs table bento block -->
		<div class="rounded-2xl bg-van-50 overflow-hidden">
			<div class="p-4 pb-2">
				<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">
					{data.logs.length} {data.logs.length === 1 ? 'entry' : 'entries'}
				</p>
			</div>
			<div class="overflow-x-auto px-4 pb-4">
				<table class="min-w-full text-sm">
					<thead>
						<tr class="border-b-2 border-van-300">
							<th class="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Time</th>
							<th class="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Event</th>
							<th class="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Outcome</th>
							<th class="pb-2 pr-4 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">Route</th>
							<th class="pb-2 text-left text-xs font-semibold uppercase tracking-widest text-choc-600">IP</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-van-200">
						{#each data.logs as log}
							<tr class="hover:bg-van-100 transition-colors">
								<td class="py-2.5 pr-4 text-xs text-choc-600 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
								<td class="py-2.5 pr-4 font-semibold text-choc-800">{log.eventType}</td>
								<td class="py-2.5 pr-4">
									<span class="rounded-lg px-2 py-0.5 text-xs font-bold
										{log.outcome === 'SUCCESS' ? 'bg-van-300 text-choc-700' :
										 log.outcome === 'FAILURE' ? 'bg-straw-100 text-straw-600' :
										 'bg-choc-700 text-van-100'}">
										{log.outcome}
									</span>
								</td>
								<td class="py-2.5 pr-4 text-xs text-choc-600 font-mono">{log.route ?? '-'}</td>
								<td class="py-2.5 text-xs text-choc-600 font-mono">{log.ip ?? '-'}</td>
							</tr>
						{/each}
						{#if data.logs.length === 0}
							<tr>
								<td class="py-8 text-center text-sm text-choc-600" colspan="5">No logs matched your filters.</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>

		</div>
	</div>
</div>
