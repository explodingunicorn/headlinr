function HeadlineComment(comment, name) {
    this.comment = comment;
    this.commentName = name;
    this.score = 0;

    function like() {
        this.score++
    }

    function dislike() {
        this.score--;
    }
}

export default function Headline(headline, name, topic) {
    this.headline = headline;
    this.postName = name;
    this.topic = topic;
    this.score = 0;
    this.comments = [];

    //function to add a user comment
    this.addComment = function(comment, name) {
        var comment = new HeadlineComment(comment, name);
        this.comments.push(comment);
    }

    //function to add to the posts score
    this.like = function() {
        console.log('upvote');
        this.score++;
    }

    //function to subtract from the posts score
    this.dislike = function() {
        this.score--;
    }
}
