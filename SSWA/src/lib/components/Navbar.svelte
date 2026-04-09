<script lang="ts">
  import { auth, clearAuth } from '$lib/context/auth';
  import { goto } from '$app/navigation';

  let authUser = $state(null);
  auth.subscribe((v) => { authUser = v; });

  function handleLogout() {
    clearAuth();
    goto('/login');
  }
</script>

<nav class="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-950/95 px-5 py-4 shadow-2xl backdrop-blur-md">
  <div>
    <p class="text-sm uppercase tracking-[0.2em] text-sky-400/80">Secure Web App</p>
    <p class="text-base text-slate-300">Modern access control dashboard</p>
  </div>
  <div class="flex items-center gap-3">
    {#if authUser}
      <div class="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-slate-200 shadow-inner">{authUser.name} · {authUser.role}</div>
    {/if}
    <button
      type="button"
      onclick={handleLogout}
      class="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-sky-500 hover:bg-slate-800"
    >
      Logout
    </button>
  </div>
</nav>
