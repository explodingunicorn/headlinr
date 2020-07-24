import Sentiment from "sentiment";
import lastnames from "../data/lastnames";

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
        creation: boolean
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
