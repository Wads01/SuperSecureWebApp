<script lang="ts">
	let { data } = $props();
</script>

<div class="min-h-screen bg-van-100 p-4">
	<div class="mx-auto max-w-3xl grid gap-3">

		<!-- Header tile -->
		<div class="rounded-2xl bg-choc-800 p-5 flex items-center justify-between text-van-100">
			<div>
				<p class="text-xs font-semibold uppercase tracking-widest text-van-300">SSWA</p>
				<h1 class="mt-0.5 text-2xl font-bold">Dashboard</h1>
			</div>
			<form method="POST" action="/logout">
				<button type="submit" class="rounded-xl bg-straw-500 px-4 py-2 text-sm font-bold text-white hover:bg-straw-600 transition-colors">
					Sign out
				</button>
			</form>
		</div>

		{#if data.user}
			<!-- Account info + last-use: 2-col bento row -->
			<div class="grid grid-cols-2 gap-3">
				<div class="rounded-2xl bg-choc-600 p-5 text-van-100">
					<p class="text-xs font-semibold uppercase tracking-widest text-van-300">Account</p>
					<p class="mt-2 text-sm font-medium truncate">{data.user.email}</p>
					<div class="mt-3 flex flex-wrap gap-2">
						<span class="rounded-lg bg-straw-500 px-2.5 py-1 text-xs font-bold">{data.user.role}</span>
						<span class="rounded-lg bg-choc-700 px-2.5 py-1 text-xs font-bold">{data.user.status}</span>
					</div>
				</div>

				<div class="rounded-2xl bg-straw-100 p-5">
					<p class="text-xs font-semibold uppercase tracking-widest text-straw-600">Last activity</p>
					{#if data.lastAccountUse}
						<div class="mt-2 grid gap-2">
							<div>
								<p class="text-xs text-straw-500">Last success</p>
								<p class="text-sm font-semibold text-choc-800">
									{data.lastAccountUse.previousSuccessfulLoginAt
										? new Date(data.lastAccountUse.previousSuccessfulLoginAt).toLocaleString()
										: 'None recorded'}
								</p>
							</div>
							<div>
								<p class="text-xs text-straw-500">Last failure</p>
								<p class="text-sm font-semibold text-choc-800">
									{data.lastAccountUse.previousFailedLoginAt
										? new Date(data.lastAccountUse.previousFailedLoginAt).toLocaleString()
										: 'None recorded'}
								</p>
							</div>
						</div>
					{:else}
						<p class="mt-2 text-sm text-choc-600">No previous session data.</p>
					{/if}
				</div>
			</div>

			<!-- Navigation bento tiles -->
			<div class="grid gap-3 {data.user.role === 'ADMIN' ? 'grid-cols-3' : 'grid-cols-2'}">
				<a href="/manager/users" class="rounded-2xl bg-van-200 p-5 hover:bg-van-300 transition-colors group">
					<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Manage</p>
					<p class="mt-1 text-base font-bold text-choc-800 group-hover:text-straw-500 transition-colors">Users →</p>
				</a>
				<a href="/account/password" class="rounded-2xl bg-van-200 p-5 hover:bg-van-300 transition-colors group">
					<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Account</p>
					<p class="mt-1 text-base font-bold text-choc-800 group-hover:text-straw-500 transition-colors">Change password →</p>
				</a>
				{#if data.user.role === 'ADMIN'}
					<a href="/admin/logs" class="rounded-2xl bg-straw-500 p-5 hover:bg-straw-600 transition-colors">
						<p class="text-xs font-semibold uppercase tracking-widest text-straw-100">Admin</p>
						<p class="mt-1 text-base font-bold text-white">Security logs →</p>
					</a>
				{/if}
			</div>
		{/if}

	</div>
</div>
