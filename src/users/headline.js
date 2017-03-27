var sentiment = require('sentiment');

function HeadlineComment(comment, user) {
    this.comment = comment;
    this.user = user;
    this.commentName = user.info;
    this.score = 0;

    function like() {
        this.score++
    }

    function dislike() {
        this.score--;
    }
}

exports.Headline = function (headline, user, topic, creation) {
    this.headline = headline;
    this.user = user;
    this.postName = user.info;
    this.topic = topic;
    this.score = 0;
    this.comments = [];
    this.interacted = {};
    this.playerCreated = creation || false;

    //function to add a user comment
    this.addComment = function(comment, name) {
        //Creates a new comment to push to comments
        var comment = new HeadlineComment(comment, name);
        //Pushing the comment to our comments array
        this.comments.push(comment);
    }

    this.alertUser = function(comment) {
        var rating = sentiment(comment).score;
        console.log(rating);
        
        if (rating > 0) {
            this.user.playerOpinion += 7+rating;
            console.log('Positive');
        }
        else if (rating < 0) {
            this.user.playerOpinion -= 7-rating;
            console.log('Decrease', 7-rating);
        }
        else {
            this.user.playerOpinion += 5;
            console.log('Neutral');
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
