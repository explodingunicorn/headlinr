export const DataCollector = function (game) {
    this.game = game;
    this.max = 0;
    this.likesMax = 0;
    this.likesMin = 0;
    this.commentsMax = 0;
    this.trends = {};
    this.playerLikes = {};
    this.playerDislikes = {};
    var data = this;

    this.pushNewHeadline = function (post) {
        formatData(post);

        if (post.playerCreated) {
            formatPlayerData(post);
        }
    };

    this.clearData = function () {
        this.game = game;
        this.max = 0;
        this.likesMax = 0;
        this.likesMin = 0;
        this.commentsMax = 0;
        this.trends = {};
    };

    function formatPlayerData(post) {
        var trend = post.trend;
        if (post.sentimentScore > 0) {
            if (data.playerDislikes[trend]) {
                data.playerDislikes[trend] = false;
            }

            data.playerLikes[trend] = true;
        } else if (post.sentimentScore < 0) {
            if (data.playerLikes[trend]) {
                data.playerLikes[trend] = false;
            }

            data.playerDislikes[trend] = true;
        }
    }

    function formatData(post) {
        var trend = post.trend;
        if (!data.trends[trend]) {
            data.trends[trend] = {
                name: trend,
                amount: 0,
                posts: [],
                likesAverage: 0,
                commentsAverage: 0,
                sentimentAverage: 0,
            };
        }
        data.trends[trend].amount++;
        data.trends[trend].posts.unshift(post);

        //Popping data from our array
        if (data.trends[trend].posts > 20) {
            data.trends[trend].posts.pop();
        }

        var likes = 0;
        var comments = 0;
        var sentiment = 0;
        for (var i = 0; i < data.trends[trend].posts.length; i++) {
            likes += data.trends[trend].posts[i].score;
            comments += data.trends[trend].posts[i].commentsAmt;
            sentiment += data.trends[trend].posts[i].sentimentScore;
        }

        //Averaging our likes, and comments, and sentiment
        data.trends[trend].likesAverage = Math.floor(
            likes / data.trends[trend].posts.length
        );
        data.trends[trend].commentsAverage = Math.floor(
            comments / data.trends[trend].posts.length
        );
        data.trends[trend].sentimentAverage = Math.floor(
            sentiment / data.trends[trend].posts.length
        );

        //Getting the maximum comments
        if (data.trends[trend].amount > data.max) {
            data.max = data.trends[trend].amount;
        }

        //Getting the maximum or minimum like rating
        if (
            data.trends[trend].likesAverage > 0 &&
            data.trends[trend].likesAverage > data.likesMax
        ) {
            data.likesMax = data.trends[trend].likesAverage;
            data.game.pushBestHeadline(post);
        } else if (
            data.trends[trend].likesAverage < 0 &&
            data.trends[trend].likesAverage < data.likesMin
        ) {
            data.likesMin = data.trends[trend].likesAverage;
        }

        //Getting the max comments
        if (data.trends[trend].commentsAverage > data.commentsMax) {
            data.commentsMax = data.trends[trend].commentsAverage;
        }
    }
};
