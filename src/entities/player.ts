import * as jdenticon from 'jdenticon';
import sentenceGenerator from './sentenceGenerator';
import { Headline, HeadlineManager } from './headline';
import { TrendTracker } from './trends';

export class Player {
  public firstName = '';
  public lastName = '';
  public bio = 'Nothing here yet';
  public likesTotal = 0;
  public commentsTotal = 0;
  public connections = 0;
  public points = 9999999999;
  private headlineManager: HeadlineManager;
  private trendTracker: TrendTracker;
  public pic = jdenticon.toSvg('blah', 80);

  private pastLikes = 0;
  private pastComments = 0;

  constructor(headlineManager: HeadlineManager, trendTracker: TrendTracker) {
    this.headlineManager = headlineManager;
    this.trendTracker = trendTracker;
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
    if (!this.headlineManager.headlines[index].playerCreated) {
      if (this.headlineManager.headlines[index].isDisliked) {
        this.headlineManager.headlines[index].isDisliked = false;
        this.headlineManager.headlines[index].isLiked = true;
        this.headlineManager.headlines[index].user.influence(10);
        this.headlineManager.headlines[index].like(1);
      } else if (this.headlineManager.headlines[index].isLiked) {
        this.headlineManager.headlines[index].isLiked = true;
      } else {
        this.headlineManager.headlines[index].isLiked = true;
        this.headlineManager.headlines[index].user.influence(10);
        this.headlineManager.headlines[index].like(1);
      }
    }
  };

  public dislike = function (index) {
    if (this.headlineManager.headlines[index].isLiked) {
      this.headlineManager.headlines[index].isLiked = false;
      this.headlineManager.headlines[index].isDisliked = true;
      this.headlineManager.headlines[index].user.influence(-10);
      this.headlineManager.headlines[index].dislike(1);
    } else if (this.headlineManager.headlines[index].isDisliked) {
      this.headlineManager.headlines[index].isDisliked = true;
    } else {
      this.headlineManager.headlines[index].isDisliked = true;
      this.headlineManager.headlines[index].user.influence(-10);
      this.headlineManager.headlines[index].dislike(1);
    }
  };

  public comment(index) {
    var headline = this.headlineManager.headlines[index];

    if (!headline.playerCreated) {
      const commented = this.headlineManager.headlines[index].playerCommented;

      if (!commented) {
        const comment = sentenceGenerator.affirm();
        this.headlineManager.headlines[index].addComment(
          comment,
          'positive',
          null,
          true
        );
        this.headlineManager.headlines[index].alertUser(comment);
      }
    }
  }

  public headline(headline?: string, app?: any) {
    const trends = this.trendTracker.getSortedTrends();
    if (!headline) {
      const trend = trends[Math.floor(Math.random() * trends.length)];
      var feeling = Math.floor(Math.random() * 10);
      var statement = sentenceGenerator.generate(feeling, trend.name);
      this.headlineManager.addHeadline(
        { headline: statement, trend: trend.name, user: null },
        0,
        true
      );
    } else {
      let userTrend = '';
      var key = false;
      for (var i = 0; i < trends.length; i++) {
        const trend = trends[i];
        if (headline.includes(trend.name)) {
          key = true;
          userTrend = trend.name;
          break;
        }
      }
      if (key) {
        this.headlineManager.addHeadline(
          { headline, trend: userTrend, user: null },
          0,
          true
        );
        return true;
      } else {
        app.noTrend = true;
        return false;
      }
    }
  }

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
