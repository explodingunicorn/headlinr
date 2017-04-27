import User from './users/user.js';
var Headline = require('../src/users/headline.js').Headline;
var DataCollector = require('../src/users/dataCollector.js').DataCollector;
var sentenceGenerator = require('../src/users/sentenceGeneration');

var trends = ['cats', 'dogs', 'birth-control', 'the police', 'teachers', 'babies', 'white people', 'purple people', 'fire fighters', 'hamsters', 'macaroni','kangaroos', 'politicians', 'hospitals', 'girlfriends', 'boyfriends', 'exercises', 'eating dinner', 'pool parties', 'scooters', 'skateboards', 'apples', 'oranges', 'hotdogs', 'hamburgers', 'fat people', 'skinny people', 'doors', 'houses', 'cigars', 'marijuanas', 'bands', 'popcorn', 'sodas', 'movies', 'blind people', 'elephants', 'shoes', 'hippies', 'beards', 'eyeballs', 'hands', 'noses', 'farts', 'computers', 'hackers', 'men', 'women', 'actors', 'actresses', 'pencils', 'fries', 'fires', 'lights', 'cities', 'websites', 'hopes', 'dreams', 'subs', 'hamsters', 'keyboards', 'phones', 'moms', 'dads', 'grandparents', 'old people', 'millenials', 'wars', 'christians', 'muslims', 'liberals', 'rednecks', 'neo-nazis', 'snow-flakes', 'ducks', 'colds', 'fevers', 'pancakes', 'boogers', 'white people', 'black people', 'red people', 'green people', 'televisions', 'haters', 'bugs', 'basketballs', 'sweatshirts', 'clothes', 'donuts', 'dinosaurs', 'bosses', 'co-workers', 'snakes'];

