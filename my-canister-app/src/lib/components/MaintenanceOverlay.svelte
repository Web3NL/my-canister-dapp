<script lang="ts">
  import { maintenanceMode } from '$lib/stores/maintenance';
  import { onMount } from 'svelte';

  // Handle Shift+M keyboard shortcut
  onMount(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === 'M') {
        event.preventDefault();
        maintenanceMode.update(mode => !mode);
      }
    };

    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

{#if $maintenanceMode}
  <div class="maintenance-overlay">
    <div class="maintenance-content">
      <div class="maintenance-icon">⚠️</div>
      <h1>Offline for Maintenance</h1>
      <p>Please check back shortly.</p>
    </div>
  </div>
{/if}

<style>
  .maintenance-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.95);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);
  }

  .maintenance-content {
    text-align: center;
    color: white;
    max-width: 500px;
    padding: 2rem;
  }

  .maintenance-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .maintenance-content h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #ffd700;
  }

  .maintenance-content p {
    font-size: 1.2rem;
    margin-bottom: 1rem;
    line-height: 1.5;
    opacity: 0.9;
  }
</style>
