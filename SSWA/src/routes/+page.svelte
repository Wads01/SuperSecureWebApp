<script lang="ts">
	let { data } = $props();
</script>

<div class="min-h-screen bg-van-100">
	<!-- Full-width header -->
	<div class="bg-choc-800 px-8 py-6 grid grid-cols-3 items-center text-van-100">
		<div></div>
		<div class="text-center">
			<p class="text-xs font-semibold uppercase tracking-widest text-van-300">The Cozy Bean</p>
			<h1 class="mt-0.5 text-4xl font-bold">Dashboard</h1>
		</div>
		<div class="flex justify-end">
			<form method="POST" action="/logout">
				<button type="submit" class="rounded-xl bg-straw-500 px-4 py-2 text-sm font-bold text-white hover:bg-straw-600 transition-colors">
					Sign out
				</button>
			</form>
		</div>
	</div>
	<div class="px-8 py-4">
		<div class="grid gap-3">

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
			{#if data.user.role === 'USER'}
				<div class="grid grid-cols-3 gap-3">
					<a href="/menu" class="rounded-2xl bg-van-200 p-5 hover:bg-van-300 transition-colors group">
						<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Cafe</p>
						<p class="mt-1 text-base font-bold text-choc-800 group-hover:text-straw-500 transition-colors">Menu / Order →</p>
					</a>
					<a href="/orders/me" class="rounded-2xl bg-van-200 p-5 hover:bg-van-300 transition-colors group">
						<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Cafe</p>
						<p class="mt-1 text-base font-bold text-choc-800 group-hover:text-straw-500 transition-colors">My Orders →</p>
					</a>
					<a href="/account/password" class="rounded-2xl bg-van-200 p-5 hover:bg-van-300 transition-colors group">
						<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Account</p>
						<p class="mt-1 text-base font-bold text-choc-800 group-hover:text-straw-500 transition-colors">Change password →</p>
					</a>
				</div>
			{:else if data.user.role === 'MANAGER'}
				<div class="grid grid-cols-3 gap-3">
					<a href="/manager/orders" class="rounded-2xl bg-van-200 p-5 hover:bg-van-300 transition-colors group">
						<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Manage</p>
						<p class="mt-1 text-base font-bold text-choc-800 group-hover:text-straw-500 transition-colors">Orders →</p>
					</a>
					<a href="/manager/users" class="rounded-2xl bg-van-200 p-5 hover:bg-van-300 transition-colors group">
						<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Manage</p>
						<p class="mt-1 text-base font-bold text-choc-800 group-hover:text-straw-500 transition-colors">Users →</p>
					</a>
					<a href="/account/password" class="rounded-2xl bg-van-200 p-5 hover:bg-van-300 transition-colors group">
						<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Account</p>
						<p class="mt-1 text-base font-bold text-choc-800 group-hover:text-straw-500 transition-colors">Change password →</p>
					</a>
				</div>
			{:else if data.user.role === 'ADMIN'}
				<div class="grid grid-cols-3 gap-3">
					<a href="/admin/users" class="rounded-2xl bg-van-200 p-5 hover:bg-van-300 transition-colors group">
						<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Admin</p>
						<p class="mt-1 text-base font-bold text-choc-800 group-hover:text-straw-500 transition-colors">Users →</p>
					</a>
					<a href="/admin/menu" class="rounded-2xl bg-van-200 p-5 hover:bg-van-300 transition-colors group">
						<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Admin</p>
						<p class="mt-1 text-base font-bold text-choc-800 group-hover:text-straw-500 transition-colors">Menu Pricing →</p>
					</a>
					<a href="/admin/logs" class="rounded-2xl bg-straw-500 p-5 hover:bg-straw-600 transition-colors">
						<p class="text-xs font-semibold uppercase tracking-widest text-straw-100">Admin</p>
						<p class="mt-1 text-base font-bold text-white">Security Logs →</p>
					</a>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<a href="/manager/orders" class="rounded-2xl bg-van-200 p-5 hover:bg-van-300 transition-colors group">
						<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Manage</p>
						<p class="mt-1 text-base font-bold text-choc-800 group-hover:text-straw-500 transition-colors">Orders →</p>
					</a>
					<a href="/account/password" class="rounded-2xl bg-van-200 p-5 hover:bg-van-300 transition-colors group">
						<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Account</p>
						<p class="mt-1 text-base font-bold text-choc-800 group-hover:text-straw-500 transition-colors">Change password →</p>
					</a>
				</div>
			{/if}
		{/if}
		</div>
	</div>
</div>
