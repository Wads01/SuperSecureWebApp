<script lang="ts">
  let { open = false, title = '', onClose = () => {} } = $props();
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
    <div class="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
      <div class="mb-5 flex items-center justify-between gap-4">
        <h2 class="text-xl font-semibold text-slate-100">{title}</h2>
        <button
          type="button"
          on:click={onClose}
          class="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 transition hover:bg-slate-800"
        >
          Close
        </button>
      </div>
      <div class="space-y-4">
        <slot />
      </div>
    </div>
  </div>
{/if}
