<script lang="ts">
  import { goto } from '$app/navigation';
  import { register } from '$lib/services/api';

  let name = '';
  let email = '';
  let password = '';
  let confirmPassword = '';
  let error = '';
  let loading = false;
  let success = '';

  async function handleSubmit(event: Event) {
    event.preventDefault();
    error = '';
    success = '';

    if (!name || !email || !password || !confirmPassword) {
      error = 'All fields are required.';
      return;
    }

    if (password !== confirmPassword) {
      error = 'Passwords must match.';
      return;
    }

    loading = true;

    try {
      await register(name, email, password);
      success = 'Registration completed. Redirecting to login...';
      setTimeout(() => goto('/login'), 1200);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to register.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-slate-950 px-4 py-20">
  <div class="mx-auto max-w-lg rounded-[2rem] border border-slate-800 bg-slate-950/95 p-10 shadow-2xl">
    <div class="mb-8 space-y-2 text-center">
      <p class="text-sm uppercase tracking-[0.35em] text-sky-400/80">Role B Registration</p>
      <h1 class="text-3xl font-semibold text-slate-100">Create your secure account</h1>
      <p class="text-slate-400">Role B users can register here and access the dashboard.</p>
    </div>

    {#if error}
      <div class="mb-5 rounded-3xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
        {error}
      </div>
    {/if}

    {#if success}
      <div class="mb-5 rounded-3xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
        {success}
      </div>
    {/if}

    <form class="space-y-5" onsubmit={handleSubmit}>
      <div class="space-y-4">
        <label class="block text-sm font-medium text-slate-300">Name</label>
        <input
          type="text"
          bind:value={name}
          placeholder="Your full name"
          class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
        />
      </div>

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
        <label class="block text-sm font-medium text-slate-300">Password</label>
        <input
          type="password"
          bind:value={password}
          placeholder="Create a strong password"
          class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
        />
      </div>

      <div class="space-y-4">
        <label class="block text-sm font-medium text-slate-300">Confirm Password</label>
        <input
          type="password"
          bind:value={confirmPassword}
          placeholder="Repeat your password"
          class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
        />
      </div>

      <button
        type="submit"
        class="w-full rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
      >
        {#if loading}
          Creating account...
        {:else}
          Register
        {/if}
      </button>
    </form>

    <div class="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
      <span>Already have an account?</span>
      <a href="/login" class="font-semibold text-slate-100 hover:text-sky-300">Login instead</a>
    </div>
  </div>
</div>
