<script lang="ts">
	let { form } = $props();
</script>

<div class="min-h-screen bg-van-100 flex items-center justify-center p-4">
	<div class="w-full max-w-sm grid gap-3">

		<div class="rounded-2xl bg-choc-800 p-5 text-van-100">
			<p class="text-xs font-semibold uppercase tracking-widest text-van-300">The Cozy Bean</p>
			<h1 class="mt-1 text-2xl font-bold">Sign in</h1>
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
					<input
						name="email"
						type="email"
						autocomplete="email"
						required
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2.5 text-sm text-choc-800 outline-none focus:border-straw-500"
					/>
				</label>
				<label class="grid gap-1">
					<span class="text-xs font-semibold uppercase tracking-widest text-choc-600">Password</span>
					<input
						name="password"
						type="password"
						autocomplete="current-password"
						required
						class="rounded-xl border-2 border-van-300 bg-van-100 px-3 py-2.5 text-sm text-choc-800 outline-none focus:border-straw-500"
					/>
				</label>
				<button type="submit" class="mt-1 rounded-xl bg-straw-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-straw-600 transition-colors">
					Sign in →
				</button>
			</form>
		</div>

		<div class="rounded-2xl bg-van-200 p-4 flex items-center justify-between text-sm">
			<a href="/register" class="font-semibold text-choc-800 hover:text-straw-500 transition-colors">Create account</a>
			<a href="/forgot-password" class="text-choc-600 hover:text-straw-500 transition-colors">Forgot password?</a>
		</div>

	</div>
</div>
