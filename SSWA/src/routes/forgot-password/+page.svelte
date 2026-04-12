<script lang="ts">
	let { form } = $props();

	const minPasswordLength = 12;
	const minResetQuestionLength = 10;
	const minResetAnswerLength = 3;

	let resetQuestion = $state('');
	let resetAnswer = $state('');
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

	function hasLettersAndNumbers(value: string): boolean {
		return /[A-Za-z]/.test(value) && /\d/.test(value);
	}

	function requirementClass(met: boolean): string {
		return met ? 'text-green-700' : 'text-red-700';
	}
</script>

<div class="min-h-screen bg-van-100 flex items-center justify-center p-4">
	<div class="w-full max-w-sm grid gap-3">

		<div class="rounded-2xl bg-choc-800 p-5 text-van-100">
			<p class="text-xs font-semibold uppercase tracking-widest text-van-300">The Cozy Bean</p>
			<h1 class="mt-1 text-2xl font-bold">Reset password</h1>
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
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">Email</span>
					<input name="email" type="email" required
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2.5 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">Security question</span>
					<input name="resetQuestion" type="text" bind:value={resetQuestion} required
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2.5 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
				{#if resetQuestion.length > 0}
					<p class="text-xs {requirementClass(resetQuestion.length >= minResetQuestionLength)}">
						{resetQuestion.length >= minResetQuestionLength ? '✓' : '✗'} Question must be at least {minResetQuestionLength} characters
					</p>
				{/if}
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">Security answer</span>
					<input name="resetAnswer" type="password" bind:value={resetAnswer} autocomplete="off" required
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2.5 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
				{#if resetAnswer.length > 0}
					<p class="text-xs {requirementClass(resetAnswer.length >= minResetAnswerLength)}">
						{resetAnswer.length >= minResetAnswerLength ? '✓' : '✗'} Answer must be at least {minResetAnswerLength} characters
					</p>
				{/if}
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">New password</span>
					<input name="newPassword" type="password" bind:value={newPassword} autocomplete="new-password" required
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2.5 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
				{#if newPassword.length > 0}
					<div class="rounded-xl bg-van-200 p-3 text-xs grid gap-1">
						<p class={requirementClass(newPassword.length >= minPasswordLength)}>
							{newPassword.length >= minPasswordLength ? '✓' : '✗'} At least {minPasswordLength} characters
						</p>
						<p class={requirementClass(hasUppercase(newPassword))}>
							{hasUppercase(newPassword) ? '✓' : '✗'} One uppercase letter
						</p>
						<p class={requirementClass(hasLowercase(newPassword))}>
							{hasLowercase(newPassword) ? '✓' : '✗'} One lowercase letter
						</p>
						<p class={requirementClass(hasNumber(newPassword))}>
							{hasNumber(newPassword) ? '✓' : '✗'} One number
						</p>
						<p class={requirementClass(hasSpecial(newPassword))}>
							{hasSpecial(newPassword) ? '✓' : '✗'} One special character
						</p>
					</div>
				{/if}
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">Confirm new password</span>
					<input name="confirmPassword" type="password" bind:value={confirmPassword} autocomplete="new-password" required
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2.5 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
				{#if confirmPassword.length > 0}
					<p class="text-xs {requirementClass(newPassword === confirmPassword)}">
						{newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
					</p>
				{/if}
				<button type="submit" class="mt-1 rounded-xl bg-straw-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-straw-600 transition-colors">
					Reset password →
				</button>
			</form>
		</div>

		<div class="rounded-2xl bg-van-200 p-4 text-center text-sm">
			<a href="/login" class="font-semibold text-choc-800 hover:text-straw-500 transition-colors">← Back to sign in</a>
		</div>

	</div>
</div>
