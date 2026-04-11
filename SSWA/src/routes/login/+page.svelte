<script lang="ts">
  import { goto } from '$app/navigation';
  import { login } from '$lib/services/api';
  import { saveAuth } from '$lib/context/auth';

  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let error = $state('');
  let loading = $state(false);

  async function handleSubmit(event: Event) {
    event.preventDefault();
    error = '';

    if (!email || !password) {
      error = 'Email and password are required.';
      return;
    }

    loading = true;

    try {
      const response = await login(email, password);
      saveAuth(response.user);
      // Auth (12): persist last-use info for display after redirect (shown once then cleared)
      if (response.lastAccountUse) {
        sessionStorage.setItem('sswa_last_use', JSON.stringify(response.lastAccountUse));
      }
      const role = response.user.role;
      const route = role === 'admin' ? '/admin' : role === 'manager' ? '/manager' : '/dashboard';
      goto(route);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to login.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center bg-black px-4">
  <div class="w-full max-w-sm">
    <div class="mb-8 text-center">
      <p class="text-xs font-medium uppercase tracking-widest text-zinc-600">Secure sign in</p>
      <h1 class="mt-2 text-xl font-medium text-white">Welcome back</h1>
    </div>

    {#if error}
      <div class="mb-5 border-l-2 border-red-500 bg-zinc-950 px-3 py-2.5 text-sm text-red-400">
        {error}
      </div>
    {/if}

    <form class="space-y-4" onsubmit={handleSubmit}>
      <div class="space-y-1.5">
        <label class="block text-xs font-medium uppercase tracking-widest text-zinc-500">Email</label>
        <input
          type="email"
          bind:value={email}
          placeholder="you@example.com"
          class="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder-zinc-700 outline-none transition focus:border-zinc-600"
        />
      </div>

      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-medium uppercase tracking-widest text-zinc-500">Password</label>
          <button
            type="button"
            class="text-xs text-zinc-600 transition hover:text-white"
            onclick={() => (showPassword = !showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <input
          type={showPassword ? 'text' : 'password'}
          bind:value={password}
          placeholder="Your password"
          class="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder-zinc-700 outline-none transition focus:border-zinc-600"
        />
      </div>

      <button
        type="submit"
        class="relative w-full rounded px-4 py-2.5 text-sm font-medium transition
          {loading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-100'}"
        disabled={loading}
      >
        {#if loading}
          <span class="flex items-center justify-center gap-2">
            <span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300"></span>
            Signing in…
          </span>
        {:else}
          Sign in
        {/if}
      </button>
    </form>

    <p class="mt-6 text-center text-xs text-zinc-600">
      No account? <a href="/register" class="text-zinc-400 transition hover:text-white">Create one</a>
    </p>
  </div>
</div>
