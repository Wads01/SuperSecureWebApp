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
	<div class="px-8 py-6 max-w-4xl mx-auto">
		<div class="grid gap-6">

		{#if data.user}
			<!-- Account info + last activity -->
			<div class="grid grid-cols-2 gap-4">
				<div class="rounded-2xl bg-choc-800 p-5 text-van-100">
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

			<!-- Role-specific navigation, grouped by section -->
			{#if data.user.role === 'USER'}
				<!-- Cafe section -->
				<div class="grid gap-2">
					<p class="text-xs font-semibold uppercase tracking-widest text-choc-600 px-1">Cafe</p>
					<div class="grid grid-cols-2 gap-3">
						<a href="/menu" class="rounded-2xl bg-choc-700 p-5 hover:bg-choc-600 transition-colors group">
							<p class="text-xs font-semibold uppercase tracking-widest text-van-300">Order</p>
							<p class="mt-1 text-base font-bold text-van-100 group-hover:text-van-50 transition-colors">Browse Menu →</p>
							<p class="mt-1 text-xs text-van-300">View items and place a new order</p>
						</a>
						<a href="/orders/me" class="rounded-2xl bg-van-200 p-5 hover:bg-van-300 transition-colors group">
							<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">History</p>
							<p class="mt-1 text-base font-bold text-choc-800 group-hover:text-straw-500 transition-colors">My Orders →</p>
							<p class="mt-1 text-xs text-choc-600">View and cancel pending orders</p>
						</a>
					</div>
				</div>
				<!-- Account section -->
				<div class="grid gap-2">
					<p class="text-xs font-semibold uppercase tracking-widest text-choc-600 px-1">Account</p>
					<div class="grid grid-cols-2 gap-3">
						<a href="/account/password" class="rounded-2xl bg-van-50 border-2 border-van-200 p-4 hover:border-choc-600 transition-colors group flex items-center justify-between">
							<div>
								<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Security</p>
								<p class="mt-0.5 text-sm font-bold text-choc-800 group-hover:text-straw-500 transition-colors">Change Password</p>
							</div>
							<span class="text-choc-600 group-hover:text-straw-500 transition-colors font-bold">→</span>
						</a>
						<a href="/forgot-password" class="rounded-2xl bg-van-50 border-2 border-van-200 p-4 hover:border-choc-600 transition-colors group flex items-center justify-between">
							<div>
								<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Recovery</p>
								<p class="mt-0.5 text-sm font-bold text-choc-800 group-hover:text-straw-500 transition-colors">Forgot Password</p>
							</div>
							<span class="text-choc-600 group-hover:text-straw-500 transition-colors font-bold">→</span>
						</a>
					</div>
				</div>

			{:else if data.user.role === 'MANAGER'}
				<!-- Manage section -->
				<div class="grid gap-2">
					<p class="text-xs font-semibold uppercase tracking-widest text-choc-600 px-1">Manage</p>
					<div class="grid grid-cols-2 gap-3">
						<a href="/manager/orders" class="rounded-2xl bg-choc-700 p-5 hover:bg-choc-600 transition-colors group">
							<p class="text-xs font-semibold uppercase tracking-widest text-van-300">Orders</p>
							<p class="mt-1 text-base font-bold text-van-100 group-hover:text-van-50 transition-colors">All Orders →</p>
							<p class="mt-1 text-xs text-van-300">View and update order statuses</p>
						</a>
						<a href="/manager/users" class="rounded-2xl bg-van-200 p-5 hover:bg-van-300 transition-colors group">
							<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Users</p>
							<p class="mt-1 text-base font-bold text-choc-800 group-hover:text-straw-500 transition-colors">User Management →</p>
							<p class="mt-1 text-xs text-choc-600">Enable or disable customer accounts</p>
						</a>
					</div>
				</div>
				<!-- Account section -->
				<div class="grid gap-2">
					<p class="text-xs font-semibold uppercase tracking-widest text-choc-600 px-1">Account</p>
					<div class="grid grid-cols-2 gap-3">
						<a href="/account/password" class="rounded-2xl bg-van-50 border-2 border-van-200 p-4 hover:border-choc-600 transition-colors group flex items-center justify-between">
							<div>
								<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Security</p>
								<p class="mt-0.5 text-sm font-bold text-choc-800 group-hover:text-straw-500 transition-colors">Change Password</p>
							</div>
							<span class="text-choc-600 group-hover:text-straw-500 transition-colors font-bold">→</span>
						</a>
						<a href="/forgot-password" class="rounded-2xl bg-van-50 border-2 border-van-200 p-4 hover:border-choc-600 transition-colors group flex items-center justify-between">
							<div>
								<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Recovery</p>
								<p class="mt-0.5 text-sm font-bold text-choc-800 group-hover:text-straw-500 transition-colors">Forgot Password</p>
							</div>
							<span class="text-choc-600 group-hover:text-straw-500 transition-colors font-bold">→</span>
						</a>
					</div>
				</div>

			{:else if data.user.role === 'ADMIN'}
				<!-- Admin Tools section -->
				<div class="grid gap-2">
					<p class="text-xs font-semibold uppercase tracking-widest text-choc-600 px-1">Admin Tools</p>
					<div class="grid grid-cols-3 gap-3">
						<a href="/admin/users" class="rounded-2xl bg-choc-700 p-5 hover:bg-choc-600 transition-colors group">
							<p class="text-xs font-semibold uppercase tracking-widest text-van-300">Users</p>
							<p class="mt-1 text-base font-bold text-van-100 group-hover:text-van-50 transition-colors">User Management →</p>
							<p class="mt-1 text-xs text-van-300">Assign roles and set statuses</p>
						</a>
						<a href="/admin/menu" class="rounded-2xl bg-choc-700 p-5 hover:bg-choc-600 transition-colors group">
							<p class="text-xs font-semibold uppercase tracking-widest text-van-300">Menu</p>
							<p class="mt-1 text-base font-bold text-van-100 group-hover:text-van-50 transition-colors">Menu Pricing →</p>
							<p class="mt-1 text-xs text-van-300">Update item prices</p>
						</a>
						<a href="/admin/logs" class="rounded-2xl bg-straw-500 p-5 hover:bg-straw-600 transition-colors group">
							<p class="text-xs font-semibold uppercase tracking-widest text-straw-100">Security</p>
							<p class="mt-1 text-base font-bold text-white group-hover:text-van-50 transition-colors">Security Logs →</p>
							<p class="mt-1 text-xs text-straw-200">Audit and filter security events</p>
						</a>
					</div>
				</div>
				<!-- Manage section -->
				<div class="grid gap-2">
					<p class="text-xs font-semibold uppercase tracking-widest text-choc-600 px-1">Manage</p>
					<div class="grid grid-cols-2 gap-3">
						<a href="/manager/orders" class="rounded-2xl bg-van-50 border-2 border-van-200 p-4 hover:border-choc-600 transition-colors group flex items-center justify-between">
							<div>
								<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Orders</p>
								<p class="mt-0.5 text-sm font-bold text-choc-800 group-hover:text-straw-500 transition-colors">All Orders</p>
							</div>
							<span class="text-choc-600 group-hover:text-straw-500 transition-colors font-bold">→</span>
						</a>
						<a href="/manager/users" class="rounded-2xl bg-van-50 border-2 border-van-200 p-4 hover:border-choc-600 transition-colors group flex items-center justify-between">
							<div>
								<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Users</p>
								<p class="mt-0.5 text-sm font-bold text-choc-800 group-hover:text-straw-500 transition-colors">User Management</p>
							</div>
							<span class="text-choc-600 group-hover:text-straw-500 transition-colors font-bold">→</span>
						</a>
					</div>
				</div>
				<!-- Account section -->
				<div class="grid gap-2">
					<p class="text-xs font-semibold uppercase tracking-widest text-choc-600 px-1">Account</p>
					<div class="grid grid-cols-2 gap-3">
						<a href="/account/password" class="rounded-2xl bg-van-50 border-2 border-van-200 p-4 hover:border-choc-600 transition-colors group flex items-center justify-between">
							<div>
								<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Security</p>
								<p class="mt-0.5 text-sm font-bold text-choc-800 group-hover:text-straw-500 transition-colors">Change Password</p>
							</div>
							<span class="text-choc-600 group-hover:text-straw-500 transition-colors font-bold">→</span>
						</a>
						<a href="/forgot-password" class="rounded-2xl bg-van-50 border-2 border-van-200 p-4 hover:border-choc-600 transition-colors group flex items-center justify-between">
							<div>
								<p class="text-xs font-semibold uppercase tracking-widest text-choc-600">Recovery</p>
								<p class="mt-0.5 text-sm font-bold text-choc-800 group-hover:text-straw-500 transition-colors">Forgot Password</p>
							</div>
							<span class="text-choc-600 group-hover:text-straw-500 transition-colors font-bold">→</span>
						</a>
					</div>
				</div>
			{/if}
		{/if}
		</div>
	</div>
</div>
