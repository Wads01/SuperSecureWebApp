<script lang="ts">
	let { form } = $props();

	const minPasswordLength = 12;

	let newPassword = $state('');
	let confirmPassword = $state('');

	function hasUppercase(value: string): boolean {
		return /[A-Z]/.test(value);
	}

	function hasLowercase(value: string): boolean {
		return /[a-z]/.test(value);
	}

	function hasNumber(value: string): boolean {
		return /\d/.test(value);
	}

	function hasSpecial(value: string): boolean {
		return /[^A-Za-z\d]/.test(value);
	}

	function requirementClass(met: boolean): string {
		return met ? 'text-green-700' : 'text-red-700';
	}
</script>

<main class="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 p-6">
	<h1 class="text-2xl font-semibold">Change Password</h1>

	{#if form?.error}
		<p class="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{form.error}</p>
	{/if}

	{#if form?.success}
		<p class="rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
			{form.success}
		</p>
	{/if}

	<form method="POST" class="flex flex-col gap-4 rounded border p-4">
		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">Current password</span>
			<input
				name="currentPassword"
				type="password"
				autocomplete="current-password"
				required
				class="rounded border px-3 py-2"
			/>
		</label>

		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">New password</span>
			<input
				name="newPassword"
				type="password"
				autocomplete="new-password"
				bind:value={newPassword}
				required
				class="rounded border px-3 py-2"
			/>
		</label>

		<div class="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs">
			<p class={requirementClass(newPassword.length >= minPasswordLength)}>
				Password should be length 12 or more.
			</p>
			<p class={requirementClass(hasUppercase(newPassword))}>Password should include an uppercase letter.</p>
			<p class={requirementClass(hasLowercase(newPassword))}>Password should include a lowercase letter.</p>
			<p class={requirementClass(hasNumber(newPassword))}>Password should include a number.</p>
			<p class={requirementClass(hasSpecial(newPassword))}>Password should include a special character.</p>
		</div>

		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">Confirm new password</span>
			<input
				name="confirmPassword"
				type="password"
				autocomplete="new-password"
				bind:value={confirmPassword}
				required
				class="rounded border px-3 py-2"
			/>
		</label>

		<p class={`text-xs ${requirementClass(newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword)}`}>
			New password and confirm password should match.
		</p>

		<button type="submit" class="rounded bg-black px-3 py-2 text-white">Update password</button>
	</form>
</main>
