<script lang="ts">
	let { data } = $props();
</script>

<main class="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
	<h1 class="text-2xl font-semibold">Security Logs (Admin Only)</h1>

	<form method="GET" class="grid gap-3 rounded border p-4 md:grid-cols-2">
		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">Search</span>
			<input
				name="q"
				value={data.filters.q}
				placeholder="Route, IP, resource type or resource ID"
				class="rounded border px-3 py-2"
			/>
		</label>

		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">Event Type</span>
			<select name="eventType" class="rounded border px-3 py-2">
				<option value="">All</option>
				{#each data.options.eventTypes as eventType}
					<option value={eventType} selected={data.filters.eventType === eventType}>{eventType}</option>
				{/each}
			</select>
		</label>

		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">Outcome</span>
			<select name="outcome" class="rounded border px-3 py-2">
				<option value="">All</option>
				{#each data.options.outcomes as outcome}
					<option value={outcome} selected={data.filters.outcome === outcome}>{outcome}</option>
				{/each}
			</select>
		</label>

		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">Route Contains</span>
			<input name="route" value={data.filters.route} class="rounded border px-3 py-2" />
		</label>

		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">IP Contains</span>
			<input name="ip" value={data.filters.ip} class="rounded border px-3 py-2" />
		</label>

		<div class="flex items-end gap-2">
			<button type="submit" class="rounded bg-black px-3 py-2 text-white">Apply Filters</button>
			<a href="/admin/logs" class="rounded border px-3 py-2">Reset</a>
		</div>
	</form>

	<div class="overflow-x-auto rounded border">
		<table class="min-w-full text-sm">
			<thead class="bg-gray-100 text-left">
				<tr>
					<th class="px-3 py-2">Time</th>
					<th class="px-3 py-2">Event</th>
					<th class="px-3 py-2">Outcome</th>
					<th class="px-3 py-2">Route</th>
					<th class="px-3 py-2">IP</th>
				</tr>
			</thead>
			<tbody>
				{#each data.logs as log}
					<tr class="border-t">
						<td class="px-3 py-2">{new Date(log.createdAt).toLocaleString()}</td>
						<td class="px-3 py-2">{log.eventType}</td>
						<td class="px-3 py-2">{log.outcome}</td>
						<td class="px-3 py-2">{log.route ?? '-'}</td>
						<td class="px-3 py-2">{log.ip ?? '-'}</td>
					</tr>
				{/each}
				{#if data.logs.length === 0}
					<tr class="border-t">
						<td class="px-3 py-4 text-center text-gray-500" colspan="5">No logs matched your filters.</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</main>
