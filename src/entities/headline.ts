import Sentiment from 'sentiment';
import { User, UserGroup } from './user';

const sentiment = new Sentiment();

class HeadlineComment {
  public comment;
  public userGroup: UserGroup;
  public user: User;
  public score = 0;

  constructor(comment: string, userGroup: UserGroup, user: User) {
    this.comment = comment;
    this.userGroup = userGroup;
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
  public userGroup: UserGroup | null;
  public user: User;
  public trend: string;
  public playerCreated: boolean;
  public sentimentScore: number;

  public score = 0;
  public comments: HeadlineComment[] = [];
  public commentsAmt = 0;
  public interacted = {};

  public playerLiked = false;
  public playerDisliked = false;

  constructor(
    headline: string,
    userGroup: UserGroup | null = null,
    user: User | null = null,
    trend: string,
    creation: boolean = false
  ) {
    this.headline = headline;
    this.userGroup = userGroup;
    this.user = user;
    this.trend = trend;
    this.playerCreated = creation;
    this.sentimentScore = sentiment.analyze(headline).score;
  }

  //function to add a user comment
  public addComment(comment, userGroup: UserGroup, user: User) {
    //Creates a new comment to push to comments
    const newComment = new HeadlineComment(comment, userGroup, user);
    //Pushing the comment to our comments array
    if (this.comments.length < 10) {
      this.comments.push(newComment);
    }
    this.commentsAmt++;

    // if (this.playerCreated) {
    //   this.userGroup.addComments();
    // }
  }

  public alertUser(comment: string) {
    const rating = sentiment(comment).score;

    if (rating > 0) {
      this.userGroup.playerOpinion += 7 + rating;
    } else if (rating < 0) {
      this.userGroup.playerOpinion -= 7 - rating;
    } else {
      this.userGroup.playerOpinion += 5;
    }
  }

  //function to add to the posts score
  public like(scale, player: boolean = false) {
    this.score += scale;
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
  private headlineQueues = new Array(5).fill([] as Headline[]);
  private maxQueueLength = 5;
  private runOnInteraction: HeadlineInteractEvent = () => null;

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
    headline: Headline,
    queue: number,
    player: boolean = false
  ) {
    if (player) {
      this.headlineQueues.forEach((q, i) => {
        this.addHeadlineToQueue(headline, i);
      });

      this.playerHeadlines.unshift(headline);

      if (this.playerHeadlines.length > 20) {
        this.playerHeadlines.pop();
      }
    } else {
      this.addHeadlineToQueue(headline, queue);
    }

    this.headlines.unshift(headline);

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

  public getQueueHeadline(index: number, queue: number): Headline {
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
