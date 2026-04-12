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
					<input name="resetQuestion" type="text" required
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2.5 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">Security answer</span>
					<input name="resetAnswer" type="password" required
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2.5 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">New password</span>
					<input name="newPassword" type="password" required
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2.5 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">Confirm new password</span>
					<input name="confirmPassword" type="password" required
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2.5 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
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
		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">Security question</span>
			<input
				name="resetQuestion"
				type="text"
				bind:value={resetQuestion}
				required
				class="rounded border px-3 py-2"
			/>
		</label>

		<p class={`text-xs ${requirementClass(resetQuestion.trim().length >= minResetQuestionLength)}`}>
			Security question should be at least 10 characters.
		</p>

		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">Security answer</span>
			<input
				name="resetAnswer"
				type="password"
				bind:value={resetAnswer}
				required
				class="rounded border px-3 py-2"
			/>
		</label>

		<div class="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs">
			<p class={requirementClass(resetAnswer.length >= minResetAnswerLength)}>
				Security answer should be at least 3 characters.
			</p>
			<p class={requirementClass(hasLettersAndNumbers(resetAnswer))}>
				Security answer should include letters and numbers.
			</p>
		</div>

		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">New password</span>
			<input
				name="newPassword"
				type="password"
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
				bind:value={confirmPassword}
				required
				class="rounded border px-3 py-2"
			/>
		</label>

		<p class={`text-xs ${requirementClass(newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword)}`}>
			New password and confirm password should match.
		</p>

		<button type="submit" class="rounded bg-black px-3 py-2 text-white">Reset password</button>
	</form>

	<p class="text-sm text-gray-600">
		Remembered your password?
		<a href="/login" class="underline">Go to login</a>
	</p>
</main>
