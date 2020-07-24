<script lang="ts">
  import * as jdenticon from 'jdenticon';
  import { game } from '../gameStore';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import Headline from '../components/headline.svelte';

  let headlines = [];
  let player;
  let trends = [];
  let trendsCost;
  let totalConnections;

  onMount(() => {
    const startedGame = game.subscribe((incGame) => {
      incGame.onHeadlinesUpdated(({ headlines: updatedHeadlines }) => {
        headlines = updatedHeadlines;
      });
    });
  });
</script>

<div class="column middle">
  <div class="userInput">
    <div class="headline-submission">
      <div class="thumbnail large">
        <svg
          class="portrait"
          data-jdenticon-value={player && player.firstName} />
      </div>
      <input type="text" placeholder="Post a headline" v-model="headline" />
    </div>
    <h5 class="btn backPurple fullWidth" v-on:click="submitHeadline">
      Add Headline
    </h5>
  </div>
  {#each headlines as headline}
    <Headline {headline} />
  {/each}
</div>
