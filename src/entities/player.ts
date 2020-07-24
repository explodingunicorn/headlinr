import * as jdenticon from 'jdenticon';
import sentenceGenerator from './sentenceGenerator';
import { Headline } from './headline';

export const Player = function (game) {
  this.firstName = '';
  this.lastName = '';
  this.pic = {
    type: 'player',
    link: '',
  };
  this.bio = 'Nothing here yet';
  this.likesTotal = 0;
  this.commentsTotal = 0;
  this.connections = 0;
  this.points = 9999999999;
  this.game = game;
  this.pic = jdenticon.toSvg('blah', 80);

  var pastLikes = 0;
  var pastComments = 0;

  this.changeInfo = function (first, last, pic) {
    this.firstName = first;
    this.lastName = last;

    if (pic) {
      this.pic = pic;
    }
  };

  this.changeScore = function (likes) {
    this.likesTotal += likes;
  };

  this.addComments = function () {
    this.commentsTotal++;
  };

  this.like = function (index) {
    if (!this.game.headlines[index].playerCreated) {
      if (this.game.headlines[index].isDisliked) {
        this.game.headlines[index].isDisliked = false;
        this.game.headlines[index].isLiked = true;
        this.game.headlines[index].user.influence(10);
        this.game.headlines[index].like(1);
      } else if (this.game.headlines[index].isLiked) {
        this.game.headlines[index].isLiked = true;
      } else {
        this.game.headlines[index].isLiked = true;
        this.game.headlines[index].user.influence(10);
        this.game.headlines[index].like(1);
      }
    }
  };

  this.dislike = function (index) {
    if (this.game.headlines[index].isLiked) {
      this.game.headlines[index].isLiked = false;
      this.game.headlines[index].isDisliked = true;
      this.game.headlines[index].user.influence(-10);
      this.game.headlines[index].dislike(1);
    } else if (this.game.headlines[index].isDisliked) {
      this.game.headlines[index].isDisliked = true;
    } else {
      this.game.headlines[index].isDisliked = true;
      this.game.headlines[index].user.influence(-10);
      this.game.headlines[index].dislike(1);
    }
  };

  this.comment = function (index) {
    var headline = this.game.headlines[index];

    if (!headline.playerCreated) {
      var comment = this.game.headlines[index].commentValue;

      if (!comment) {
        comment = sentenceGenerator.affirm();
      }

      this.game.headlines[index].addComment(comment, this, {
        first: this.firstName,
        last: this.lastName,
        pic: this.pic,
      });
      this.game.headlines[index].alertUser(comment);
      this.game.headlines[index].commentValue = '';
    }
  };

  this.headline = function (headline, app) {
    if (!headline) {
      var topic = this.game.trends[
        Math.floor(Math.random() * this.game.trends.length)
      ];
      var feeling = Math.floor(Math.random() * 10);
      var statement = sentenceGenerator.generate(feeling, topic);
      var newHeadline = new Headline(
        statement,
        null,
        { name: { first: this.firstName, last: this.lastName }, pic: this.pic },
        topic,
        true
      );
      this.game.pushHeadline(newHeadline, 'all', true);
    } else {
      var userTopic = '';
      var key = false;
      for (var i = 0; i < this.game.trends.length; i++) {
        var topic = this.game.trends[i];
        if (headline.includes(topic)) {
          key = true;
          userTopic = topic;
          break;
        }
      }
      if (key) {
        var newHeadline = new Headline(
          headline,
          null,
          {
            name: {
              first: this.firstName,
              last: this.lastName,
            },
            pic: this.pic,
          },
          userTopic,
          true
        );
        this.game.pushHeadline(headline, 'all', true);
        return true;
      } else {
        app.noTrend = true;
        return false;
      }
    }
  };

  this.calculateCurrentPoints = function () {
    if (pastLikes !== this.likesTotal && this.likesTotal >= 0) {
      var dif = this.likesTotal - pastLikes;
      var pointsToAdd = 1000 * dif;
      this.points += pointsToAdd;
      pastLikes = this.likesTotal;
    }

    if (pastComments !== this.commentsTotal) {
      var dif = this.commentsTotal - pastComments;
      var pointsToAdd = 1500 * dif;
      this.points += pointsToAdd;
      pastComments = this.commentsTotal;
    }
  };
};
