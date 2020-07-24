import { User } from './user';
import { Player } from './player';
import { DataCollector } from './dataCollector';
import trends from '../data/trends';
import { HeadlineManager, HeadlineInteractEvent } from './headline';

export default class Game {
  private G = this;
  private connections = 50;
  private trendsAmt = 10;

  public player = new Player(this);
  public collector = new DataCollector(this);

  public totalConnections = 50;
  public headlines = [];
  private userHeadlines = [];
  private bestHeadlines = [];

  private HManager = new HeadlineManager();
  public runOnHeadlinesUpdated: HeadlineInteractEvent[] = [];

  public trends = this.generateTrends();
  public trendsCost = 30000;
  private postsToRead = 5;
  public visualsUnlocked = {
    posts: false,
    likes: false,
    comments: false,
    feelings: false,
    topPosts: false,
  };

  private automation = {
    like: 0,
    likeCount: 0,
    comment: 0,
    commentCount: 0,
    headline: false,
    headlineCount: 0,
  };

  private userGroupQueues = (function () {
    const arr = [];
    for (let i = 0; i < 5; i++) {
      arr[i] = [];
    }

    return arr;
  })();

  private users = (function (game: Game) {
    const usersArr = [];
    const groupCount = game.userGroupQueues.length;
    for (let i = 0; i < game.connections / groupCount; i++) {
      for (let j = 0; j < groupCount; j++) {
        usersArr.push(new User(game, j, game.HManager));
      }
    }
    return usersArr;
  })(this.G);

  constructor() {}

  public onHeadlinesUpdated(event: HeadlineInteractEvent) {
    this.runOnHeadlinesUpdated.push(event);
    this.HManager.onInteraction((event) => {
      this.runOnHeadlinesUpdated.forEach((func) => {
        func(event);
      });
    });
  }

  private generateTrends() {
    const gameTrends = [];
    trends.sort(function () {
      return 0.5 - Math.random();
    });
    for (let i = 0; i < this.trendsAmt; i++) {
      gameTrends[i] = trends[i];
    }

    return gameTrends;
  }

  public createNewTrends() {
    this.trends = this.generateTrends();
  }

  public update(time) {
    for (let i = 0; i < this.users.length; i++) {
      this.users[i].checkUpdate(time);
    }

    if (this.automation.headline) {
      if (time % this.automation.headlineCount === 0) {
        this.player.headline();
      }
    }
  }

  private checkAutomation() {
    //Check if like is activated
    if (this.automation.like) {
      this.automation.likeCount++;

      if (this.automation.like === this.automation.likeCount) {
        this.player.like(0);
        this.automation.likeCount = 0;
      }
    }

    if (this.automation.comment) {
      this.automation.commentCount++;

      if (this.automation.comment === this.automation.commentCount) {
        this.player.comment(0);
        this.automation.commentCount = 0;
      }
    }
  }

  private addUsers(scale) {
    const modeledScale = scale * 100;
    console.log(modeledScale);
    if (scale < 10) {
      this.HManager.increaseQueueLength(1);
    } else {
      this.HManager.increaseQueueLength(8);
    }
    const amountToAdd = modeledScale / this.users.length;
    for (let i = 0; i < this.users.length; i++) {
      this.users[i].generateMoreNames(amountToAdd);
      this.users[i].generateNewActivityLevel();
    }
    this.totalConnections = this.totalConnections + modeledScale;
  }

  private reduceTrendsCost(scale) {
    this.trendsCost = this.trendsCost - scale;
  }

  public addNewTrends(scale, points) {
    if (scale !== 'purchase') {
      this.trendsAmt = this.trendsAmt + scale;
    }
    this.trends = this.generateTrends();
    this.collector.clearData();

    for (let i = 0; i < this.users.length; i++) {
      this.users[i].generateNewFeelings();
    }
  }

  public addVisual(type) {
    this.visualsUnlocked[type] = true;
  }

  public addAutomation(type, scale) {
    console.log(type, scale);
    if (type !== 'headline') {
      this.automation[type] = scale;
      this.automation[type + 'Count'] = 0;
    } else {
      this.automation[type] = true;
      this.automation[type + 'Count'] = scale;
    }
  }
}
