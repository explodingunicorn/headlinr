<script lang="ts">
  import { onMount } from 'svelte';
  import { game } from '../gameStore';
  // import { Trend } from '../entities/trends';

  let trends: any[] = [];
  onMount(() => {
    const startedGame = game.subscribe((game) => {
      game.trendTracker.onTrendsListChange((newTrends) => {
        console.log(newTrends);
        trends = Object.keys(newTrends).map((key) => {
          return newTrends[key];
        });
      });
    });
  });
</script>

<div>
  {#each trends as trend}
    <p>{trend.name}</p>
  {/each}
</div>
