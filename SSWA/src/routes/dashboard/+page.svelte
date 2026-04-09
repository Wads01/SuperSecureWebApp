<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/context/auth';
  import Navbar from '$lib/components/Navbar.svelte';
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import Table from '$lib/components/Table.svelte';
  import { createItem, deleteItem, fetchItems, updateItem, type ItemPayload } from '$lib/services/api';

  let items: ItemPayload[] = [];
  let loading = true;
  let error = '';
  let modalOpen = false;
  let saving = false;
  let activeItem: ItemPayload | null = null;
  let title = '';
  let description = '';

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

  onMount(loadItems);
</script>

<ProtectedRoute requiredRoles={['user']}>
  <div class="min-h-screen bg-slate-950 px-4 py-10">
    <div class="mx-auto flex max-w-[1200px] flex-col gap-8">
      <Navbar />

      <div class="rounded-[2rem] border border-slate-800 bg-slate-950/95 p-8 shadow-2xl">
        <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-sm uppercase tracking-[0.3em] text-sky-400/80">Role B Dashboard</p>
            <h1 class="mt-3 text-3xl font-semibold text-slate-100">Your secure workspace</h1>
            <p class="max-w-2xl text-slate-400">Manage your own items and explore a clean dashboard designed for secure user data.</p>
          </div>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
            onclick={openCreate}
          >
            Add item
          </button>
        </div>

        {#if error}
          <div class="mb-6 rounded-3xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>
        {/if}

        {#if loading}
          <div class="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center text-slate-400">Loading items…</div>
        {:else}
          {#if items.length === 0}
            <div class="rounded-3xl border border-slate-800 bg-slate-900/80 p-10 text-center text-slate-400">
              No items yet. Create your first record to get started.
            </div>
          {:else}
            <div class="space-y-6">
              <Table columns={['Title', 'Description', 'Owner', 'Created', 'Actions']} items={items}>
                <tr slot="rows" let:item class="hover:bg-slate-900/80">
                  <td class="px-4 py-4 text-slate-100">{item.title}</td>
                  <td class="px-4 py-4 text-slate-400">{item.description}</td>
                  <td class="px-4 py-4 text-slate-300">{item.ownerName}</td>
                  <td class="px-4 py-4 text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td class="px-4 py-4">
                    <div class="flex flex-wrap gap-2">
                      <button
                        type="button"
                        class="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-sky-500"
                        onclick={() => openEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        class="rounded-2xl border border-rose-600 bg-rose-600/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-600/20"
                        onclick={() => removeItem(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </Table>
            </div>
          {/if}
        {/if}
      </div>
    </div>

    <Modal open={modalOpen} title={activeItem ? 'Edit item' : 'New item'} onClose={() => (modalOpen = false)}>
      <div class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-slate-300">Title</label>
          <input
            type="text"
            bind:value={title}
            class="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300">Description</label>
          <textarea
            bind:value={description}
            rows={5}
            class="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            class="rounded-3xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
            onclick={() => (modalOpen = false)}
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-3xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            onclick={saveItem}
            disabled={saving}
          >
            {saving ? 'Saving…' : activeItem ? 'Save changes' : 'Create item'}
          </button>
        </div>
      </div>
    </Modal>
  </div>
</ProtectedRoute>
