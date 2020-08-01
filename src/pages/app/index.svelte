<script>
  import Headlines from '../../containers/Headlines.svelte';
  import Trends from '../../containers/Trends.svelte';
</script>

<style>
  .game {
    display: grid;
    grid-template-columns: minmax(0, 10rem) minmax(0, 1fr) minmax(0, 10rem);
    width: 80%;
    margin: 0 auto;
  }
</style>

<div class="game">
  <div />
  <div>
    <Headlines />
  </div>
  <div>
    wtf
    <Trends />
  </div>
</div>
