<script lang="ts">
  import Router from 'svelte-spa-router';
  import { routes } from './utilities/routes';
</script>

<style>
  :root {
    --purple-dark: #4f2d87;
    --purple-med: #8d66cc;
    --purple-light: #c6b3e6;
    --blue-dark: #232f43;
    --blue-med: #3e5579;
    --teal: #119da4;
    --orange: #ef7b45;
    --gray-light: #e0e0e0;
    --gray-med: #cccccc;
    --light: #fcfcfc;
    --dark: #0e131b;

    --background: var(--blue-dark);
    --foreground: var(--light);
  }

  :global(html) {
    background-color: var(--background) !important;
    font-size: 16px;
  }

  :global(p, h1, h2, h3, h4, h5, h6) {
    color: var(--foreground) !important;
  }
</style>

<svelte:head>
  <script
    type="text/javascript"
    src="https://cdn.jsdelivr.net/npm/jdenticon@2.2.0">

  </script>
</svelte:head>

<main id="app">
  <Router {routes} />
</main>
