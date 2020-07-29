<script lang="ts">
  export let size: 's' | 'm' | 'l' | 'xl' = 's';
</script>

<style>
  div {
    background-color: var(--blue-light);
    border-radius: 0.25rem;
    padding: 0.125rem;
  }

  div.small {
    height: 1.5rem;
    width: 1.5rem;
  }

  div.medium {
    height: 2rem;
    width: 2rem;
  }

  div.large {
    height: 2.5rem;
    width: 2.5rem;
  }

  div.extra-large {
    height: 3rem;
    width: 3rem;
  }

  :global(svg) {
    height: 100%;
    width: 100%;
  }
</style>

<div
  class="article"
  class:small={size === 's'}
  class:medium={size === 'm'}
  class:large={size === 'l'}
  class:extra-large={size === 'xl'}>
  <slot>
    <svg />
  </slot>
</div>
