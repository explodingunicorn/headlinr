exports.DataCollector = function() {
    var posts = [];

    this.pushNewHeadline = function(post) {
        posts.unshift(post);
        if(posts.length > 200) {
            posts.pop();
        }
        return formatData();
    }

    function formatData() {
        var obj = {};
        for (var i = 0; i < posts.length; i++) {
            var topic = posts[i].topic
            if(!obj[topic]) {
                obj[topic] = {posts: [], trend: topic};
            }
            obj[topic].posts.push(posts[i]);
        }

        return obj
    }
}