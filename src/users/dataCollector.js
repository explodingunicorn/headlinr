exports.DataCollector = function(game) {
    this.game = game;
    this.max = 0;
    this.likesMax = 0;
    this.likesMin = 0;
    this.commentsMax = 0;
    this.topics = {};
    var data = this;

    this.pushNewHeadline = function(post) {
        formatData(post);
    }

    this.clearData = function() {
        this.game = game;
        this.max = 0;
        this.likesMax = 0;
        this.likesMin = 0;
        this.commentsMax = 0;
        this.topics = {};
    }

    function formatData(post) {
        var topic = post.topic;
        if (!data.topics[topic]) {
            data.topics[topic] = {
                name: topic,
                amount: 0,
                posts: [],
                likesAverage: 0,
                commentsAverage: 0,
                sentimentAverage: 0,
            };
        }
        data.topics[topic].amount++;
        data.topics[topic].posts.unshift(post);
        
        //Popping data from our array
        if (data.topics[topic].posts > 20) {
            data.topics[topic].posts.pop();
        }

        var likes = 0;
        var comments = 0;
        var sentiment = 0;
        for (var i = 0; i < data.topics[topic].posts.length; i++) {
            likes += data.topics[topic].posts[i].score;
            comments += data.topics[topic].posts[i].comments.length;
            sentiment += data.topics[topic].posts[i].sentimentScore;
        }

        //Averaging our likes, and comments, and sentiment
        data.topics[topic].likesAverage = Math.floor(likes/data.topics[topic].posts.length);
        data.topics[topic].commentsAverage = Math.floor(comments/data.topics[topic].posts.length);
        data.topics[topic].sentimentAverage = Math.floor(sentiment/data.topics[topic].posts.length);

        //Getting the maximum comments 
        if (data.topics[topic].amount > data.max) {
            data.max = data.topics[topic].amount;
        }

        //Getting the maximum or minimum like rating
        if (data.topics[topic].likesAverage > 0 && data.topics[topic].likesAverage > data.likesMax) {
            data.likesMax = data.topics[topic].likesAverage;
            data.game.pushBestHeadline(post);
        }
        else if (data.topics[topic].likesAverage < 0 && data.topics[topic].likesAverage < data.likesMin) {
            data.likesMin = data.topics[topic].likesAverage;
        }

        //Getting the max comments
        if (data.topics[topic].commentsAverage > data.commentsMax) {
            data.commentsMax = data.topics[topic].commentsAverage;
        }
    }
}