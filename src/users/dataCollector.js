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
            };
        }
        data.topics[topic].amount++;

        if (data.topics[topic].amount > data.max) {
            data.max = data.topics[topic].amount;
        }
    }
}