<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/context/auth';
  import Navbar from '$lib/components/Navbar.svelte';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import Table from '$lib/components/Table.svelte';
  import { createItem, deleteItem, fetchItems, updateItem, type ItemPayload } from '$lib/services/api';

  let items: ItemPayload[] = $state([]);
  let loading = $state(true);
  let error = $state('');
  let modalOpen = $state(false);
  let saving = $state(false);
  let activeItem: ItemPayload | null = $state(null);
  let title = $state('');
  let description = $state('');

  // Auth (12): last-account-use notice shown once per session
  interface LastUse { previousSuccessfulLoginAt: string | null; previousFailedLoginAt: string | null; }
  let lastUse: LastUse | null = $state(null);

  async function loadItems() {
    loading = true;
    error = '';
    try {
      items = await fetchItems();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to load items.';
    } finally {
      loading = false;
    }
  }

  function openCreate() {
    activeItem = null;
    title = '';
    description = '';
    modalOpen = true;
  }

  function openEdit(item: ItemPayload) {
    activeItem = item;
    title = item.title;
    description = item.description;
    modalOpen = true;
  }

  async function saveItem() {
    if (!title || !description) {
      error = 'Title and description are required.';
      return;
    }

    saving = true;
    try {
      if (activeItem) {
        await updateItem(activeItem.id, title, description);
      } else {
        await createItem(title, description);
      }
      modalOpen = false;
      await loadItems();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to save item.';
    } finally {
      saving = false;
    }
  }

  async function removeItem(id: string) {
    saving = true;
    try {
      await deleteItem(id);
      await loadItems();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unable to delete item.';
    } finally {
      saving = false;
    }
  }

  onMount(() => {
    loadItems();
    // Auth (12): read and clear the last-use notice stored by the login handler
    const raw = sessionStorage.getItem('sswa_last_use');
    if (raw) {
      try { lastUse = JSON.parse(raw); } catch { /* ignore */ }
      sessionStorage.removeItem('sswa_last_use');
    }
  });
</script>

<ProtectedRoute requiredRoles={['user']}>
  <div class="min-h-screen bg-black">
    <Navbar />
    <div class="mx-auto max-w-5xl px-6 py-8">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-widest text-zinc-600">Dashboard</p>
          <h1 class="mt-1 text-lg font-medium text-white">Your workspace</h1>
        </div>
        <button
          type="button"
          class="rounded border border-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:text-white"
          onclick={openCreate}
        >
          New item
        </button>
      </div>

      {#if lastUse}
        <div class="mb-5 border-l-2 border-zinc-700 bg-zinc-950 px-3 py-2.5 text-xs text-zinc-400">
          <p class="font-medium uppercase tracking-widest text-zinc-500 mb-1">Last account activity</p>
          <p>Last successful login: {lastUse.previousSuccessfulLoginAt ? new Date(lastUse.previousSuccessfulLoginAt).toLocaleString() : 'None recorded'}</p>
          <p>Last failed login attempt: {lastUse.previousFailedLoginAt ? new Date(lastUse.previousFailedLoginAt).toLocaleString() : 'None recorded'}</p>
        </div>
      {/if}

      {#if error}
        <div class="mb-5 border-l-2 border-red-500 bg-zinc-950 px-3 py-2.5 text-sm text-red-400">{error}</div>
      {/if}

      {#if loading}
        <p class="text-sm text-zinc-600">Loading…</p>
      {:else if items.length === 0}
        <div class="rounded-lg border border-zinc-900 bg-zinc-950 px-6 py-12 text-center">
          <p class="text-sm text-zinc-600">No items yet. Create your first one.</p>
        </div>
      {:else}
        <Table columns={['Title', 'Description', 'Owner', 'Created', 'Actions']} items={items}>
          <tr slot="rows" let:item class="hover:bg-zinc-950">
            <td class="px-4 py-3 text-sm text-white">{item.title}</td>
            <td class="px-4 py-3 text-sm text-zinc-500">{item.description}</td>
            <td class="px-4 py-3 text-sm text-zinc-400">{item.ownerName}</td>
            <td class="px-4 py-3 text-sm text-zinc-600">{new Date(item.createdAt).toLocaleDateString()}</td>
            <td class="px-4 py-3">
              <div class="flex gap-3">
                <button
                  type="button"
                  class="text-xs text-zinc-500 transition hover:text-white"
                  onclick={() => openEdit(item)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  class="text-xs text-zinc-600 transition hover:text-red-400"
                  onclick={() => removeItem(item.id)}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </Table>
      {/if}
    </div>

    <Modal open={modalOpen} title={activeItem ? 'Edit item' : 'New item'} onClose={() => (modalOpen = false)}>
      <div class="space-y-4">
        <div class="space-y-1.5">
          <label class="block text-xs font-medium uppercase tracking-widest text-zinc-500">Title</label>
          <input
            type="text"
            bind:value={title}
            class="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-zinc-600"
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-medium uppercase tracking-widest text-zinc-500">Description</label>
          <textarea
            bind:value={description}
            rows={4}
            class="w-full rounded border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-zinc-600"
          />
        </div>

        <div class="flex justify-end gap-4 pt-1">
          <button
            type="button"
            class="text-sm text-zinc-600 transition hover:text-white"
            onclick={() => (modalOpen = false)}
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-100 disabled:opacity-50"
            onclick={saveItem}
            disabled={saving}
          >
            {saving ? 'Saving…' : activeItem ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</ProtectedRoute>
