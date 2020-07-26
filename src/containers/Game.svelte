<script>
  import Headlines from './headlines.svelte';
</script>

<style>
  .game {
    display: grid;
    grid-template-columns: minmax(0, 20rem) minmax(0, 1fr) minmax(0, 10rem);
    padding: 0 4rem;
  }
</style>

<div class="game">
  <div />
  <div>
    <Headlines />
  </div>
  <div />
</div>
