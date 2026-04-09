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

<div class="flex min-h-screen items-center justify-center px-4 py-20">
  <div class="max-w-xl rounded-[2rem] border border-slate-800 bg-slate-950/90 p-10 text-center shadow-2xl">
    <p class="text-sm uppercase tracking-[0.3em] text-sky-400/80">Secure Web App</p>
    <h1 class="mt-5 text-4xl font-semibold text-slate-100">Preparing your secure workspace…</h1>
    <p class="mt-4 text-slate-400">If you are already signed in, you will be redirected automatically.</p>
  </div>
</div>
