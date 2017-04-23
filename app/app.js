(function () {'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var os = require('os');
var electron = require('electron');
var jetpack = _interopDefault(require('fs-jetpack'));
var sentiment = require('sentiment');

//import sentiment from sentiment;
var fs = require('fs');
var path = require('path');
var fFirstNames = fs.readFileSync(path.join(__dirname, 'female.txt')).toString().split("\n");
var mFirstNames = fs.readFileSync(path.join(__dirname, 'male.txt')).toString().split("\n");
var lastNames = fs.readFileSync(path.join(__dirname, 'family.txt')).toString().split("\n");

//Other classes needed
var Headline$2 = require('../src/users/headline.js').Headline;
var sentence = require('../src/users/sentenceGeneration.js');

//Utilities
var rand10 = require('../src/utilities.js').rand10;
var headlineChance = require('../src/utilities.js').headlineChance;
var interactChance = require('../src/utilities.js').interactChance;
var commentChance = require('../src/utilities.js').commentChance;

//Sentiment
var sentimentAnalysis = require('sentiment');

//Basic class for user, a user represents multiple connections
function User(game, group) {
        //Age, sex, name
    this.names = (function() {
        var arr = [];
        arr.push(generateName());
        arr.push(generateName());
        return arr;
    })();
    this.game = game;
    this.group = group;
    this.playerOpinion = rand10() * 5;
    var activityLevel = 1000 + Math.floor((Math.random() * 100) + 1);
    var scaleReacts = 1;
    var aggression = rand10();
    var sex = Math.floor((Math.random() * 2) + 1);
    this.pic = '';
    if (sex === 1) {
        this.pic = '/boys/boy (' + Math.floor((Math.random() * 35) + 1) + ')';
    } else {
        this.pic = '/girls/girl (' + Math.floor((Math.random() * 42) + 1) + ')';
    }
    var self = this;

    function generateName() {
        var randFirstF = Math.floor((Math.random() * fFirstNames.length) + 1);
        var randFirstM = Math.floor((Math.random() * mFirstNames.length) + 1);
        var randLast = Math.floor((Math.random() * lastNames.length) + 1);
        var name = {};
        if (sex === 1) {
            name.first = mFirstNames[randFirstM];
            name.pic = '/boys/boy (' + Math.floor((Math.random() * 35) + 1) + ')';
        } else {
            name.first = fFirstNames[randFirstF];
            name.pic = '/girls/girl (' + Math.floor((Math.random() * 42) + 1) + ')';
        }
        name.last = lastNames[randLast];

        return name;
    }

    this.generateTopicFeelings = function() {
        var topics = {};

        for (var i = 0; i < this.game.topics.length; i++) {
            topics[this.game.topics[i]] = rand10();
        }
        return topics;
    };

    this.generateNewFeelings = function() {
        topicFeelings = this.generateTopicFeelings();
    };

    var topicFeelings = this.generateTopicFeelings();

    this.generateMoreNames = function(num) {
        if(num<1000) {
            for(var i = 0; i < num; i++) {
                this.names.push(generateName());
            }
        }
    };

    this.generateNewActivityLevel = function() {
        var sub;
        if (this.names.length > 100) {
            if(activityLevel < 100) {
                scaleReacts += 5;
            }
            else {
                activityLevel = activityLevel - 100;
            }
        }
        else {
            activityLevel = activityLevel - (this.names.length * 10); 
        }
    };

    //Function exposed to game, determines when the user is checking the timeline
    this.checkUpdate = function(time) {
        //Select random name from our pool
        var name = this.names[Math.floor(Math.random() * this.names.length)];
        //Checking users activity level, and seeing if it's time for them to comment
        if(time % activityLevel=== 0) {
            //Running function to check headlinr, passing game, and itself
            checkHeadlinr(this.game, this, name);
        }
    };

    this.influence = function(val) {
        if (this.playerOpinion < 100 && this.playerOpinion > 0) {
            this.playerOpinion += val;
        }
    };

    //Function that runs everything involved in a users turn
    function checkHeadlinr(game, user, name) {
        //Function to read headlines
        checkHeadlines(game.userGroupQueues[user.group], user, game, name);
        //Function to create a headline
        createHeadline(game, user, name);
    }

    //Function for user to check new posts
    function checkHeadlines(headlines, user, game, name) {
        var postsToCheck = 0;
        //Checks the last 10 headlines
        postsToCheck = headlines.length;

        for (var i = 0; i < postsToCheck; i++) {
            //Read the headline, and determine the reaction to the headline
            var topic = headlines[i].topic;
            var userFeeling = topicFeelings[topic];
            var sentiment$$1 = headlines[i].sentimentScore;
            var playerFactor = 0;
            var repeatFactor = 0;
            var player = false;
            var scale = 1;

            if(headlines[i].playerCreated) {
                playerFactor = user.playerOpinion/10;
                player = true;
                scale = scaleReacts;
                if(game.userHeadlines.length > 2) {
                    for(var j = game.userHeadlines.length-2; j > 0; j--) {
                        if (game.userHeadlines[j].topic === topic) {
                            repeatFactor += 7;
                        }
                    }
                }
            }
            //Check if sentiment is positive
            if (sentiment$$1 > 0 && userFeeling > 5) {
                if (player) {
                    user.playerOpinion += rand10();
                }
                //If the user feels positively towards the topic, there's a chance to like
                var total = userFeeling + sentiment$$1 + playerFactor - repeatFactor;
                if (total >= interactChance()) {
                    headlines[i].like(scale);
                }

                if((total+aggression) >= commentChance()) {
                    headlines[i].addComment(sentence.affirm(), user, name);
                }
            }
            //If the user feels negatively towards the topic, there's a chance to dislike
            else if (sentiment$$1 > 0 && userFeeling <= 5) {
                if (player) {
                    user.playerOpinion -= rand10();
                }
                //Add 5 to users feeling to simulate negative feeling
                var total = (userFeeling + 5) + sentiment$$1 - playerFactor - repeatFactor;

                if (total >= interactChance()) {
                    headlines[i].dislike(scale);
                }

                if((total+aggression) >= commentChance()) {
                    headlines[i].addComment(sentence.deny(), user, name);
                }
            }
            //If it's negative
            else if (sentiment$$1 <= 0 && userFeeling > 5) {
                if (player) {
                    user.playerOpinion -= rand10();
                }
                //If the user feels positively, there's a chance to dislike
                //Create a total, reverse the sentiment
                var total = (userFeeling + 5) + (-1 * sentiment$$1) - playerFactor - repeatFactor;

                //React if it's greater than the interaction chance, and they haven't interacted before
                if (total >= interactChance()) {
                    headlines[i].dislike(scale);
                }

                if((total+aggression) >= commentChance()) {
                    headlines[i].addComment(sentence.deny(), user, name);
                }
            }
            //If the user feels negatively also, there's a chance to like
            else {
                if (player) {
                    user.playerOpinion += rand10();
                }
                //Add 5 to users feeling to simulate negative feeling, reverse sentiment
                var total = (userFeeling + 5) + (-1 * sentiment$$1) + playerFactor - repeatFactor;

                if (total >= interactChance()) {
                    headlines[i].like(scale);
                }

                if((total+aggression) >= commentChance()) {
                    headlines[i].addComment(sentence.affirm(), user, name);
                }
            }
        }
    }

    //Function for user to push a new headline
    function createHeadline(game, user, name) {
        if (aggression >= headlineChance()) {
            var topic = game.topics[Math.floor(Math.random() * game.topics.length)];
            var feeling = topicFeelings[topic];
            var statement = sentence.generate(feeling, topic);

            //Creating a new headline
            var headline = new Headline$2(statement, user, topic, name);
            //
            game.pushHeadline(headline, self.group);
        }
    }
}

var Headline$1 = require('../src/users/headline.js').Headline;
var DataCollector = require('../src/users/dataCollector.js').DataCollector;

var topics = ['cats', 'dogs', 'birth-control', 'the police', 'teachers', 'babies', 'white people', 'purple people', 'fire fighters', 'hamsters', 'macaroni','kangaroos', 'politicians', 'hospitals', 'girlfriends', 'boyfriends', 'exercises', 'eating dinner', 'pool parties', 'scooters', 'skateboards', 'apples', 'oranges', 'hotdogs', 'hamburgers', 'fat people', 'skinny people', 'doors', 'houses', 'cigars', 'marijuanas', 'bands', 'popcorn', 'sodas', 'movies', 'blind people', 'elephants', 'shoes', 'hippies', 'beards', 'eyeballs', 'hands', 'noses', 'farts', 'computers', 'hackers', 'men', 'women', 'actors', 'actresses', 'pencils', 'fries', 'fires', 'lights', 'cities', 'websites', 'hopes', 'dreams', 'subs', 'hamsters', 'keyboards', 'phones', 'moms', 'dads', 'grandparents', 'old people', 'millenials', 'wars', 'christians', 'muslims', 'liberals', 'rednecks', 'neo-nazis', 'snow-flakes', 'ducks', 'colds', 'fevers', 'pancakes', 'boogers', 'white people', 'black people', 'red people', 'green people', 'televisions', 'haters', 'bugs', 'basketballs', 'sweatshirts', 'clothes', 'donuts', 'dinosaurs', 'bosses', 'co-workers', 'snakes'];

function Game() {
    var connections = 50;
    this.totalConnections = 50;
    this.collector = new DataCollector(this);
    var game = this;
    this.headlines = [];
    this.userHeadlines = [];
    this.bestHeadlines = [];
    var topicsAmt = 10;
    this.topics = generateTopics();
    this.data = null;
    this.postsToRead = 5;
    this.userGroupQueues = (function() {
        var arr = [];
        for (var i = 0; i < 5; i++) {
            arr[i] = [];
        }

        return arr;
    })();

    function generateTopics() {
        var gameTopics = [];
        topics.sort(function() { return 0.5 - Math.random() });
        for (var i = 0; i < topicsAmt; i++) {
            gameTopics[i] = topics[i];
        }

        return gameTopics;
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

    this.createNewTopics = function() {
        this.topics = generateTopics();
    };

    this.update = function(time) {
        for (var i = 0; i < this.users.length; i++) {
            game.users[i].checkUpdate(time);
        }
    };

    this.playerLike = function(index) {
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
    };

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
    };

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
        }

        if(this.headlines.length > 30) {
            this.headlines.pop();
        }
    };

    this.pushBestHeadline = function(post) {
        this.bestHeadlines.unshift(post);

        if(this.bestHeadlines.length > 10) {
            this.bestHeadlines.pop();
        }
    };

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
    };

    this.addNewTopics = function(scale) {
        topicsAmt = topicsAmt + scale;
        this.topics = generateTopics();
        this.collector.clearData();

        for (var i = 0; i < this.users.length; i++) {
            this.users[i].generateNewFeelings();
        }
    };
}

// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
var Headline =  require('../src/users/headline.js').Headline;
var UpgradeSystem = require('../src/users/upgrade.js').Upgrade;
var Vue = require('vue/dist/vue.common.js');

var app = electron.remote.app;
var appDir = jetpack.cwd(app.getAppPath());

var app = new Vue({
    el: "#app",
    data: {
        state: {
            start: 0,
            game: 1,
            stats: 0,
            dashboard: 0
        },
        user: {
            info: {
                first: 'Player',
                last: 'One'
            },
            headline: '',
            score: {
                likes: 0,
                comments: 0,
                users: 0,
                famePoints: 1000000
            }
        },
        time: 'Time',
        game: new Game(),
        data: null,
        pause: false,
        upgradeSystem: new UpgradeSystem(),
        upgrades: 0
    },
    methods: {
        startGame: function() {
            if (this.user.info.first && this.user.info.last) {
                this.moveState('game');
            }
        },
        moveState: function(state) {
            for(var name in this.state) {
                if (name === state) {
                    this.state[name] = true;
                }
                else {
                    this.state[name] = false;
                }
            }
        },
        submitHeadline: function() {
            var key = false;
            var userTopic;
            var headline = this.user.headline.toLowerCase();
            for (var i = 0; i < this.game.topics.length; i++) {
                var topic = this.game.topics[i];
                if(headline.includes(topic)) {
                    key = true;
                    userTopic = topic;
                    break;
                }
            }
            if (key) {
                var headline = new Headline(this.user.headline, this.user, userTopic, this.user.info, true);
                this.game.pushHeadline(headline, 'all', true);
                this.user.headline = '';
            }
            this.pause = false;
        },
        likePost: function(index) {
            this.game.playerLike(index);
        },
        dislikePost: function(index) {
            this.game.playerDislike(index);
        },
        addComment: function(index) {
            var headline = this.game.headlines[index];
            var comment = this.game.headlines[index].commentValue;

            this.game.headlines[index].addComment(comment, this.user);
            this.game.headlines[index].alertUser(comment);
            this.game.headlines[index].commentValue = '';
            this.pause = false;
        },
        resolvePic: function(pic) {
            if (pic) {
                var link = './img' + encodeURI(pic) + '.jpg';
            }
            else {
                var link = 'http://bulma.io/images/placeholders/96x96.png';
            }
            return link;
        }
    },
    mounted: function() {
        this.data = this.game.collector;
        var sec = 0;
        var pastLikes = 0;
        var pastComments = 0;
        function gameLoop() {
            if(!app.pause) {
                sec++;
                app.game.update(sec);
            }

            app.user.score.likes = 0;
            app.user.score.comments = 0;
            app.user.score.users = 0;
            for (var i = 0; i < app.game.userHeadlines.length; i++) {
                app.user.score.likes += app.game.userHeadlines[i].score;
                app.user.score.comments += app.game.userHeadlines[i].comments.length;
            }

            if (pastLikes !== app.user.score.likes && app.user.score.likes >= 0) {
                var dif = app.user.score.likes - pastLikes;
                var pointsToAdd = 1000*dif;
                app.user.score.famePoints += pointsToAdd;
                pastLikes = app.user.score.likes;
            }

            if (pastComments !== app.user.score.likes) {
                var dif = app.user.score.comments - pastComments;
                var pointsToAdd = 500*dif;
                app.user.score.famePoints += pointsToAdd;
                pastComments = app.user.score.comments;
            }

            window.requestAnimationFrame(gameLoop);
        }

        window.requestAnimationFrame(gameLoop);
    }
});

}());
//# sourceMappingURL=app.js.map