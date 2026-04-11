<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import Table from '$lib/components/Table.svelte';
  import { createUser, deleteUser, fetchLogs, fetchUsers, updateUserRole, type LogPayload, type UserPayload } from '$lib/services/api';

  let users: UserPayload[] = $state([]);
  let logs: LogPayload[] = $state([]);
  let loadingUsers = $state(true);
  let loadingLogs = $state(true);
  let error = $state('');
  let userName = $state('');
  let userEmail = $state('');
  let userPassword = $state('');
  let userRole: 'admin' | 'manager' | 'user' = $state('manager');
  let logFilter = $state('');

  async function loadUsers() {
    loadingUsers = true;
    try {
      users = await fetchUsers();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to load users.';
    } finally {
      loadingUsers = false;
    }
  }

  async function loadLogs() {
    loadingLogs = true;
    try {
      logs = await fetchLogs(logFilter);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to load logs.';
    } finally {
      loadingLogs = false;
    }
  }

  async function handleCreateUser(event: Event) {
    event.preventDefault();
    error = '';

    if (!userName || !userEmail || !userPassword) {
      error = 'Name, email, and password are required.';
      return;
    }

    try {
      await createUser(userName, userEmail, userRole, userPassword);
      userName = '';
      userEmail = '';
      userPassword = '';
      userRole = 'manager';
      await loadUsers();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to create user.';
    }
  }

  async function handleRoleChange(userId: string, role: 'admin' | 'manager' | 'user') {
    try {
      await updateUserRole(userId, role);
      await loadUsers();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to update role.';
    }
  }

  async function handleDelete(userId: string) {
    try {
      await deleteUser(userId);
      await loadUsers();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to delete user.';
    }
  }

  onMount(async () => {
    await Promise.all([loadUsers(), loadLogs()]);
  });
</script>

