<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/context/auth';
  import { goto } from '$app/navigation';

  onMount(() => {
    auth.subscribe((current) => {
      if (current) {
        const route = current.role === 'admin' ? '/admin' : current.role === 'manager' ? '/manager' : '/dashboard';
        goto(route);
      } else {
        goto('/login');
      }
    })();
  });
</script>

<div class="flex min-h-screen items-center justify-center bg-black">
  <div class="text-center">
    <p class="text-xs font-medium uppercase tracking-widest text-zinc-600">SSWA</p>
    <p class="mt-2 text-sm text-zinc-600">Redirecting…</p>
  </div>
</div>
