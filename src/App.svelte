<script>
  import { Router } from '@sveltech/routify';
  import { routes } from '@sveltech/routify/tmp/routes';
</script>

<style>
  :root {
    --purple-dark: #4f2d87;
    --purple-med: #6a66a3;
    --purple-light: #c6b3e6;

    --blue-extra-dark: #232f43;
    --blue-dark-transparent: rgba(48, 64, 95, 0.4);
    --blue-dark: #30405f;
    --blue-med: #3e5579;
    --blue-light: #5270a3;

    --teal: #119da4;
    --orange: #ef7b45;

    --gray-light: #e0e0e0;
    --gray-med: #cccccc;

    --light: #fcfcfc;
    --dark: #0e131b;

    --background: var(--blue-extra-dark);
    --foreground: var(--light);
  }

  :global(html) {
    background-color: var(--background) !important;
    font-size: 16px;
  }

  :global(p, h1, h2, h3, h4, h5, h6) {
    color: var(--foreground) !important;
  }

  :global(p) {
    font-family: 'Lato', sans-serif;
    font-size: 1rem;
  }

  :global(h1) {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
  }

  :global(*) {
    box-sizing: border-box;
  }
</style>

<link
  href="https://fonts.googleapis.com/css?family=Lato:300,400,700|Montserrat:500,700,800"
  rel="stylesheet" />

<Router {routes} />
