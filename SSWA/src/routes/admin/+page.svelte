<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import Table from '$lib/components/Table.svelte';
  import { createUser, deleteUser, fetchLogs, fetchUsers, updateUserRole, type LogPayload, type UserPayload } from '$lib/services/api';

  let users: UserPayload[] = [];
  let logs: LogPayload[] = [];
  let loadingUsers = true;
  let loadingLogs = true;
  let error = '';
  let userName = '';
  let userEmail = '';
  let userPassword = '';
  let userRole: 'admin' | 'manager' | 'user' = 'manager';
  let logFilter = '';

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
  <div class="min-h-screen bg-slate-950 px-4 py-10">
    <div class="mx-auto grid max-w-[1300px] gap-8 xl:grid-cols-[280px_1fr]">
      <Sidebar />
      <div class="space-y-8">
        <Navbar />

        <section class="rounded-[2rem] border border-slate-800 bg-slate-950/95 p-8 shadow-2xl">
          <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p class="text-sm uppercase tracking-[0.3em] text-sky-400/80">Admin dashboard</p>
              <h1 class="mt-3 text-3xl font-semibold text-slate-100">Manage users and system logs</h1>
              <p class="max-w-2xl text-slate-400">Create accounts, assign roles, and review audit activity in one secure panel.</p>
            </div>
          </div>

          {#if error}
            <div class="mb-6 rounded-3xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
          {/if}

          <div class="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div class="space-y-8">
              <div class="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                <div class="mb-5">
                  <h2 class="text-xl font-semibold text-slate-100">Create a new user</h2>
                  <p class="text-sm text-slate-400">Add administrators, managers, or role B users.</p>
                </div>
                <form class="space-y-4" onsubmit={handleCreateUser}>
                  <div>
                    <label class="block text-sm font-medium text-slate-300">Name</label>
                    <input
                      type="text"
                      bind:value={userName}
                      placeholder="Jane Doe"
                      class="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-300">Email</label>
                    <input
                      type="email"
                      bind:value={userEmail}
                      placeholder="jane@example.com"
                      class="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-300">Password</label>
                    <input
                      type="password"
                      bind:value={userPassword}
                      placeholder="Strong password"
                      class="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-300">Role</label>
                    <select
                      bind:value={userRole}
                      class="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="user">Role B User</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    class="rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                  >
                    Create user
                  </button>
                </form>
              </div>

              <div class="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                <div class="mb-5 flex items-center justify-between">
                  <div>
                    <h2 class="text-xl font-semibold text-slate-100">Users</h2>
                    <p class="text-sm text-slate-400">Update roles or delete accounts.</p>
                  </div>
                </div>
                {#if loadingUsers}
                  <div class="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 text-center text-slate-400">Loading users…</div>
                {:else if users.length === 0}
                  <div class="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 text-center text-slate-400">No user accounts found.</div>
                {:else}
                  <Table columns={['Name', 'Email', 'Role', 'Actions']} items={users}>
                    <tr slot="rows" let:item class="hover:bg-slate-900/80">
                      <td class="px-4 py-4 text-slate-100">{item.name}</td>
                      <td class="px-4 py-4 text-slate-300">{item.email}</td>
                      <td class="px-4 py-4 text-slate-300">
                        <select
                          class="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none"
                          bind:value={item.role}
                          onchange={(event) => handleRoleChange(item.id, (event.target as HTMLSelectElement).value as 'admin' | 'manager' | 'user')}
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="user">Role B</option>
                        </select>
                      </td>
                      <td class="px-4 py-4">
                        <button
                          type="button"
                          class="rounded-2xl border border-rose-600 bg-rose-600/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-600/20"
                          onclick={() => handleDelete(item.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  </Table>
                {/if}
              </div>
            </div>

            <div class="space-y-8">
              <div class="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                <div class="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 class="text-xl font-semibold text-slate-100">System logs</h2>
                    <p class="text-sm text-slate-400">Review audit activity and filter events.</p>
                  </div>
                </div>
                <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <input
                    type="text"
                    bind:value={logFilter}
                    placeholder="Filter logs by keyword"
                    class="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 sm:w-auto"
                  />
                  <button
                    type="button"
                    class="rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
                    onclick={loadLogs}
                  >
                    Filter
                  </button>
                </div>
                {#if loadingLogs}
                  <div class="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 text-center text-slate-400">Loading logs…</div>
                {:else if logs.length === 0}
                  <div class="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 text-center text-slate-400">No logs match this filter.</div>
                {:else}
                  <Table columns={['When', 'User', 'Level', 'Message']} items={logs}>
                    <tr slot="rows" let:item class="hover:bg-slate-900/80">
                      <td class="px-4 py-4 text-slate-300">{new Date(item.createdAt).toLocaleString()}</td>
                      <td class="px-4 py-4 text-slate-100">{item.user}</td>
                      <td class="px-4 py-4 text-slate-300 uppercase tracking-[0.1em]">{item.level}</td>
                      <td class="px-4 py-4 text-slate-400">{item.message}</td>
                    </tr>
                  </Table>
                {/if}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</ProtectedRoute>
