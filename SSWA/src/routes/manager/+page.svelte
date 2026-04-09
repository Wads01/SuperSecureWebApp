<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import Table from '$lib/components/Table.svelte';
  import { auth } from '$lib/context/auth';
  import { assignTask, fetchItems, fetchUsers, type ItemPayload, type UserPayload } from '$lib/services/api';

  let items: ItemPayload[] = [];
  let users: UserPayload[] = [];
  let loading = true;
  let usersLoading = true;
  let error = '';
  let taskModalOpen = false;
  let selectedUser: UserPayload | null = null;
  let taskText = '';

  async function loadItems() {
    loading = true;
    try {
      items = await fetchItems();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to load items.';
    } finally {
      loading = false;
    }
  }

  async function loadUsers() {
    usersLoading = true;
    try {
      users = await fetchUsers();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to load users.';
    } finally {
      usersLoading = false;
    }
  }

  function openTaskModal(user: UserPayload) {
    selectedUser = user;
    taskText = user.task ?? '';
    taskModalOpen = true;
  }

  async function saveTask() {
    if (!selectedUser) return;
    try {
      await assignTask(selectedUser.id, taskText);
      taskModalOpen = false;
      await loadUsers();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to save task.';
    }
  }

  onMount(async () => {
    await Promise.all([loadItems(), loadUsers()]);
  });
</script>

<ProtectedRoute requiredRoles={['manager']}>
  <div class="min-h-screen bg-slate-950 px-4 py-10">
    <div class="mx-auto grid max-w-[1300px] gap-8 lg:grid-cols-[280px_1fr]">
      <Sidebar />

      <div class="space-y-8">
        <Navbar />

        <section class="rounded-[2rem] border border-slate-800 bg-slate-950/95 p-8 shadow-2xl">
          <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p class="text-sm uppercase tracking-[0.3em] text-sky-400/80">Manager workspace</p>
              <h1 class="mt-3 text-3xl font-semibold text-slate-100">Manage role B users and data</h1>
              <p class="max-w-2xl text-slate-400">Review user-owned data, assign tasks, and maintain a secure operations stream.</p>
            </div>
          </div>

          {#if error}
            <div class="mb-6 rounded-3xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
          {/if}

          <div class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div class="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <div class="mb-5 flex items-center justify-between">
                <div>
                  <h2 class="text-xl font-semibold text-slate-100">Your team items</h2>
                  <p class="text-sm text-slate-400">View recent user-owned data and shared information.</p>
                </div>
              </div>
              {#if loading}
                <div class="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 text-center text-slate-400">Loading items…</div>
              {:else if items.length === 0}
                <div class="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 text-center text-slate-400">No items found yet.</div>
              {:else}
                <Table columns={['Title', 'Description', 'Owner', 'Created']} items={items}>
                  <tr slot="rows" let:item class="hover:bg-slate-900/80">
                    <td class="px-4 py-4 text-slate-100">{item.title}</td>
                    <td class="px-4 py-4 text-slate-400">{item.description}</td>
                    <td class="px-4 py-4 text-slate-300">{item.ownerName}</td>
                    <td class="px-4 py-4 text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                  </tr>
                </Table>
              {/if}
            </div>

            <div class="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
              <div class="mb-5">
                <h2 class="text-xl font-semibold text-slate-100">Role B user management</h2>
                <p class="text-sm text-slate-400">Assign tasks and track the active user roster.</p>
              </div>
              {#if usersLoading}
                <div class="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 text-center text-slate-400">Loading users…</div>
              {:else if users.length === 0}
                <div class="rounded-3xl border border-slate-800 bg-slate-950/90 p-8 text-center text-slate-400">No users available.</div>
              {:else}
                <div class="space-y-4">
                  {#each users as user}
                    <div class="rounded-3xl border border-slate-800 bg-slate-950/90 p-4">
                      <div class="flex items-start justify-between gap-4">
                        <div>
                          <p class="font-semibold text-slate-100">{user.name}</p>
                          <p class="text-sm text-slate-400">{user.email}</p>
                          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">{user.role}</p>
                        </div>
                        <button
                          type="button"
                          class="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 transition hover:border-sky-500"
                          onclick={() => openTaskModal(user)}
                        >
                          Assign task
                        </button>
                      </div>
                      <p class="mt-3 text-sm text-slate-400">{user.task ?? 'No task assigned yet.'}</p>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        </section>
      </div>
    </div>

    <Modal open={taskModalOpen} title="Assign task" onClose={() => (taskModalOpen = false)}>
      <div class="space-y-5">
        {#if selectedUser}
          <p class="text-sm text-slate-400">Assign a task to <strong class="text-slate-100">{selectedUser.name}</strong>.</p>
        {/if}

        <textarea
          bind:value={taskText}
          rows={5}
          placeholder="Enter the task details"
          class="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
        />

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            class="rounded-3xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            onclick={() => (taskModalOpen = false)}
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            onclick={saveTask}
          >
            Save task
          </button>
        </div>
      </div>
    </Modal>
  </div>
</ProtectedRoute>
