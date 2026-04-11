<script lang="ts">
  let { open = false, title = '', onClose = () => {} } = $props();
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
    <div class="w-full max-w-lg rounded-lg border border-zinc-800 bg-black p-6">
      <div class="mb-5 flex items-center justify-between">
        <h2 class="text-sm font-medium text-white">{title}</h2>
        <button
          type="button"
          on:click={onClose}
          class="text-sm text-zinc-600 transition hover:text-white"
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