<ProtectedRoute requiredRoles={['admin']}>
  <div class="flex min-h-screen bg-black">
    <Sidebar />
    <div class="min-w-0 flex-1">
      <Navbar />
      <div class="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <div>
          <p class="text-xs font-medium uppercase tracking-widest text-zinc-600">Admin</p>
          <h1 class="mt-1 text-lg font-medium text-white">Control panel</h1>
        </div>

        {#if error}
          <div class="border-l-2 border-red-500 bg-zinc-950 px-3 py-2.5 text-sm text-red-400">{error}</div>
        {/if}

        <div class="grid gap-6 xl:grid-cols-2">
          <div class="space-y-4 rounded-lg border border-zinc-900 bg-zinc-950 p-6">
            <div>
              <h2 class="text-sm font-medium text-white">Create user</h2>
              <p class="mt-0.5 text-xs text-zinc-600">Add a new account to the system.</p>
            </div>
            <form class="space-y-3" onsubmit={handleCreateUser}>
              <div class="space-y-1.5">
                <label class="block text-xs font-medium uppercase tracking-widest text-zinc-500">Name</label>
                <input type="text" bind:value={userName} placeholder="Jane Doe"
                  class="w-full rounded border border-zinc-800 bg-black px-3 py-2 text-sm text-white placeholder-zinc-700 outline-none transition focus:border-zinc-600" />
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-medium uppercase tracking-widest text-zinc-500">Email</label>
                <input type="email" bind:value={userEmail} placeholder="jane@example.com"
                  class="w-full rounded border border-zinc-800 bg-black px-3 py-2 text-sm text-white placeholder-zinc-700 outline-none transition focus:border-zinc-600" />
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-medium uppercase tracking-widest text-zinc-500">Password</label>
                <input type="password" bind:value={userPassword} placeholder="Strong password"
                  class="w-full rounded border border-zinc-800 bg-black px-3 py-2 text-sm text-white placeholder-zinc-700 outline-none transition focus:border-zinc-600" />
              </div>
              <div class="space-y-1.5">
                <label class="block text-xs font-medium uppercase tracking-widest text-zinc-500">Role</label>
                <select bind:value={userRole}
                  class="w-full rounded border border-zinc-800 bg-black px-3 py-2 text-sm text-white outline-none transition focus:border-zinc-600">
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="user">User</option>
                </select>
              </div>
              <button type="submit"
                class="rounded bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-100">
                Create
              </button>
            </form>
          </div>

          <div class="space-y-4 rounded-lg border border-zinc-900 bg-zinc-950 p-6">
            <div>
              <h2 class="text-sm font-medium text-white">System logs</h2>
              <p class="mt-0.5 text-xs text-zinc-600">Audit activity and security events.</p>
            </div>
            <div class="flex gap-2">
              <input type="text" bind:value={logFilter} placeholder="Filter by keyword"
                class="flex-1 rounded border border-zinc-800 bg-black px-3 py-2 text-sm text-white placeholder-zinc-700 outline-none transition focus:border-zinc-600" />
              <button type="button" onclick={loadLogs}
                class="rounded border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-white">
                Filter
              </button>
            </div>
            {#if loadingLogs}
              <p class="text-xs text-zinc-600">Loading…</p>
            {:else if logs.length === 0}
              <p class="text-xs text-zinc-600">No logs match this filter.</p>
            {:else}
              <div class="overflow-hidden rounded border border-zinc-900">
                <table class="min-w-full text-left text-xs">
                  <thead class="border-b border-zinc-900 bg-black">
                    <tr>
                      <th class="px-3 py-2 font-medium uppercase tracking-widest text-zinc-600">When</th>
                      <th class="px-3 py-2 font-medium uppercase tracking-widest text-zinc-600">User</th>
                      <th class="px-3 py-2 font-medium uppercase tracking-widest text-zinc-600">Level</th>
                      <th class="px-3 py-2 font-medium uppercase tracking-widest text-zinc-600">Message</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-900">
                    {#each logs as log}
                      <tr class="hover:bg-black">
                        <td class="px-3 py-2 text-zinc-600">{new Date(log.createdAt).toLocaleString()}</td>
                        <td class="px-3 py-2 text-zinc-400">{log.user}</td>
                        <td class="px-3 py-2 uppercase {log.level === 'error' ? 'text-red-400' : log.level === 'warning' ? 'text-yellow-500' : 'text-zinc-500'}">{log.level}</td>
                        <td class="px-3 py-2 text-zinc-500">{log.message}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {/if}
          </div>
        </div>

        <div class="space-y-4 rounded-lg border border-zinc-900 bg-zinc-950 p-6">
          <div>
            <h2 class="text-sm font-medium text-white">Users</h2>
            <p class="mt-0.5 text-xs text-zinc-600">Manage roles and accounts.</p>
          </div>
          {#if loadingUsers}
            <p class="text-xs text-zinc-600">Loading…</p>
          {:else if users.length === 0}
            <p class="text-xs text-zinc-600">No users found.</p>
          {:else}
            <div class="overflow-hidden rounded border border-zinc-900">
              <table class="min-w-full text-left text-sm">
                <thead class="border-b border-zinc-900 bg-black">
                  <tr>
                    <th class="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-600">Name</th>
                    <th class="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-600">Email</th>
                    <th class="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-600">Role</th>
                    <th class="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-600">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-900">
                  {#each users as user}
                    <tr class="hover:bg-black">
                      <td class="px-4 py-3 text-white">{user.name}</td>
                      <td class="px-4 py-3 text-zinc-400">{user.email}</td>
                      <td class="px-4 py-3">
                        <select
                          class="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-white outline-none"
                          bind:value={user.role}
                          onchange={(event) => handleRoleChange(user.id, (event.target as HTMLSelectElement).value as 'admin' | 'manager' | 'user')}
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="user">User</option>
                        </select>
                      </td>
                      <td class="px-4 py-3">
                        <button
                          type="button"
                          class="text-xs text-zinc-600 transition hover:text-red-400"
                          onclick={() => handleDelete(user.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</ProtectedRoute>
