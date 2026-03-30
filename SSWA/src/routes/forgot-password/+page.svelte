<script lang="ts">
	let { form } = $props();
</script>

<main class="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 p-6">
	<h1 class="text-2xl font-semibold">Reset Password</h1>

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
			<span class="text-sm font-medium">Email</span>
			<input name="email" type="email" required class="rounded border px-3 py-2" />
		</label>

		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">Security question</span>
			<input name="resetQuestion" type="text" required class="rounded border px-3 py-2" />
		</label>

		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">Security answer</span>
			<input name="resetAnswer" type="password" required class="rounded border px-3 py-2" />
		</label>

		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">New password</span>
			<input name="newPassword" type="password" required class="rounded border px-3 py-2" />
		</label>

		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">Confirm new password</span>
			<input name="confirmPassword" type="password" required class="rounded border px-3 py-2" />
		</label>

		<button type="submit" class="rounded bg-black px-3 py-2 text-white">Reset password</button>
	</form>

	<p class="text-sm text-gray-600">
		Remembered your password?
		<a href="/login" class="underline">Go to login</a>
	</p>
</main>
