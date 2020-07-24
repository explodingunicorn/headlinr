<script lang="ts">
  import * as jdenticon from 'jdenticon';
  import { game } from './gameStore';
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  export let name: string;

  let headlines = [];
  let player;
  let trends = [];
  let trendsCost;
  let totalConnections;

  onMount(() => {
    console.log('mounting');
    const startedGame = game.subscribe((incGame) => {
      incGame.onHeadlinesUpdated(({ headlines: updatedHeadlines }) => {
        headlines = updatedHeadlines;
      });
      player = incGame.player;
      trends = incGame.trends;
      trendsCost = incGame.trendsCost;
      totalConnections = incGame.totalConnections;
    });
  });
</script>

<style type="text/scss">
  @import './stylesheets/main.scss';
</style>

<svelte:head>
  <script
    type="text/javascript"
    src="https://cdn.jsdelivr.net/npm/jdenticon@2.2.0">

  </script>
</svelte:head>

<div id="app">
  <div class="headlinr">
    <div class="pause-play">
      <h2 v-if="pause" class="btn backLightPurple" v-on:click="pause=false">
        <i class="fa fa-play-circle" aria-hidden="true" />
        Resume Game
      </h2>
      <h2 v-else class="btn backMedPurple" v-on:click="pause=true">
        <i class="fa fa-pause-circle" aria-hidden="true" />
        Pause Game
      </h2>
    </div>
    <div class="headlinr-nav raised">
      <h1 class="logo" v-on:click="moveState('game')">headlinr</h1>
      <div class="spacer" />
      <div class="user-info" v-on:click="moveState('stats')">
        <div class="thumbnail">
          <img
            class="portrait"
            v-bind:src="resolvePic(player.pic)"
            alt="profile pic" />
        </div>
        <p class="white">
          {player && player.firstName} {player && player.lastName}
        </p>
      </div>
      <p class="dashboard-link medPurple" v-on:click="moveState('game')">
        <i class="fa fa-home" aria-hidden="true" />
        Home
      </p>
      <p class="dashboard-link blue" v-on:click="moveState('dashboard')">
        <i class="fa fa-tachometer" aria-hidden="true" />
        Dashboard
      </p>
    </div>
    <div class="game">
      <div class="column left">
        <div class="panel raised">
          <h2>Totals:</h2>
          <h1 class="darkPurple">
            {player && player.likesTotal}
            <p>Likes</p>
          </h1>
          <h1 class="mediumPurple">
            {player && player.commentsTotal}
            <p>Comments</p>
          </h1>
          <h1>
            {totalConnections}
            <p>Connections</p>
          </h1>
          <hr />
          <h2>Fame Points:</h2>
          <h1>{player && player.points}</h1>
          <h5 class="btn backYellow fullWidth" v-on:click="upgrades = true">
            Spend Points!
          </h5>
        </div>
      </div>
      <div class="column middle">
        <div class="userInput">
          <div class="headline-submission">
            <div class="thumbnail large">
              <svg
                class="portrait"
                data-jdenticon-value={player && player.firstName} />
            </div>
            <input
              type="text"
              placeholder="Post a headline"
              v-model="headline" />
          </div>
          <h5 class="btn backPurple fullWidth" v-on:click="submitHeadline">
            Add Headline
          </h5>
        </div>
        {#each headlines as item}
          <div class="post">
            <div class="head">
              <div class="info">
                <div class="thumbnail">
                  {@html jdenticon.toSvg(item.postName.first, 80)}
                </div>
                <div class="name">
                  <h3 class="title">
                    {item.postName.first} {item.postName.last}
                  </h3>
                </div>
                <div class="score">
                  <h1
                    class:darkPurple={item.score >= 0}
                    class:mediumPurple={item.score < 0}>
                    {item.score}
                  </h1>
                </div>
              </div>
              <div class="content">
                <h1>{item.headline}</h1>
              </div>
              <div class="buttons">
                <button
                  class="like"
                  class:liked={item.isLiked}
                  v-on:click="likePost(i)">
                  <i class="fa fa-thumbs-up" aria-hidden="true" />
                  Like
                </button>
                <button
                  class="dislike"
                  class:disliked={item.isDisliked}
                  v-on:click="dislikePost(i)">
                  <i class="fa fa-thumbs-down" aria-hidden="true" />
                  Dislike
                </button>
              </div>
            </div>
            <div class="moreComments" v-if="item.comments.length === 10">
              <div>{item.commentsAmt} total comments</div>
            </div>
            <div class="commentSection">
              {#each item.comments as comment}
                <div class="comment" v-for="comment in item.comments">
                  <div class="thumbnail">
                    <img
                      class="portrait"
                      v-bind:src="resolvePic(comment.commentName.pic)"
                      alt="Profile pic" />
                  </div>
                  <div class="content">
                    <h4>
                      {comment.commentName.first} {comment.commentName.last}
                    </h4>
                    <h3>{comment.comment}</h3>
                  </div>
                </div>
              {/each}
            </div>
            <div class="userComment">
              <div class="thumbnail">
                <img
                  class="portrait"
                  v-bind:src="resolvePic(player.pic)"
                  alt="Profile pic" />
              </div>
              <input
                type="text"
                placeholder="Comment..."
                v-on:click="pause = true"
                v-model="item.commentValue" />
            </div>
            <div class="submitComment" v-on:click="addComment(i)">
              <h5>Submit Comment</h5>
            </div>
          </div>
        {/each}
      </div>
      <div class="column right">
        <div v-if="wordLimit" class="error-popup blue raised">
          <h2>You can only have 10 words in your headline!</h2>
          <button>Close</button>
        </div>
        <div v-if="noTrend" class="error-popup yellow raised">
          <h2>There is no trend in your headline! (Pick from the right)</h2>
          <button v-on:click="noTrend=false">Close</button>
        </div>
        <div class="trends-panel">
          <h2>Trending Now:</h2>
          {#each trends as item}
            <h6>{item}</h6>
          {/each}
          <h3 class="mgn-top-10 mgn-btm-10">Change the trends:</h3>
          <h2 class="btn backGreen fullWidth" v-on:click="changeTrends">
            {trendsCost} Points
          </h2>
        </div>
      </div>
    </div>
  </div>
</div>