export default function Game(user) {
    var connections = 50;
    this.player = null;
    this.playerScore = 0;
    this.playerComments = 0;
    this.totalConnections = 50;
    this.collector = new DataCollector(this);
    var game = this;
    this.headlines = [];
    this.userHeadlines = [];
    this.bestHeadlines = [];
    var trendsAmt = 10;
    this.trends = generateTrends();
    this.trendsCost = 30000;
    this.postsToRead = 5;
    this.visualsUnlocked = {
        posts: false,
        likes: false,
        comments: false,
        feelings: false,
        topPosts: false
    };
    this.automation = {
        like: 0,
        likeCount: 0,
        comment: 0,
        commentCount: 0,
        post: 0,
    }
    this.userGroupQueues = (function() {
        var arr = [];
        for (var i = 0; i < 5; i++) {
            arr[i] = [];
        }

        return arr;
    })();

    function generateTrends() {
        var gameTrends = [];
        trends.sort(function() { return 0.5 - Math.random() });
        for (var i = 0; i < trendsAmt; i++) {
            gameTrends[i] = trends[i];
        }

        return gameTrends;
    }

    this.users = (function () {
        var usersArr = [];
        var groupCount = game.userGroupQueues.length;
        for (var i = 0; i < connections/groupCount; i++) {
            for (var j = 0; j < groupCount; j++) {
                usersArr.push(new User(game, j));
            }
        }
        return usersArr;
    })();

    this.createNewTrends = function() {
        this.trends = generateTrends();
    }

    this.newPlayer = function(user) {
        this.player = user;
        console.log(user);
    }

    this.update = function(time) {
        for (var i = 0; i < this.users.length; i++) {
            game.users[i].checkUpdate(time);
        }

        if(automation.post) {
            if(time % automation.post === 0) {

            }
        }
    }

    this.playerLike = function(index) {
        if(!this.headlines[index].playerCreated) {
            if(this.headlines[index].isDisliked) {
                    this.headlines[index].isDisliked = false;
                    this.headlines[index].isLiked = true;
                    this.headlines[index].user.influence(10);
                    this.headlines[index].like(1);
            }
            else if(this.headlines[index].isLiked) {
                this.headlines[index].isLiked = true;
            }
            else {
                this.headlines[index].isLiked = true;
                this.headlines[index].user.influence(10);
                this.headlines[index].like(1);
            }  
        }
    }

    this.playerDislike = function(index) {
        if(this.headlines[index].isLiked) {
                this.headlines[index].isLiked = false;
                this.headlines[index].isDisliked = true;
                this.headlines[index].user.influence(-10);
                this.headlines[index].dislike(1);
        }
        else if (this.headlines[index].isDisliked) {
            this.headlines[index].isDisliked = true;
        }
        else {
            this.headlines[index].isDisliked = true;
            this.headlines[index].user.influence(-10);
            this.headlines[index].dislike(1);
        }
    }

    this.playerComment = function(index, user) {
        var headline = this.headlines[index];
        var comment = this.headlines[index].commentValue;

        if(!comment) {
            comment = sentenceGenerator.affirm();
        }

        this.headlines[index].addComment(comment, user, user.info);
        this.headlines[index].alertUser(comment);
        this.headlines[index].commentValue = '';
    }

    this.playerHeadline = function(headline) {
        if (!headline) {
            var topic = this.trends[Math.floor(Math.random() * this.trends.length)];
            var feeling = Maht.floor(Math.random() * 10);
            var statement = sentence.generate(feeling, topic);
        }
        for (var i = 0; i < this.trends.length; i++) {
            var topic = this.trends[i];
            if(headline.includes(topic)) {
                key = true;
                userTopic = topic;
                break;
            }
        }
        if (key) {
            var headline = new Headline(headline, this.user, userTopic, this.user.info, true, this.game)
            this.pushHeadline(headline, 'all', true);
            return true;
        }
        else {
            return false;
        }
    }

    this.changePlayerScore = function(points) {
        this.playerScore += points;
    }

    this.addPlayerComments = function() {
        this.playerComments++;
    }

    function checkAutomation() {
        //Check if like is activated
        if(game.automation.like) {
            game.automation.likeCount++;
            console.log('hi');

            if(game.automation.like === game.automation.likeCount) {
                game.playerLike(0);
                game.automation.likeCount = 0;
                console.log('liked');
            }
        }

        if(game.automation.comment) {
            game.automation.commentCount++;

            if(game.automation.comment === game.automation.commentCount) {
                game.playerComment(0, game.player);
                game.automation.commentCount = 0;
            }
        }
    }

    this.pushHeadline = function(headline, group, user) {
        this.collector.pushNewHeadline(headline);
        //If a user is posting, post to all groups
        if (group === 'all') {
            for (var i = 0; i < this.userGroupQueues.length; i++) {
                this.userGroupQueues[i].unshift(headline);

                if(this.userGroupQueues[i].length > this.postsToRead) {
                    this.userGroupQueues[i].pop();
                }
            }
        }
        //Otherwise post to the respective group
        else {
            this.userGroupQueues[group].unshift(headline);

            if(this.userGroupQueues[group].length > this.postsToRead) {
                this.userGroupQueues[group].pop();
            }
        }
        //Also post it to the collective group for the user to view all posts
        this.headlines.unshift(headline);

        //If the user is posting push it to the users headlines as well
        if(user) {
            this.userHeadlines.unshift(headline);

            if(this.userHeadlines.length > 20) {
                this.userHeadlines.pop();
            }
        }

        //Pop off the 30th post so the timeline isn't infinite
        if(this.headlines.length > 30) {
            this.headlines.pop();
        }

        checkAutomation();
    }

    this.pushBestHeadline = function(post) {
        this.bestHeadlines.unshift(post);

        if(this.bestHeadlines.length > 10) {
            this.bestHeadlines.pop();
        }
    }

    this.addUsers = function(scale) {
        var modeledScale = scale*100;
        console.log(modeledScale);
        if(scale < 10) {
            this.postsToRead++;
        }
        else {
            this.postsToRead += 8;
        }
        var amountToAdd = modeledScale/this.users.length;
        for (var i = 0; i < this.users.length; i++) {
            this.users[i].generateMoreNames(amountToAdd);
            this.users[i].generateNewActivityLevel();
        }
        this.totalConnections = this.totalConnections + modeledScale;
    }

    this.reduceTrendsCost = function(scale) {
        this.trendsCost = this.trendsCost - scale;
    }

    this.addNewTrends = function(scale, points) {
        if(scale !== "purchase") {
            trendsAmt = trendsAmt + scale;
        }
        this.trends = generateTrends();
        this.collector.clearData();

        for (var i = 0; i < this.users.length; i++) {
            this.users[i].generateNewFeelings();
        }
    }

    this.addVisual = function(type) {
        this.visualsUnlocked[type] = true;
    }

    this.addAutomation = function(type, scale) {
        console.log(type, scale);
        if(type !== 'post') {
            this.automation[type] = scale;
            this.automation[type+'Count'] = 0;
        }
        else {
            this.automation[type] = 100;
        }
    }
}
