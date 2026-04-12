<script lang="ts">
	let { form } = $props();

	const minPasswordLength = 12;
	const minResetQuestionLength = 10;
	const minResetAnswerLength = 3;

	let password = $state('');
	let confirmPassword = $state('');
	let resetQuestion = $state('');
	let resetAnswer = $state('');

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
			<h1 class="mt-1 text-2xl font-bold">Create account</h1>
		</div>

		{#if form?.error}
			<div class="rounded-2xl bg-straw-100 border-2 border-straw-500 p-4 text-sm font-semibold text-straw-600">
				{form.error}
			</div>
		{/if}

		<div class="rounded-2xl bg-van-50 p-5">
			<form method="POST" class="grid gap-3">
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">Email</span>
					<input name="email" type="email" autocomplete="email" required
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2.5 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">Password</span>
					<input name="password" type="password" autocomplete="new-password" required
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2.5 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">Confirm password</span>
					<input name="confirmPassword" type="password" autocomplete="new-password" required
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2.5 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">Security question</span>
					<input name="resetQuestion" type="text" placeholder="e.g. First internship company code?" required
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2.5 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">Security answer</span>
					<input name="resetAnswer" type="password" autocomplete="off" required
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2.5 text-sm text-choc-800 outline-none focus:border-straw-500" />
				</label>
				<div class="rounded-xl bg-van-200 p-3 text-xs text-choc-600">
					Password needs 12+ chars, uppercase, lowercase, number and special character.
				</div>
				<button type="submit" class="rounded-xl bg-straw-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-straw-600 transition-colors">
					Create account →
				</button>
			</form>
		</div>

		<div class="rounded-2xl bg-van-200 p-4 text-center text-sm">
			<a href="/login" class="font-semibold text-choc-800 hover:text-straw-500 transition-colors">Already registered? Sign in</a>
		</div>

	</div>
</div>
