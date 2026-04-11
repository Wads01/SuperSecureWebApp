<script>
  import { page } from '$app/stores';
</script>

<div class="flex min-h-screen items-center justify-center bg-black px-4">
  <div class="text-center">
    <p class="text-xs font-medium uppercase tracking-widest text-zinc-600">Error</p>
    <h1 class="mt-3 text-xl font-medium text-white">Something went wrong</h1>
    <p class="mt-2 text-sm text-zinc-500">{$page.error?.message ?? 'An unexpected error occurred.'}</p>
    <a
      href="/login"
      class="mt-6 inline-block rounded border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white"
    >
      Return to login
    </a>
  </div>
</div>
