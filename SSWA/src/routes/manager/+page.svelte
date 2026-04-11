<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import Table from '$lib/components/Table.svelte';
  import { auth } from '$lib/context/auth';
  import { assignTask, fetchItems, fetchUsers, type ItemPayload, type UserPayload } from '$lib/services/api';

  let items: ItemPayload[] = $state([]);
  let users: UserPayload[] = $state([]);
  let loading = $state(true);
  let usersLoading = $state(true);
  let error = $state('');
  let taskModalOpen = $state(false);
  let selectedUser: UserPayload | null = $state(null);
  let taskText = $state('');

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
  <div class="flex min-h-screen bg-black">
    <Sidebar />
    <div class="min-w-0 flex-1">
      <Navbar />
      <div class="mx-auto max-w-5xl space-y-8 px-6 py-8">
        <div>
          <p class="text-xs font-medium uppercase tracking-widest text-zinc-600">Manager</p>
          <h1 class="mt-1 text-lg font-medium text-white">Team workspace</h1>
        </div>

        {#if error}
          <div class="border-l-2 border-red-500 bg-zinc-950 px-3 py-2.5 text-sm text-red-400">{error}</div>
        {/if}

        <div class="grid gap-6 xl:grid-cols-2">
          <div class="space-y-4 rounded-lg border border-zinc-900 bg-zinc-950 p-6">
            <div>
              <h2 class="text-sm font-medium text-white">Team items</h2>
              <p class="mt-0.5 text-xs text-zinc-600">All user-owned items.</p>
            </div>
            {#if loading}
              <p class="text-xs text-zinc-600">Loading…</p>
            {:else if items.length === 0}
              <p class="text-xs text-zinc-600">No items found.</p>
            {:else}
              <div class="overflow-hidden rounded border border-zinc-900">
                <table class="min-w-full text-left text-sm">
                  <thead class="border-b border-zinc-900 bg-black">
                    <tr>
                      <th class="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-600">Title</th>
                      <th class="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-600">Owner</th>
                      <th class="px-4 py-3 text-xs font-medium uppercase tracking-widest text-zinc-600">Created</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-900">
                    {#each items as item}
                      <tr class="hover:bg-black">
                        <td class="px-4 py-3 text-white">{item.title}</td>
                        <td class="px-4 py-3 text-zinc-400">{item.ownerName}</td>
                        <td class="px-4 py-3 text-zinc-600">{new Date(item.createdAt).toLocaleDateString()}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {/if}
          </div>

          <div class="space-y-4 rounded-lg border border-zinc-900 bg-zinc-950 p-6">
            <div>
              <h2 class="text-sm font-medium text-white">Users</h2>
              <p class="mt-0.5 text-xs text-zinc-600">Assign tasks to team members.</p>
            </div>
            {#if usersLoading}
              <p class="text-xs text-zinc-600">Loading…</p>
            {:else if users.length === 0}
              <p class="text-xs text-zinc-600">No users.</p>
            {:else}
              <div class="space-y-2">
                {#each users as user}
                  <div class="rounded border border-zinc-900 bg-black p-4">
                    <div class="flex items-start justify-between gap-4">
                      <div>
                        <p class="text-sm font-medium text-white">{user.name}</p>
                        <p class="text-xs text-zinc-600">{user.email}</p>
                      </div>
                      <button
                        type="button"
                        class="rounded border border-zinc-800 px-2.5 py-1 text-xs text-zinc-400 transition hover:border-zinc-600 hover:text-white"
                        onclick={() => openTaskModal(user)}
                      >
                        Assign task
                      </button>
                    </div>
                    {#if user.task}
                      <p class="mt-2 text-xs text-zinc-500">{user.task}</p>
                    {:else}
                      <p class="mt-2 text-xs text-zinc-700">No task assigned.</p>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>

    <Modal open={taskModalOpen} title="Assign task" onClose={() => (taskModalOpen = false)}>
      <div class="space-y-4">
        {#if selectedUser}
          <p class="text-xs text-zinc-500">Assigning to <span class="text-white">{selectedUser.name}</span>.</p>
        {/if}
        <textarea
          bind:value={taskText}
          rows={4}
          placeholder="Task details"
          class="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder-zinc-700 outline-none transition focus:border-zinc-600"
        />
        <div class="flex justify-end gap-4">
          <button type="button" class="text-sm text-zinc-600 transition hover:text-white" onclick={() => (taskModalOpen = false)}>Cancel</button>
          <button type="button" class="rounded bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-100" onclick={saveTask}>Save</button>
        </div>
      </div>
    </Modal>
  </div>
</ProtectedRoute>
