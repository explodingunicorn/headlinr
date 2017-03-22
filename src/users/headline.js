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

export default function Headline(headline, user, topic) {
    this.headline = headline;
    this.user = user;
    this.postName = user.info;
    this.topic = topic;
    this.score = 0;
    this.comments = [];

    //function to add a user comment
    this.addComment = function(comment, name) {
        //Creates a new comment to push to comments
        var comment = new HeadlineComment(comment, name);
        //Pushing the comment to our comments array
        this.comments.push(comment);
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
