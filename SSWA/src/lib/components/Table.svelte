<script lang="ts">
  let { columns = [], items = [] } = $props();
</script>

<div class="overflow-hidden rounded-lg border border-zinc-900">
  <table class="min-w-full border-collapse text-left text-sm">
    <thead class="border-b border-zinc-900 bg-zinc-950">
      <tr>
        {#each columns as column}
          <th class="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-600">{column}</th>
        {/each}
      </tr>
    </thead>
    <tbody class="divide-y divide-zinc-900">
      <slot name="rows" {items} />
    </tbody>
  </table>
</div>
