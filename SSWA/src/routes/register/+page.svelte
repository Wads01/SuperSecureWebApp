<script lang="ts">
  import { goto } from '$app/navigation';
  import { register, login } from '$lib/services/api';
  import { saveAuth } from '$lib/context/auth';

  const MIN_LENGTH = 12;

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let confirmPassword = $state('');
  let error = $state('');
  let loading = $state(false);
  let success = $state('');
  let submitted = $state(false);

  // Live rule checks (derived)
  let rules = $derived({
    length:    password.length >= MIN_LENGTH,
    lower:     /[a-z]/.test(password),
    upper:     /[A-Z]/.test(password),
    digit:     /\d/.test(password),
    special:   /[^A-Za-z\d]/.test(password),
  });
  let passwordValid = $derived(Object.values(rules).every(Boolean));
  let passwordsMatch = $derived(password === confirmPassword && confirmPassword !== '');
  let passwordError = $derived(submitted && !passwordValid);
  let confirmError = $derived(submitted && confirmPassword !== '' && !passwordsMatch);

  async function handleSubmit(event: Event) {
    event.preventDefault();
    submitted = true;
    error = '';
    success = '';

    if (!name || !email || !password || !confirmPassword) {
      error = 'All fields are required.';
      return;
    }
    if (!passwordValid) {
      error = 'Password does not meet the requirements below.';
      return;
    }
    if (!passwordsMatch) {
      error = 'Passwords do not match.';
      return;
    }

    loading = true;
    try {
      await register(name, email, password);
      // Auto-login immediately after successful registration
      const response = await login(email, password);
      saveAuth(response.user);
      success = 'Account created. Taking you in…';
      const role = response.user.role;
      const route = role === 'admin' ? '/admin' : role === 'manager' ? '/manager' : '/dashboard';
      setTimeout(() => goto(route), 800);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to register.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center bg-black px-4 py-12">
  <div class="w-full max-w-sm">
    <div class="mb-8 text-center">
      <p class="text-xs font-medium uppercase tracking-widest text-zinc-600">Create account</p>
      <h1 class="mt-2 text-xl font-medium text-white">Register</h1>
    </div>

    {#if error}
      <div class="mb-5 border-l-2 border-red-500 bg-zinc-950 px-3 py-2.5 text-sm text-red-400">
        {error}
      </div>
    {/if}

    {#if success}
      <div class="mb-5 border-l-2 border-emerald-500 bg-zinc-950 px-3 py-2.5 text-sm text-emerald-400">
        {success}
      </div>
    {/if}

    <form class="space-y-4" onsubmit={handleSubmit}>
      <div class="space-y-1.5">
        <label class="block text-xs font-medium uppercase tracking-widest text-zinc-500">Name</label>
        <input
          type="text"
          bind:value={name}
          placeholder="Your full name"
          class="w-full rounded border bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder-zinc-700 outline-none transition
            {submitted && !name ? 'border-red-600 focus:border-red-500' : 'border-zinc-800 focus:border-zinc-600'}"
        />
      </div>

      <div class="space-y-1.5">
        <label class="block text-xs font-medium uppercase tracking-widest text-zinc-500">Email</label>
        <input
          type="email"
          bind:value={email}
          placeholder="you@example.com"
          class="w-full rounded border bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder-zinc-700 outline-none transition
            {submitted && !email ? 'border-red-600 focus:border-red-500' : 'border-zinc-800 focus:border-zinc-600'}"
        />
      </div>

      <div class="space-y-1.5">
        <label class="block text-xs font-medium uppercase tracking-widest text-zinc-500">Password</label>
        <input
          type="password"
          bind:value={password}
          placeholder="Min 12 chars, upper, lower, number, symbol"
          class="w-full rounded border bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder-zinc-700 outline-none transition
            {passwordError ? 'border-red-600 focus:border-red-500' : 'border-zinc-800 focus:border-zinc-600'}"
        />
        <!-- Live requirement checklist -->
        <ul class="mt-2 space-y-1">
          {#each [
            { ok: rules.length,  label: `At least ${MIN_LENGTH} characters` },
            { ok: rules.upper,   label: 'One uppercase letter' },
            { ok: rules.lower,   label: 'One lowercase letter' },
            { ok: rules.digit,   label: 'One number' },
            { ok: rules.special, label: 'One special character' },
          ] as rule}
            <li class="flex items-center gap-1.5 text-xs {rule.ok ? 'text-emerald-500' : passwordError ? 'text-red-400' : 'text-zinc-600'}">
              <span>{rule.ok ? '✓' : '×'}</span>
              {rule.label}
            </li>
          {/each}
        </ul>
      </div>

      <div class="space-y-1.5">
        <label class="block text-xs font-medium uppercase tracking-widest text-zinc-500">Confirm password</label>
        <input
          type="password"
          bind:value={confirmPassword}
          placeholder="Repeat your password"
          class="w-full rounded border bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder-zinc-700 outline-none transition
            {confirmError ? 'border-red-600 focus:border-red-500' : 'border-zinc-800 focus:border-zinc-600'}"
        />
        {#if confirmError}
          <p class="text-xs text-red-400">Passwords do not match.</p>
        {/if}
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
            Creating account…
          </span>
        {:else}
          Register
        {/if}
      </button>
    </form>

    <p class="mt-6 text-center text-xs text-zinc-600">
      Already have an account? <a href="/login" class="text-zinc-400 transition hover:text-white">Sign in</a>
    </p>
  </div>
</div>
