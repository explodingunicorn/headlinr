exports.DataCollector = function() {
    this.max = 0;
    this.topics = {};
    var data = this;

    this.pushNewHeadline = function(post) {
        formatData(post);
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
            };
        }
        data.topics[topic].amount++;
        data.topics[topic].posts.unshift(post);

        if (data.topics[topic].posts > 20) {
            data.topics[topic].posts.pop();
        }

        var likes = 0;
        var comments = 0;
        for (var i = 0; i < data.topics[topic].posts.length; i++) {
            likes += data.topics[topic].posts[i].score;
            comments += data.topics[topic].posts[i].comments.length;
        }
        data.topics[topic].likesAverage = Math.floor(likes/data.topics[topic].posts.length);
        data.topics[topic].commentsAverage = Math.floor(comments/data.topics[topic].posts.length);

        if (data.topics[topic].amount > data.max) {
            data.max = data.topics[topic].amount;
        }
    }
}