import Sentiment from 'sentiment';
import lastnames from '../data/lastnames';

const sentiment = new Sentiment();

class HeadlineComment {
  public comment;
  public user;
  public commentName;
  public score = 0;

  constructor(
    comment: string,
    user: any,
    name: { first: string; last: string }
  ) {
    this.comment = comment;
    this.user = user;
    this.commentName = name;
  }

  public like() {
    this.score++;
  }

  public dislike() {
    this.score--;
  }
}

export class Headline {
  public headline;
  public user;
  public postName;
  public trend;
  public playerCreated;
  public sentimentScore;

  public score = 0;
  public comments: HeadlineComment[] = [];
  public commentsAmt = 0;
  public interacted = {};

  constructor(
    headline: string,
    user: any,
    name: { first: string; last: string },
    trend: string,
    creation: boolean = false
  ) {
    this.headline = headline;
    this.user = user;
    this.postName = name;
    this.trend = trend;
    this.playerCreated = creation;
    this.sentimentScore = sentiment.analyze(headline).score;
  }

  //function to add a user comment
  public addComment(comment, user, name) {
    //Creates a new comment to push to comments
    const newComment = new HeadlineComment(comment, user, name);
    //Pushing the comment to our comments array
    if (this.comments.length < 10) {
      this.comments.push(newComment);
    }
    this.commentsAmt++;

    if (this.playerCreated) {
      this.user.addComments();
    }
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
  public like(scale) {
    this.score += scale;
    if (this.playerCreated) {
      this.user.changeScore(scale);
    }
  }

  //function to subtract from the posts score
  public dislike(scale) {
    this.score -= scale;
    if (this.playerCreated) {
      this.user.changeScore(-scale);
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

  public getQueueHeadline(
    index: number,
    queue: number
  ): Pick<Headline, 'addComment' | 'like' | 'dislike'> {
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
