<script lang="ts">
  let { label = '', type = 'text', value = '', placeholder = '', error = '', name = '', autocomplete = 'off' } = $props();
</script>

<div class="space-y-2">
  <label class="block text-sm font-medium text-slate-300" for={name}>{label}</label>
  <input
    id={name}
    name={name}
    type={type}
    bind:value
    placeholder={placeholder}
    autocomplete={autocomplete}
    class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
  />
  {#if error}
    <p class="text-xs text-rose-400">{error}</p>
  {/if}
</div>
