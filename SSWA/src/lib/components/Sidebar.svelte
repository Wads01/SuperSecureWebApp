<script lang="ts">
  import { auth } from '$lib/context/auth';
  import { page } from '$app/stores';

  const links = [
    { href: '/dashboard', label: 'Dashboard', roles: ['user'] },
    { href: '/manager', label: 'Manager workspace', roles: ['manager'] },
    { href: '/admin', label: 'Admin control panel', roles: ['admin'] },
  ];
</script>

<aside class="hidden w-72 shrink-0 space-y-6 rounded-3xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl lg:block">
  <div class="space-y-2">
    <p class="text-xs uppercase tracking-[0.3em] text-sky-400/80">Workspace</p>
    <h2 class="text-2xl font-semibold text-slate-100">Navigation</h2>
    {#if $auth}
      <p class="text-sm text-slate-400">{$auth.name} · {$auth.role}</p>
    {/if}
  </div>

  <nav class="space-y-2">
    {#each links as item}
      {#if $auth && item.roles.includes($auth.role)}
        <a
          href={item.href}
          class="block rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-slate-900 hover:text-slate-100 {($page.url.pathname === item.href) ? 'bg-slate-900 text-slate-100' : 'text-slate-400'}"
        >
          {item.label}
        </a>
      {/if}
    {/each}
  </nav>

  <div class="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-400">
    <p class="font-semibold text-slate-100">Secure roles</p>
    <p>Admin controls, Role A management, Role B workspace.</p>
  </div>
</aside>
