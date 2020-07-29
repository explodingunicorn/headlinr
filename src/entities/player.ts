import * as jdenticon from 'jdenticon';
import sentenceGenerator from './sentenceGenerator';
import { Headline } from './headline';
import Game from './game';

export class Player {
  public firstName = '';
  public lastName = '';
  public bio = 'Nothing here yet';
  public likesTotal = 0;
  public commentsTotal = 0;
  public connections = 0;
  public points = 9999999999;
  public game: Game;
  public pic = jdenticon.toSvg('blah', 80);

  private pastLikes = 0;
  private pastComments = 0;

  constructor(game: Game) {
    this.game = game;
  }

  public changeInfo = function (first: string, last: string, pic: string) {
    this.firstName = first;
    this.lastName = last;

    if (pic) {
      this.pic = pic;
    }
  };

  public changeScore = function (likes: number) {
    this.likesTotal += likes;
  };

  public addComments = function () {
    this.commentsTotal++;
  };

  public like = function (index) {
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

  public dislike = function (index) {
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

  public comment = function (index) {
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

  public headline = function (headline?: string, app?: any) {
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

  public calculateCurrentPoints = function () {
    if (this.pastLikes !== this.likesTotal && this.likesTotal >= 0) {
      var dif = this.likesTotal - this.pastLikes;
      var pointsToAdd = 1000 * dif;
      this.points += pointsToAdd;
      this.pastLikes = this.likesTotal;
    }

    if (this.pastComments !== this.commentsTotal) {
      var dif = this.commentsTotal - this.pastComments;
      var pointsToAdd = 1500 * dif;
      this.points += pointsToAdd;
      this.pastComments = this.commentsTotal;
    }
  };
}
