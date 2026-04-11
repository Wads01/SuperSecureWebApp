<script lang="ts">
  import './layout.css';
  import { onMount } from 'svelte';
  import { loadAuthFromStorage } from '$lib/context/auth';
  import favicon from '$lib/assets/favicon.svg';

  // Auth (12): last-use notice — read once from sessionStorage then clear it
  let lastUse: { previousSuccessfulLoginAt: string | null; previousFailedLoginAt: string | null } | null = null;
  let showLastUse = false;

  onMount(() => {
    loadAuthFromStorage();
    try {
      const stored = sessionStorage.getItem('sswa_last_use');
      if (stored) {
        lastUse = JSON.parse(stored);
        showLastUse = true;
        sessionStorage.removeItem('sswa_last_use');
      }
    } catch { /* ignore parse errors */ }
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{#if showLastUse && lastUse}
  <div class="fixed bottom-4 right-4 z-50 max-w-xs rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs text-zinc-400">
    <p class="mb-1.5 font-medium text-white">Previous account activity</p>
    <p>
      Last login:
      {lastUse.previousSuccessfulLoginAt
        ? new Date(lastUse.previousSuccessfulLoginAt).toLocaleString()
        : 'None'}
    </p>
    <p class="mt-1">
      Last failure:
      {lastUse.previousFailedLoginAt
        ? new Date(lastUse.previousFailedLoginAt).toLocaleString()
        : 'None'}
    </p>
    <button
      onclick={() => (showLastUse = false)}
      class="mt-2 text-zinc-600 underline hover:text-white"
    >Dismiss</button>
  </div>
{/if}

<slot />
