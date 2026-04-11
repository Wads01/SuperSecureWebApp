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

<nav class="flex items-center justify-between border-b border-zinc-900 bg-black px-6 py-4">
  <span class="text-sm font-medium text-white">SSWA</span>
  <div class="flex items-center gap-4">
    {#if authUser}
      <span class="text-sm text-zinc-500">{authUser.name} · {authUser.role}</span>
      <a
        href="/account/password"
        class="rounded border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-white"
      >
        Change password
      </a>
    {/if}
    <button
      type="button"
      onclick={handleLogout}
      class="rounded border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-white"
    >
      Logout
    </button>
  </div>
</nav>
