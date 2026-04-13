<script lang="ts">
	let { form } = $props();

	const minPasswordLength = 12;

	let currentPassword = $state('');
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
		return met ? 'text-emerald-700' : 'text-straw-600';
	}
</script>

<div class="min-h-screen bg-van-100 flex items-center justify-center p-4">
	<div class="w-full max-w-sm grid gap-3">

		<div class="rounded-2xl bg-choc-800 p-5 text-van-100">
			<p class="text-xs font-semibold uppercase tracking-widest text-van-300">Account</p>
			<h1 class="mt-1 text-2xl font-bold">Change password</h1>
		</div>

		{#if form?.error}
			<div class="rounded-2xl bg-straw-100 border-2 border-straw-500 p-4 text-sm font-semibold text-straw-600">
				{form.error}
			</div>
		{/if}

		{#if form?.success}
			<div class="rounded-2xl bg-van-200 border-2 border-choc-600 p-4 text-sm font-semibold text-choc-800">
				{form.success}
			</div>
		{/if}

		<div class="rounded-2xl bg-van-50 p-5">
			<form method="POST" class="grid gap-3">
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">Current password</span>
					<input name="currentPassword" type="password" autocomplete="current-password" bind:value={currentPassword} required
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2.5 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">New password</span>
					<input name="newPassword" type="password" autocomplete="new-password" bind:value={newPassword} required
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2.5 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
				<div class="rounded-xl bg-van-200 p-3 text-xs grid gap-1">
					<p class={requirementClass(newPassword.length >= minPasswordLength)}>
						{newPassword.length >= minPasswordLength ? '✓' : '✗'} Password should be length {minPasswordLength} or more
					</p>
					<p class={requirementClass(hasUppercase(newPassword))}>
						{hasUppercase(newPassword) ? '✓' : '✗'} Include at least one uppercase letter
					</p>
					<p class={requirementClass(hasLowercase(newPassword))}>
						{hasLowercase(newPassword) ? '✓' : '✗'} Include at least one lowercase letter
					</p>
					<p class={requirementClass(hasNumber(newPassword))}>
						{hasNumber(newPassword) ? '✓' : '✗'} Include at least one number
					</p>
					<p class={requirementClass(hasSpecial(newPassword))}>
						{hasSpecial(newPassword) ? '✓' : '✗'} Include at least one special character
					</p>
					<p class={requirementClass(currentPassword.length > 0 && newPassword.length > 0 && currentPassword !== newPassword)}>
						{currentPassword.length > 0 && newPassword.length > 0 && currentPassword !== newPassword ? '✓' : '✗'} Password re-use is not allowed
					</p>
				</div>
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">Confirm new password</span>
					<input name="confirmPassword" type="password" autocomplete="new-password" bind:value={confirmPassword} required
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2.5 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
				<p class={`text-xs ${requirementClass(newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword)}`}>
					{newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword ? '✓' : '✗'} New password and confirm password should match
				</p>
				<button type="submit" class="mt-1 rounded-xl bg-straw-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-straw-600 transition-colors">
					Update password →
				</button>
			</form>
		</div>

		<div class="rounded-2xl bg-van-200 p-4 text-center text-sm">
			<a href="/" class="font-semibold text-choc-800 hover:text-straw-500 transition-colors">← Back to dashboard</a>
		</div>

	</div>
</div>
