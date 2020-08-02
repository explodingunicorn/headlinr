import Sentiment from 'sentiment';
import { User, UserGroup } from './user';
import { TrendTracker } from './trends';

const sentiment = new Sentiment();

class HeadlineComment {
  public comment;
  public user: User;
  public score = 0;

  constructor(comment: string, user: User) {
    this.comment = comment;
    this.user = user;
  }

  public like() {
    this.score++;
  }

  public dislike() {
    this.score--;
  }
}

export class Headline {
  public headline: string;
  public user: User = null;
  public trend: string;
  private trendTracker: TrendTracker;
  public playerCreated: boolean;
  public sentimentScore: number;

  public score = 0;
  public comments: HeadlineComment[] = [];
  public commentsAmt = 0;
  public interacted = {};

  public playerLiked = false;
  public playerDisliked = false;
  public playerCommented = false;

  constructor(
    headline: string,
    user: User | null = null,
    trend: string,
    trendTracker: TrendTracker,
    creation: boolean = false
  ) {
    this.headline = headline;
    this.user = user;
    this.trend = trend;
    this.trendTracker = trendTracker;
    this.playerCreated = creation;
    this.sentimentScore = sentiment.analyze(headline).score;
  }

  //function to add a user comment
  public addComment(
    comment,
    type: 'positive' | 'negative',
    user: User = null,
    player: boolean = false
  ) {
    //Creates a new comment to push to comments
    const newComment = new HeadlineComment(comment, user);
    //Pushing the comment to our comments array
    if (this.comments.length < 10) {
      this.comments.push(newComment);
    }
    this.trendTracker.newComment(this.trend, type);
    this.commentsAmt++;

    if (player) {
      this.playerCommented = true;
    }

    // if (this.playerCreated) {
    //   this.userGroup.addComments();
    // }
  }

  public alertUser(comment: string) {
    const rating = sentiment(comment).score;

    if (rating > 0) {
      this.user.playerOpinion += 7 + rating;
    } else if (rating < 0) {
      this.user.playerOpinion -= 7 - rating;
    } else {
      this.user.playerOpinion += 5;
    }
  }

  //function to add to the posts score
  public like(scale, player: boolean = false) {
    this.score += scale;
    this.trendTracker.newReaction(this.trend, scale);
    // if (this.playerCreated) {
    //   this.userGroup.changeScore(scale);
    // }
    if (player) {
      this.playerLiked = !this.playerDisliked;
      this.playerDisliked = false;
    }
  }

  //function to subtract from the posts score
  public dislike(scale, player: boolean = false) {
    this.score -= scale;
    this.trendTracker.newReaction(this.trend, scale * -1);
    // if (this.playerCreated) {
    //   this.user.changeScore(-scale);
    // }
    if (player) {
      this.playerDisliked = !this.playerDisliked;
      this.playerLiked = false;
    }
  }
}

export type HeadlineInteractEvent = (event?: {
  headlines: Headline[];
  playerHeadlines: Headline[];
}) => void;

export class HeadlineManager {
  public headlines: Headline[] = [];
  public playerHeadlines: Headline[] = [];
  private trendTracker: TrendTracker;
  private headlineQueues: Headline[][] = [];
  private maxQueueLength = 5;
  private runOnInteraction: HeadlineInteractEvent = () => null;

  constructor(trendTracker: TrendTracker, queues: number) {
    this.trendTracker = trendTracker;
    this.headlineQueues = new Array(queues).fill([] as Headline[]);
  }

  public getQueue(queue: number) {
    return this.headlineQueues[queue];
  }

  public increaseQueueLength(by: number) {
    this.maxQueueLength = this.maxQueueLength + by;
  }

  private addHeadlineToQueue(headline: Headline, queue: number) {
    this.headlineQueues[queue].unshift(headline);

    if (this.headlineQueues[queue].length > this.maxQueueLength) {
      this.headlineQueues[queue].pop();
    }
  }

  public addHeadline(
    { headline, user, trend }: Pick<Headline, 'headline' | 'user' | 'trend'>,
    queue: number,
    player: boolean = false
  ) {
    const newHeadline = new Headline(headline, user, trend, this.trendTracker);
    if (player) {
      this.headlineQueues.forEach((q, i) => {
        this.addHeadlineToQueue(newHeadline, i);
      });

      this.playerHeadlines.unshift(newHeadline);

      if (this.playerHeadlines.length > 20) {
        this.playerHeadlines.pop();
      }
    } else {
      this.addHeadlineToQueue(newHeadline, queue);
    }

    this.headlines.unshift(newHeadline);

    if (this.headlines.length > 30) {
      this.headlines.pop();
    }
    this.runOnInteraction({
      headlines: this.headlines,
      playerHeadlines: this.playerHeadlines,
    });
  }

  public onInteraction(event: HeadlineInteractEvent) {
    this.runOnInteraction = event;
  }

  public getQueueHeadline(
    index: number,
    queue: number
  ): Omit<Headline, 'alertUser' | 'trendTracker'> {
    const headline = this.headlineQueues[queue][index];
    const event = {
      headlines: this.headlines,
      playerHeadlines: this.playerHeadlines,
    };
    return {
      ...headline,
      addComment: (...args) => {
        headline.addComment(...args);
        this.runOnInteraction(event);
      },
      like: (...args) => {
        headline.like(...args);
        this.runOnInteraction(event);
      },
      dislike: (...args) => {
        headline.dislike(...args);
        this.runOnInteraction(event);
      },
    };
  }
}
