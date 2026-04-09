<script lang="ts">
  let { columns = [], items = [] } = $props();
</script>

<div class="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl">
  <table class="min-w-full border-collapse text-left text-sm text-slate-300">
    <thead class="bg-slate-900/90 text-slate-400">
      <tr>
        {#each columns as column}
          <th class="px-4 py-3 font-medium uppercase tracking-wide">{column}</th>
        {/each}
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-800">
      <slot name="rows" {items} />
    </tbody>
  </table>
</div>
