<script lang="ts">
  import { Headline } from '../entities/headline';
  import Avatar from './Avatar.svelte';
  import InteractionButton from './InteractionButton.svelte';
  import { Player } from '../entities/player';
  export let headline: Headline;
  export let player: Player;
</script>

<style>
  article {
    padding: 1rem;
    background-color: var(--blue-dark);
    box-shadow: 0 0 0 0 transparent;
    border-radius: 0.25rem;
    border-bottom: none;
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    transition: all 0.5s;
  }

  article:hover {
    box-shadow: 0 0 0 1px var(--blue-light);
  }

  .head {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .info {
    align-items: center;
    display: flex;
    flex-direction: row;
  }

  .info .name {
    flex: 1;
  }

  .info .name p {
    margin: 0;
    margin-left: 1rem;
    padding: 0;
  }

  :global(.thumbnail svg) {
    width: 100%;
    height: 100%;
  }

  .score {
    align-items: center;
    border-radius: 1rem;
    display: flex;
    justify-content: center;
    min-width: 3rem;
    padding: 0.5rem;
    height: 2rem;
  }

  .score.positive {
    background-color: var(--purple-med);
  }

  .score.negative {
    background-color: var(--orange);
  }

  .score p {
    padding: 0;
    margin: 0;
    font-size: 1.125rem;
  }

  .content h1 {
    margin-bottom: 0.5rem;
  }

  .comment {
    align-items: center;
    border-top: 1px solid var(--blue-med);
    display: flex;
    margin-bottom: 0.5rem;
    padding-top: 0.5rem;
  }

  .comment .content {
    margin-left: 0.5rem;
  }

  .comment .name {
    font-size: 0.875rem;
    font-weight: 900;
    margin-top: 0;
    margin-bottom: 0.125rem;
    padding: 0;
  }

  .comment .text {
    font-size: 1rem;
    margin: 0;
    padding: 0;
  }

  .player-comment {
    display: flex;
    flex-direction: row;
    border-top: 1px solid var(--blue-med);
    padding-top: 0.5rem;
  }

  .player-comment .input-container {
    align-items: center;
    background-color: var(--blue-med);
    border-radius: 1rem;
    display: flex;
    flex-direction: row;
    flex: 1;
    margin-left: 0.5rem;
    padding: 1rem;
    height: 2rem;
  }

  .input-container input {
    font-size: 1.125rem;
    background: transparent;
    border: none;
    color: #e5e5e5;
    flex: 1;
    padding: 0;
    margin: 0;
    min-width: 0;
    width: 0;
  }

  .input-container input:focus {
    outline: none;
  }

  .input-container button {
    background-color: transparent;
    border: none;
    color: var(--foreground);
    font-family: 'Montserrat';
    font-size: 0.75rem;
    height: 1.5rem;
    margin: 0;
    padding: 0;
    text-transform: uppercase;
  }
</style>

<article class="headline">
  <div class="head">
    <div class="info">
      <Avatar size="l">
        {@html headline.user.pic}
      </Avatar>
      <div class="name">
        <p>{headline.user.name.first} {headline.user.name.last}</p>
      </div>
      <div
        class="score"
        class:positive={headline.score >= 0}
        class:negative={headline.score < 0}>
        <p>{headline.score}</p>
      </div>
    </div>
    <div class="content">
      <h1>{headline.headline}</h1>
    </div>
    <div class="buttons">
      <InteractionButton type="like" />
      <InteractionButton type="dislike" />
    </div>
  </div>
  <div class="commentSection">
    {#each headline.comments as comment}
      <div class="comment">
        <Avatar size="m">
          {@html comment.user.pic}
        </Avatar>
        <div class="content">
          <p class="name">{comment.user.name.first} {comment.user.name.last}</p>
          <p class="text">{comment.comment}</p>
        </div>
      </div>
    {/each}
  </div>
  <div class="player-comment">
    <Avatar size="m">
      {@html player.pic}
    </Avatar>
    <div class="input-container">
      <input
        type="text"
        placeholder="Comment..."
        v-on:click="pause = true"
        v-model="headline.commentValue" />
      <button class="post-comment">Comment</button>
    </div>
  </div>
</article>
