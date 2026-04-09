<script lang="ts">
  import { goto } from '$app/navigation';
  import { login } from '$lib/services/api';
  import { saveAuth } from '$lib/context/auth';

  let email = '';
  let password = '';
  let showPassword = false;
  let error = '';
  let loading = false;

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

<div class="min-h-screen bg-slate-950 px-4 py-20">
  <div class="mx-auto max-w-lg rounded-[2rem] border border-slate-800 bg-slate-950/95 p-10 shadow-2xl">
    <div class="mb-8 space-y-2 text-center">
      <p class="text-sm uppercase tracking-[0.35em] text-sky-400/80">Secure sign in</p>
      <h1 class="text-3xl font-semibold text-slate-100">Login to your workspace</h1>
      <p class="text-slate-400">Access your role-based dashboard with secure authentication.</p>
    </div>

    {#if error}
      <div class="mb-5 rounded-3xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
        {error}
      </div>
    {/if}

    <form class="space-y-5" onsubmit={handleSubmit}>
      <div class="space-y-4">
        <label class="block text-sm font-medium text-slate-300">Email</label>
        <input
          type="email"
          bind:value={email}
          placeholder="you@example.com"
          class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
        />
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between text-sm text-slate-400">
          <label class="font-medium text-slate-300">Password</label>
          <button
            type="button"
            class="text-sky-400 hover:text-sky-300"
            onclick={() => (showPassword = !showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <input
          type={showPassword ? 'text' : 'password'}
          bind:value={password}
          placeholder="Enter your password"
          class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
        />
      </div>

      <button
        type="submit"
        class="w-full rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
      >
        {#if loading}
          Signing in...
        {:else}
          Login
        {/if}
      </button>
    </form>

    <div class="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
      <span>New here?</span>
      <a href="/register" class="font-semibold text-slate-100 hover:text-sky-300">Create an account</a>
    </div>
  </div>
</div>
