<script lang="ts">
  import './layout.css';
  import { onMount } from 'svelte';
  import { loadAuthFromStorage } from '$lib/context/auth';
  import favicon from '$lib/assets/favicon.svg';

  onMount(() => {
    loadAuthFromStorage();
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<slot />
