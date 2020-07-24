import * as jdenticon from 'jdenticon';

import fFirstNames from '../data/femalenames';
import mFirstNames from '../data/malenames';
import lastNames from '../data/lastnames';

//Other classes needed
import { Headline, HeadlineManager } from './headline';
import sentence from './sentenceGenerator';

//Utilities
import {
  rand10,
  headlineChance,
  interactChance,
  commentChance,
} from '../utilities';
import Game from './game';

export interface User {
  name: {
    first: string;
    last: string;
  };
  pic: string;
}

//Basic class for user, a user represents multiple connections
export class UserGroup {
  //Age, sex, name
  private sex = Math.floor(Math.random() * 10);
  public users: User[] = [this.generateUser(), this.generateUser()];
  private game: Game;
  private group;
  public playerOpinion = rand10() * 5;
  private headlineManager: HeadlineManager;
  private activityLevel = 800 + Math.floor(Math.random() * 300 + 1);
  private scaleReacts = 1;
  private aggression = rand10();
  private trendFeelings;

  constructor(game: Game, group: number, headlineManager: HeadlineManager) {
    this.game = game;
    this.group = group;
    this.headlineManager = headlineManager;
    this.trendFeelings = this.generateTopicFeelings();
  }

  private generateUser() {
    var randFirstF = Math.floor(Math.random() * fFirstNames.length + 1);
    var randFirstM = Math.floor(Math.random() * mFirstNames.length + 1);
    var randLast = Math.floor(Math.random() * lastNames.length + 1);
    const user = { name: { first: '', last: '' }, pic: '' } as User;
    if (this.sex > 4) {
      user.name.first = mFirstNames[randFirstM];
      user.pic = jdenticon.toSvg(user.name.first, 80);
    } else {
      user.name.first = fFirstNames[randFirstF];
      user.pic = jdenticon.toSvg(user.name.first, 80);
    }
    user.name.last = lastNames[randLast];

    return user;
  }

  private generateTopicFeelings() {
    const trends = {};
    for (let i = 0; i < this.game.trends.length; i++) {
      trends[this.game.trends[i]] = rand10();
    }
    return trends;
  }

  public generateNewFeelings() {
    this.trendFeelings = this.generateTopicFeelings();
  }

  public generateMoreNames(num: number) {
    if (num < 1000) {
      for (let i = 0; i < num; i++) {
        this.users.push(this.generateUser());
      }
    }
  }

  public generateNewActivityLevel() {
    if (this.users.length > 100) {
      if (this.activityLevel < 100) {
        this.scaleReacts += 8;
      } else {
        this.activityLevel = this.activityLevel - 150;
      }
    } else {
      this.activityLevel = this.activityLevel - this.users.length * 5;
      this.scaleReacts += 1;
    }
  }

  //Function exposed to game, determines when the user is checking the timeline
  public checkUpdate(time: number) {
    //Select random name from our pool
    const user = this.users[Math.floor(Math.random() * this.users.length)];
    //Checking users activity level, and seeing if it's time for them to comment
    if (time % this.activityLevel === 0) {
      //Running function to check headlinr, passing game, and itself
      this.checkHeadlinr(this.game, this, user);
    }
  }

  public influence(val: number) {
    if (this.playerOpinion < 100 && this.playerOpinion > 0) {
      this.playerOpinion += val;
    }
  }

  //Function that runs everything involved in a users turn
  private checkHeadlinr(game: Game, userGroup: UserGroup, user: User) {
    //Function to read headlines
    this.checkHeadlines(this.headlineManager.getQueue(this.group), user);
    //Function to create a headline
    this.createHeadline(game, userGroup, user);
  }

  //Function for user to check new posts
  private checkHeadlines(headlines: Headline[], user: User) {
    var postsToCheck = 0;
    //Checks the last 10 headlines
    postsToCheck = headlines.length;

    for (var i = 0; i < postsToCheck; i++) {
      //Read the headline, and determine the reaction to the headline
      const headline = this.headlineManager.getQueueHeadline(i, this.group);
      var trend = headline.trend;
      var userFeeling = this.trendFeelings[trend];
      var sentiment = headline.sentimentScore;
      var playerFactor = 0;
      var repeatFactor = 0;
      var player = false;
      var scale = 1;

      if (headline.playerCreated) {
        playerFactor = this.playerOpinion / 10;
        player = true;
        scale = this.scaleReacts;
        if (this.headlineManager.playerHeadlines.length > 1) {
          for (
            var j = this.headlineManager.playerHeadlines.length - 2;
            j >= 0;
            j--
          ) {
            if (this.headlineManager.playerHeadlines[j].trend === trend) {
              repeatFactor += 4;
            }
          }
        }
      }
      //Check if sentiment is positive
      if (sentiment > 0 && userFeeling > 5) {
        if (player) {
          this.playerOpinion += rand10();
        }
        //If the user feels positively towards the trend, there's a chance to like
        var total = userFeeling + sentiment + playerFactor - repeatFactor;
        if (total >= interactChance()) {
          headline.like(scale);
        }

        if (total + this.aggression >= commentChance()) {
          headline.addComment(sentence.affirm(), this, user);
        }
      }
      //If the user feels negatively towards the trend, there's a chance to dislike
      else if (sentiment > 0 && userFeeling <= 5) {
        if (player) {
          this.playerOpinion -= rand10();
        }
        //Add 5 to users feeling to simulate negative feeling
        var total = userFeeling + 5 + sentiment - playerFactor - repeatFactor;

        if (total >= interactChance()) {
          headline.dislike(scale);
        }

        if (total + this.aggression >= commentChance()) {
          headline.addComment(sentence.deny(), this, user);
        }
      }
      //If it's negative
      else if (sentiment <= 0 && userFeeling > 5) {
        if (player) {
          this.playerOpinion -= rand10();
        }
        //If the user feels positively, there's a chance to dislike
        //Create a total, reverse the sentiment
        var total =
          userFeeling + 5 + -1 * sentiment - playerFactor - repeatFactor;

        //React if it's greater than the interaction chance, and they haven't interacted before
        if (total >= interactChance()) {
          headline.dislike(scale);
        }

        if (total + this.aggression >= commentChance()) {
          headline.addComment(sentence.deny(), this, user);
        }
      }
      //If the user feels negatively also, there's a chance to like
      else {
        if (player) {
          this.playerOpinion += rand10();
        }
        //Add 5 to users feeling to simulate negative feeling, reverse sentiment
        var total =
          userFeeling + 5 + -1 * sentiment + playerFactor - repeatFactor;

        if (total >= interactChance()) {
          headline.like(scale);
        }

        if (total + this.aggression >= commentChance()) {
          headline.addComment(sentence.affirm(), this, user);
        }
      }
    }
  }

  //Function for user to push a new headline
  private createHeadline(game: Game, userGroup: UserGroup, user: User) {
    if (this.aggression >= headlineChance()) {
      var trend = game.trends[Math.floor(Math.random() * game.trends.length)];
      var feeling = this.trendFeelings[trend];
      var statement = sentence.generate(feeling, trend);

      //Creating a new headline
      var headline = new Headline(statement, userGroup, user, trend);
      this.headlineManager.addHeadline(headline, this.group);
    }
  }
}
