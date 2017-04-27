exports.DataCollector = function(game) {
    this.game = game;
    this.max = 0;
    this.likesMax = 0;
    this.likesMin = 0;
    this.commentsMax = 0;
    this.trends = {};
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
        this.trends = {};
    }

    function formatData(post) {
        var topic = post.trend;
        if (!data.trends[topic]) {
            data.trends[topic] = {
                name: topic,
                amount: 0,
                posts: [],
                likesAverage: 0,
                commentsAverage: 0,
                sentimentAverage: 0,
            };
        }
        data.trends[topic].amount++;
        data.trends[topic].posts.unshift(post);
        
        //Popping data from our array
        if (data.trends[topic].posts > 20) {
            data.trends[topic].posts.pop();
        }

        var likes = 0;
        var comments = 0;
        var sentiment = 0;
        for (var i = 0; i < data.trends[topic].posts.length; i++) {
            likes += data.trends[topic].posts[i].score;
            comments += data.trends[topic].posts[i].commentsAmt;
            sentiment += data.trends[topic].posts[i].sentimentScore;
        }

        //Averaging our likes, and comments, and sentiment
        data.trends[topic].likesAverage = Math.floor(likes/data.trends[topic].posts.length);
        data.trends[topic].commentsAverage = Math.floor(comments/data.trends[topic].posts.length);
        data.trends[topic].sentimentAverage = Math.floor(sentiment/data.trends[topic].posts.length);

        //Getting the maximum comments 
        if (data.trends[topic].amount > data.max) {
            data.max = data.trends[topic].amount;
        }

        //Getting the maximum or minimum like rating
        if (data.trends[topic].likesAverage > 0 && data.trends[topic].likesAverage > data.likesMax) {
            data.likesMax = data.trends[topic].likesAverage;
            data.game.pushBestHeadline(post);
        }
        else if (data.trends[topic].likesAverage < 0 && data.trends[topic].likesAverage < data.likesMin) {
            data.likesMin = data.trends[topic].likesAverage;
        }

        //Getting the max comments
        if (data.trends[topic].commentsAverage > data.commentsMax) {
            data.commentsMax = data.trends[topic].commentsAverage;
        }
    }
}