<script lang="ts">
  import * as jdenticon from 'jdenticon';
  import { game } from '../gameStore';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import Headline from '../components/headline.svelte';
  import { Player } from '../entities/player';
  import Avatar from '../components/Avatar.svelte';

  let headlines = [];
  let player: Player;
  let trends = [];
  let trendsCost;
  let totalConnections;

  onMount(() => {
    const startedGame = game.subscribe((incGame) => {
      incGame.onHeadlinesUpdated(({ headlines: updatedHeadlines }) => {
        headlines = updatedHeadlines;
      });
      player = incGame.player;
    });
  });
</script>

<style>
  .user-headline {
    border-radius: 0.25rem;
    display: flex;
    flex-direction: row;
    background-color: var(--blue-dark);
    padding: 1rem;
    margin-bottom: 2rem;
    max-width: 100%;
  }

  .user-headline div {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: 1rem;
    flex: 1;
  }

  .user-headline input {
    background-color: transparent;
    border: transparent;
    color: #e5e5e5;
    flex: 1;
    font-family: 'Montserrat';
    font-size: 1.5rem;
    height: 3rem;
    margin: 0;
    min-width: 0;
    width: 0;
    padding: 0;
  }

  .user-headline input:focus {
    border: none;
    outline: none;
  }

  .user-headline button {
    background-color: var(--teal);
    border: none;
    display: block;
    height: 2rem;
    border-radius: 1rem;
    color: var(--light);
    font-family: 'Lato';
    font-weight: 800;
    margin: 0;
    padding: 0 1rem;
  }
</style>

<div>
  <div class="user-headline">
    <Avatar size="xl">
      {@html player && player.pic}
    </Avatar>
    <div>
      <input type="text" placeholder="Post a headline" v-model="headline" />
      <button>Post</button>
    </div>
  </div>
  {#each headlines as headline}
    <Headline {headline} {player} />
  {/each}
</div>
