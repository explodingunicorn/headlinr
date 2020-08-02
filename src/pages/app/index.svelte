<script>
  import Headlines from '../../containers/Headlines.svelte';
  import Trends from '../../containers/Trends.svelte';
</script>

<style>
  .game {
    display: grid;
    grid-template-columns: minmax(0, 20rem) minmax(0, 1fr) minmax(0, 20rem);
    width: 90%;
    margin: 0 auto;
    column-gap: 1rem;
  }

  .game > div {
    margin-top: 3rem;
  }

  .sidebar {
    position: sticky;
    top: 2rem;
  }
</style>

<div class="game">
  <div />
  <div>
    <Headlines />
  </div>
  <div class="sidebar">
    <Trends />
  </div>
</div>
