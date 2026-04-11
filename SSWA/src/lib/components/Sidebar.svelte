<script lang="ts">
  import { auth } from '$lib/context/auth';
  import { page } from '$app/stores';

  const links = [
    { href: '/dashboard', label: 'Dashboard', roles: ['user'] },
    { href: '/manager', label: 'Manager workspace', roles: ['manager'] },
    { href: '/admin', label: 'Admin control panel', roles: ['admin'] },
  ];
</script>

<aside class="hidden w-52 shrink-0 flex-col border-r border-zinc-900 bg-black py-6 lg:flex lg:gap-5">
  <div class="px-4">
    <p class="text-xs font-medium uppercase tracking-widest text-zinc-600">Navigation</p>
    {#if $auth}
      <p class="mt-1 truncate text-sm text-zinc-400">{$auth.name}</p>
    {/if}
  </div>

  <nav class="flex flex-col gap-0.5 px-2">
    {#each links as item}
      {#if $auth && item.roles.includes($auth.role)}
        <a
          href={item.href}
          class="rounded px-3 py-2 text-sm transition {($page.url.pathname === item.href) ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:text-white'}"
        >
          {item.label}
        </a>
      {/if}
    {/each}
  </nav>
</aside>
