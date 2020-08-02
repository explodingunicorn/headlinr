<script lang="ts">
  import { onMount } from 'svelte';
  import { game } from '../gameStore';
  import Game from '../entities/game';

  let trends = [];
  let placeHolderArr = new Array(10).fill(0);

  const showMore = () => {
    if (placeHolderArr.length < trends.length) {
      if (placeHolderArr.length + 5 < trends.length) {
        placeHolderArr = placeHolderArr.concat(new Array(5).fill(0));
      } else {
        placeHolderArr = placeHolderArr.concat(
          new Array(trends.length - placeHolderArr.length).fill(0)
        );
      }
    }
  };

  const onTrendsChange = (game: Game) => {
    const newTrends = game.trendTracker.getSortedTrends();
    if (newTrends.length < placeHolderArr.length) {
      placeHolderArr = new Array(newTrends.length).fill(0);
    }
    trends = newTrends;
  };

  onMount(() => {
    const startedGame = game.subscribe((game) => {
      game.trendTracker
        .onTrendsListChange(() => {
          onTrendsChange(game);
        })
        .onTrendsChange(() => {
          onTrendsChange(game);
        });
    });
  });
</script>

<style>
  .trends-container {
    background-color: var(--blue-dark-transparent);
    border-radius: 0.25rem;
    margin-bottom: 1rem;
  }

  .trends-section {
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--blue-extra-dark);
  }

  .trends-section::last-child {
    border-bottom: none;
  }

  h2 {
    font-family: 'Montserrat';
  }

  p {
    font-size: 1.125rem;
  }

  span {
    color: var(--purple-light);
  }

  h2,
  p {
    margin: 0;
  }

  button {
    background-color: transparent;
    border: 1px solid var(--light);
    border-radius: 1rem;
    color: var(--foreground);
    font-size: 0.75rem;
    font-family: 'Lato';
    font-weight: 800;
    height: 2rem;
    outline: none;
    padding: 0 1rem;
    text-transform: uppercase;
  }

  .button-container {
    align-items: center;
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  button:hover {
    background-color: var(--blue-med);
  }
</style>

<div>
  <div class="trends-container">
    <div class="trends-section">
      <h2>Trends</h2>
    </div>
    {#each placeHolderArr as place, i}
      {#if trends.length}
        <div class="trends-section">
          <p>
            {i + 1}. &nbsp;
            <span>#{trends[i].name}</span>
          </p>
        </div>
      {/if}
    {/each}
  </div>

  {#if trends.length > placeHolderArr.length}
    <div on:click={showMore} class="button-container">
      <button>show more</button>
    </div>
  {/if}
</div>
