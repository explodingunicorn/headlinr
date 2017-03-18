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
    function addComment(comment) {
        var comment = new HeadlineComment(comment, name);
        this.comments.push(comment);
    }

    //function to add to the posts score
    function like() {
        this.score++;
    }

    //function to subtract from the posts score
    function dislike() {
        this.score--;
    }
}
