var sentiment = require('sentiment');

function HeadlineComment(comment, user, name) {
    this.comment = comment;
    this.user = user;
    this.commentName = name;
    this.score = 0;

    function like() {
        this.score++
    }

    function dislike() {
        this.score--;
    }
}

exports.Headline = function (headline, user, topic, name, creation) {
    this.headline = headline;
    this.user = user;
    this.postName = name;
    this.topic = topic;
    this.score = 0;
    this.comments = [];
    this.interacted = {};
    this.playerCreated = creation || false;
    this.sentimentScore = sentiment(headline).score;

    //function to add a user comment
    this.addComment = function(comment, user, name) {
        //Creates a new comment to push to comments
        var comment = new HeadlineComment(comment, user, name);
        //Pushing the comment to our comments array
        this.comments.push(comment);
    }

    this.alertUser = function(comment) {
        var rating = sentiment(comment).score;
        
        if (rating > 0) {
            this.user.playerOpinion += 7+rating;
        }
        else if (rating < 0) {
            this.user.playerOpinion -= 7-rating;
        }
        else {
            this.user.playerOpinion += 5;
        }
    }

    //function to add to the posts score
    this.like = function() {
        this.score++;
    }

    //function to subtract from the posts score
    this.dislike = function() {
        this.score--;
    }
}
