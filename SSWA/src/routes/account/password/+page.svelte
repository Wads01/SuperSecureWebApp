<script lang="ts">
  import { goto } from '$app/navigation';
  import Navbar from '$lib/components/Navbar.svelte';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import { changePassword } from '$lib/services/api';

  const MIN_LENGTH = 12;

  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');
  let error = $state('');
  let success = $state('');
  let loading = $state(false);
  let submitted = $state(false);

  // Live rule checks for new password
  let rules = $derived({
    length:  newPassword.length >= MIN_LENGTH,
    lower:   /[a-z]/.test(newPassword),
    upper:   /[A-Z]/.test(newPassword),
    digit:   /\d/.test(newPassword),
    special: /[^A-Za-z\d]/.test(newPassword),
  });
  let passwordValid = $derived(Object.values(rules).every(Boolean));
  let passwordsMatch = $derived(newPassword === confirmPassword && confirmPassword !== '');
  let passwordError = $derived(submitted && !passwordValid);
  let confirmError = $derived(submitted && confirmPassword !== '' && !passwordsMatch);

  async function handleSubmit(event: Event) {
    event.preventDefault();
    submitted = true;
    error = '';
    success = '';

    if (!currentPassword || !newPassword || !confirmPassword) {
      error = 'All fields are required.';
      return;
    }
    if (!passwordValid) {
      error = 'New password does not meet the requirements below.';
      return;
    }
    if (!passwordsMatch) {
      error = 'Passwords do not match.';
      return;
    }

    loading = true;
    try {
      const res = await changePassword(currentPassword, newPassword, confirmPassword);
      success = res.message ?? 'Password changed successfully.';
      currentPassword = '';
      newPassword = '';
      confirmPassword = '';
      submitted = false;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to change password.';
    } finally {
      loading = false;
    }
  }
</script>

<ProtectedRoute requiredRoles={['admin', 'manager', 'user']}>
  <div class="min-h-screen bg-black">
    <Navbar />
    <div class="mx-auto max-w-sm px-4 py-12">
      <div class="mb-8">
        <p class="text-xs font-medium uppercase tracking-widest text-zinc-600">Account</p>
        <h1 class="mt-2 text-xl font-medium text-white">Change password</h1>
      </div>

      {#if success}
        <div class="mb-5 border-l-2 border-emerald-500 bg-zinc-950 px-3 py-2.5 text-sm text-emerald-400">
          {success}
        </div>
      {/if}

      {#if error}
        <div class="mb-5 border-l-2 border-red-500 bg-zinc-950 px-3 py-2.5 text-sm text-red-400">
          {error}
        </div>
      {/if}

      <form class="space-y-4" onsubmit={handleSubmit}>
        <div class="space-y-1.5">
          <label class="block text-xs font-medium uppercase tracking-widest text-zinc-500">Current password</label>
          <input
            type="password"
            bind:value={currentPassword}
            placeholder="Your current password"
            class="w-full rounded border bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder-zinc-700 outline-none transition
              {submitted && !currentPassword ? 'border-red-600 focus:border-red-500' : 'border-zinc-800 focus:border-zinc-600'}"
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-medium uppercase tracking-widest text-zinc-500">New password</label>
          <input
            type="password"
            bind:value={newPassword}
            placeholder="Min 12 chars, upper, lower, number, symbol"
            class="w-full rounded border bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder-zinc-700 outline-none transition
              {passwordError ? 'border-red-600 focus:border-red-500' : 'border-zinc-800 focus:border-zinc-600'}"
          />
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
          <label class="block text-xs font-medium uppercase tracking-widest text-zinc-500">Confirm new password</label>
          <input
            type="password"
            bind:value={confirmPassword}
            placeholder="Repeat your new password"
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
              Updating…
            </span>
          {:else}
            Update password
          {/if}
        </button>
      </form>
    </div>
  </div>
</ProtectedRoute>
