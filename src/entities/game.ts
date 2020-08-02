import { UserGroup } from './user';
import { Player } from './player';
import { DataCollector } from './dataCollector';
import { HeadlineManager, HeadlineInteractEvent } from './headline';
import { TrendTracker } from './trends';

const userGroupStartCount = 10;

export default class Game {
  private userGroupCount = userGroupStartCount;
  private G = this;
  private paused: boolean = false;

  public collector = new DataCollector(this);

  public headlines = [];

  private headlineManager: HeadlineManager;
  public trendTracker = new TrendTracker();
  public player: Player;

  public runOnHeadlinesUpdated: HeadlineInteractEvent[] = [];

  private automation = {
    like: 0,
    likeCount: 0,
    comment: 0,
    commentCount: 0,
    headline: false,
    headlineCount: 0,
  };

  private userGroups: UserGroup[];

  private initUserGroups() {
    const usersArr: UserGroup[] = [];
    const groupCount = this.userGroupCount;
    for (let j = 0; j < groupCount; j++) {
      usersArr.push(new UserGroup(j, this.headlineManager, this.trendTracker));
    }
    usersArr.forEach((group) => {
      group.initTrendFeelings();
    });
    return usersArr;
  }

  constructor() {
    this.headlineManager = new HeadlineManager(
      this.trendTracker,
      userGroupStartCount
    );
    this.player = new Player(this.headlineManager, this.trendTracker);
    this.userGroups = this.initUserGroups();
  }

  public onHeadlinesUpdated(event: HeadlineInteractEvent) {
    this.runOnHeadlinesUpdated.push(event);
    this.headlineManager.onInteraction((event) => {
      this.runOnHeadlinesUpdated.forEach((func) => {
        func(event);
      });
    });
  }

  public play() {
    this.paused = false;
  }
  public pause() {
    this.paused = true;
  }

  public update(time) {
    if (!this.paused) {
      for (let i = 0; i < this.userGroups.length; i++) {
        this.userGroups[i].checkUpdate(time);
      }

      if (this.automation.headline) {
        if (time % this.automation.headlineCount === 0) {
          this.player.headline();
        }
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
}
