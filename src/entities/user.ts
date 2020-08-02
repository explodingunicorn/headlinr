import * as jdenticon from 'jdenticon';
import shortid from 'shortid';

import fFirstNames from '../data/femalenames';
import mFirstNames from '../data/malenames';
import lastNames from '../data/lastnames';

//Other classes needed
import { Headline, HeadlineManager } from './headline';
import { TrendTracker } from './trends';

//Utilities
import sentence from './sentenceGenerator';
import {
  rand10,
  headlineChance,
  interactChance,
  commentChance,
} from '../utilities';

export interface User {
  id: string;
  name: {
    first: string;
    last: string;
  };
  pic: string;
  trendVariation: number;
  playerOpinion: number;
}

//Basic class for user, a user represents multiple connections
export class UserGroup {
  //Age, sex, name
  private sex = Math.floor(Math.random() * 10);
  public users: { [key: string]: User } = (() => {
    const user1 = this.generateUser();
    const user2 = this.generateUser();
    return {
      [user1.id]: user1,
      [user2.id]: user2,
    };
  })();
  private trendTracker: TrendTracker;
  private group;
  public playerOpinion = rand10() * 5;
  private headlineManager: HeadlineManager;
  private activityLevel = 800 + Math.floor(Math.random() * 300 + 1);
  private scaleReacts = 1;
  private aggression = rand10();
  private trendFeelings: { [key: string]: number } = {};

  constructor(
    group: number,
    headlineManager: HeadlineManager,
    trendTracker: TrendTracker
  ) {
    this.trendTracker = trendTracker;
    trendTracker
      .onTrendAdded((trend) => {
        if (!this.trendFeelings[trend]) this.trendFeelings[trend] = rand10();
      })
      .onTrendRemoved((trend) => {
        delete this.trendFeelings[trend];
      });
    this.group = group;
    this.headlineManager = headlineManager;
  }

  get amountOfUsers() {
    return Object.keys(this.users).length;
  }

  private generateUser() {
    var randFirstF = Math.floor(Math.random() * fFirstNames.length + 1);
    var randFirstM = Math.floor(Math.random() * mFirstNames.length + 1);
    var randLast = Math.floor(Math.random() * lastNames.length + 1);
    const user: User = {
      id: shortid.generate(),
      name: { first: '', last: '' },
      pic: '',
      playerOpinion: 0,
      // Get a number between -2 and 2
      trendVariation: (rand10() / 100) * 2 * (rand10() > 5 ? 1 : -1),
    };
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

  public initTrendFeelings() {
    const randTrends = this.trendTracker.getRandomTrends();
    randTrends.forEach((trend) => {
      this.trendFeelings[trend] = rand10();
      this.trendTracker.addTrend(trend);
    });
  }

  public generateMoreNames(num: number) {
    if (num < 1000) {
      for (let i = 0; i < num; i++) {
        const user = this.generateUser();
        this.users[user.id] = user;
      }
    }
  }

  public generateNewActivityLevel() {
    if (this.amountOfUsers > 100) {
      if (this.activityLevel < 100) {
        this.scaleReacts += 8;
      } else {
        this.activityLevel = this.activityLevel - 150;
      }
    } else {
      this.activityLevel = this.activityLevel - this.amountOfUsers * 5;
      this.scaleReacts += 1;
    }
  }

  //Function exposed to game, determines when the user is checking the timeline
  public checkUpdate(time: number) {
    //Select random name from our pool
    const userIndex = Math.floor(Math.random() * this.amountOfUsers);
    const user = this.users[Object.keys(this.users)[userIndex]];
    //Checking users activity level, and seeing if it's time for them to comment
    if (time % this.activityLevel === 0) {
      //Function to read headlines
      this.checkHeadlines(this.headlineManager.getQueue(this.group), user);
      //Function to create a headline
      this.createHeadline(user);
    }
  }

  public influence(val: number) {
    if (this.playerOpinion < 100 && this.playerOpinion > 0) {
      this.playerOpinion += val;
    }
  }

  private changeUserOpinionOfPlayer(user, opinionChange: number) {
    this.users[user.id].playerOpinion += opinionChange;
  }

  private interactWithHeadline(
    user: User,
    headline: Omit<Headline, 'alertUser' | 'trendTracker'>,
    playerFactor: number,
    repeatFactor: number,
    type: 'positive' | 'negative'
  ) {
    const userFeeling = this.trendFeelings[headline.trend];
    const reacts = headline.playerCreated ? this.scaleReacts : 1;
    if (headline.playerCreated) {
      this.changeUserOpinionOfPlayer(
        user,
        type === 'positive' ? rand10() : -1 * rand10()
      );
    }
    //If the user feels positively towards the trend, there's a chance to like
    var total =
      userFeeling + headline.sentimentScore + playerFactor - repeatFactor;
    if (total >= interactChance()) {
      if (type === 'positive') headline.like(reacts);
      else headline.dislike(reacts);
    }

    if (total + this.aggression >= commentChance()) {
      headline.addComment(
        type === 'positive' ? sentence.affirm() : sentence.deny(),
        type,
        user
      );
    }
  }

  //Function for user to check new posts
  private checkHeadlines(headlines: Headline[], user: User) {
    var postsToCheck = headlines.length;

    for (var i = 0; i < postsToCheck; i++) {
      //Read the headline, and determine the reaction to the headline
      const headline = this.headlineManager.getQueueHeadline(i, this.group);
      const trend = headline.trend;
      const userFeeling = this.trendFeelings[trend] + user.trendVariation;
      const sentiment = headline.sentimentScore;
      let playerFactor = 0;
      let repeatFactor = 0;
      const { playerOpinion } = user;

      if (headline.playerCreated) {
        playerFactor = playerOpinion / 10;
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
        this.interactWithHeadline(
          user,
          headline,
          playerFactor,
          repeatFactor,
          'positive'
        );
      }
      //If the user feels negatively towards the trend, there's a chance to dislike
      else if (sentiment > 0 && userFeeling <= 5) {
        this.interactWithHeadline(
          user,
          headline,
          playerFactor,
          repeatFactor,
          'negative'
        );
      }
      //If it's negative
      else if (sentiment <= 0 && userFeeling > 5) {
        this.interactWithHeadline(
          user,
          headline,
          playerFactor,
          repeatFactor,
          'negative'
        );
      }
      //If the user feels negatively also, there's a chance to like
      else {
        this.interactWithHeadline(
          user,
          headline,
          playerFactor,
          repeatFactor,
          'positive'
        );
      }
    }
  }

  //Function for user to push a new headline
  private createHeadline(user: User) {
    if (this.aggression >= headlineChance()) {
      const trendFeelingKeys = Object.keys(this.trendFeelings);
      const trend =
        trendFeelingKeys[Math.floor(Math.random() * trendFeelingKeys.length)];
      const feeling = this.trendFeelings[trend] + user.trendVariation;
      const statement = sentence.generate(feeling, trend);

      this.headlineManager.addHeadline(
        { headline: statement, user, trend },
        this.group
      );
    }
  }
}
