<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';
  import { auth } from '$lib/context/auth';

  let { requiredRoles = [] as string[] } = $props();

  // Auth (1): client-side guard — redirect unauthenticated or unauthorized users.
  // NOTE: real enforcement is on the server (API routes check signed tokens).
  // This guard only provides UX protection and prevents unnecessary API calls.
  onMount(() => {
    const user = get(auth);
    if (!user) {
      goto('/login');
      return;
    }
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      goto('/login');
    }
  });
</script>

<slot />
