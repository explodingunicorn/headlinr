<script lang="ts">
  import { Headline } from '../entities/headline';
  export let headline: Headline;
</script>

<div class="post">
  <div class="head">
    <div class="info">
      <div class="thumbnail">
        {@html headline.user.pic}
      </div>
      <div class="name">
        <h3 class="title">
          {headline.user.name.first} {headline.user.name.last}
        </h3>
      </div>
      <div class="score">
        <h1
          class:darkPurple={headline.score >= 0}
          class:mediumPurple={headline.score < 0}>
          {headline.score}
        </h1>
      </div>
    </div>
    <div class="content">
      <h1>{headline.headline}</h1>
    </div>
    <div class="buttons">
      <button
        class="like"
        class:liked={headline.playerLiked}
        v-on:click="likePost(i)">
        <i class="fa fa-thumbs-up" aria-hidden="true" />
        Like
      </button>
      <button
        class="dislike"
        class:disliked={headline.playerDisliked}
        v-on:click="dislikePost(i)">
        <i class="fa fa-thumbs-down" aria-hidden="true" />
        Dislike
      </button>
    </div>
  </div>
  <div class="moreComments" v-if="headline.comments.length === 10">
    <div>{headline.commentsAmt} total comments</div>
  </div>
  <div class="commentSection">
    {#each headline.comments as comment}
      <div class="comment" v-for="comment in headline.comments">
        <div class="thumbnail">
          <img
            class="portrait"
            v-bind:src="resolvePic(comment.commentName.pic)"
            alt="Profile pic" />
        </div>
        <div class="content">
          <h4>{comment.user.name.first} {comment.user.name.last}</h4>
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
      v-model="headline.commentValue" />
  </div>
  <div class="submitComment" v-on:click="addComment(i)">
    <h5>Submit Comment</h5>
  </div>
</div>
