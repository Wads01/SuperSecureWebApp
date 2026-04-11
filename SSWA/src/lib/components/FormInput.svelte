<script lang="ts">
  let { label = '', type = 'text', value = '', placeholder = '', error = '', name = '', autocomplete = 'off' } = $props();
</script>

<div class="space-y-1.5">
  <label class="block text-xs font-medium uppercase tracking-widest text-zinc-500" for={name}>{label}</label>
  <input
    id={name}
    name={name}
    type={type}
    bind:value
    placeholder={placeholder}
    autocomplete={autocomplete}
    class="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder-zinc-700 outline-none transition focus:border-zinc-600"
  />
  {#if error}
    <p class="text-xs text-red-400">{error}</p>
  {/if}
</div>
