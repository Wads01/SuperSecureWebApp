<script lang="ts">
	let { data } = $props();
</script>

<main class="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
	<h1 class="text-2xl font-semibold">Security Logs (Admin Only)</h1>

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
			</tbody>
		</table>
	</div>
</main>
