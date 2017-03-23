(function () {'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var os = require('os');
var electron = require('electron');
var jetpack = _interopDefault(require('fs-jetpack'));
var sentiment = _interopDefault(require('sentiment'));

// Simple wrapper exposing environment variables to rest of the code.

var env = jetpack.cwd(__dirname).read('env.json', 'json');

function HeadlineComment(comment, user) {
    this.comment = comment;
    this.user = user;
    this.commentName = user.info;
    this.score = 0;

    function like() {
        this.score++;
    }

    function dislike() {
        this.score--;
    }
}

function Headline(headline, user, topic) {
    this.headline = headline;
    this.user = user;
    this.postName = user.info;
    this.topic = topic;
    this.score = 0;
    this.comments = [];
    this.interacted = {};

    //function to add a user comment
    this.addComment = function(comment, name) {
        //Creates a new comment to push to comments
        var comment = new HeadlineComment(comment, name);
        //Pushing the comment to our comments array
        this.comments.push(comment);
    };

    //function to add to the posts score
    this.like = function() {
        this.score++;
    };

    //function to subtract from the posts score
    this.dislike = function() {
        this.score--;
    };
}

//import sentiment from sentiment;
var fs = require('fs');
var path = require('path');
var fFirstNames = fs.readFileSync(path.join(__dirname, 'female.txt')).toString().split("\n");
var mFirstNames = fs.readFileSync(path.join(__dirname, 'male.txt')).toString().split("\n");
var lastNames = fs.readFileSync(path.join(__dirname, 'family.txt')).toString().split("\n");

//Other classes needed
var sentence = require('../src/users/sentenceGeneration.js');

//Utilities
var rand10 = require('../src/utilities.js').rand10;
var headlineChance = require('../src/utilities.js').headlineChance;
var interactChance = require('../src/utilities.js').interactChance;
var commentChance = require('../src/utilities.js').commentChance;

//Sentiment
var sentimentAnalysis = require('sentiment');

//Basic class for user
function User(game) {
        //Age, sex, name
    this.info = generateInfo();
    this.game = game;
    var playerFeeling = rand10();
    var activityLevel = rand10();
    var aggression = rand10();
    var topicFeelings = generateTopicFeelings(this.game);

        //Their aggression level
        // this.aggression = generateAggression(agg);
        // //Their likes and dislikes in regards to current topics
        // this.preferences = generatePreferences(pref);
        // //How often they get on Headlinr
        // this.activityLevel = act;

    function generateInfo() {
        var sex = Math.floor((Math.random() * 2) + 1);
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

    function generateTopicFeelings(game) {
        var topics = {};

        for (var i = 0; i < game.topics.length; i++) {
            topics[game.topics[i]] = rand10();
        }
        return topics;
    }

    //Function exposed to game, determines when the user is checking the timeline
    this.checkUpdate = function(time) {
        //Checking users activity level, and seeing if it's time for them to comment
        if(time % (activityLevel*200)=== 0) {
            //Running function to check headlinr, passing game, and itself
            checkHeadlinr(this.game, this);
        }
    };

    //Function that runs everything involved in a users turn
    function checkHeadlinr(game, user) {
        //Function to read headlines
        checkHeadlines(game.headlines, user);
        //Function to create a headline
        createHeadline(game, user);
    }

    //Function for user to check new posts
    function checkHeadlines(headlines, user) {
        var userName = user.info.first+user.info.last;
        var postsToCheck = 0;
        //Checks the last 10 headlines
        if(headlines.length > 1) {

            if(headlines.length < 10) {
                postsToCheck = headlines.length;
            }
            else {
                postsToCheck = 10;
            }

            for (var i = 0; i < postsToCheck; i++) {
                //Read the headline, and determine the reaction to the headline
                var headline = headlines[i].headline;
                var topic = headlines[i].topic;
                var userFeeling = topicFeelings[topic];
                var sentiment$$1 = sentimentAnalysis(headline).score;

                if(sentiment$$1 === 0) {
                    console.log(headline);
                }

                if(!headlines[i].interacted[userName]) {
                    //Check if sentiment is positive
                    if(sentiment$$1 > 0) {
                        //If the user feels positively towards the topic, there's a chance to like
                        if(userFeeling > 5) {
                            var total = userFeeling + sentiment$$1;

                            if (total >= interactChance()) {
                                headlines[i].like();
                            }

                            if((total+aggression) >= commentChance()) {
                                headlines[i].addComment(sentence.affirm(), user);
                            }
                        }
                        //If the user feels negatively towards the topic, there's a chance to dislike
                        else {
                            //Add 5 to users feeling to simulate negative feeling
                            var total = (userFeeling + 5) + sentiment$$1;

                            if (total >= interactChance()) {
                                headlines[i].dislike();
                            }

                            if((total+aggression) >= commentChance()) {
                                headlines[i].addComment(sentence.deny(), user);
                            }
                        }
                    }
                    //If it's negative
                    else {
                        //If the user feels positively, there's a chance to dislike
                        if (userFeeling > 5) {
                            //Create a total, reverse the sentiment
                            var total = userFeeling + (-1 * sentiment$$1);

                            //React if it's greater than the interaction chance, and they haven't interacted before
                            if (total >= interactChance()) {
                                headlines[i].dislike();
                            }

                            if((total+aggression) >= commentChance()) {
                                headlines[i].addComment(sentence.deny(), user);
                            }
                        }
                        //If the user feels negatively also, there's a chance to like
                        else {
                            //Add 5 to users feeling to simulate negative feeling, reverse sentiment
                            var total = (userFeeling + 5) + (-1 * sentiment$$1);

                            if (total >= interactChance()) {
                                headlines[i].like();
                            }

                            if((total+aggression) >= commentChance()) {
                                headlines[i].addComment(sentence.affirm(), user);
                            }
                        }
                    }

                    headlines[i].interacted[userName] = 1;
                }
                // headlines[i].like();
                // headlines[i].addComment(user.info.first + ' commenting', user);
            }
        }
    }

    //Function for user to push a new headline
    function createHeadline(game, user) {
        if (aggression >= headlineChance()) {
            var topic = game.topics[rand10()-1];
            var feeling = topicFeelings[topic];
            var statement = sentence.generate(feeling, topic);

            //Creating a new headline
            var headline = new Headline(statement, user, topic);
            //
            game.pushHeadline(headline);
        }
    }

    //Determines User's Reaction to post given
    function react(statement, type) {
        for (var i = 0; i < game.headlines.length; i++) {

        }
        //var rating = sentiment(statement);
    }
}

var topics = ['cats', 'dogs', 'birth-control', 'the police', 'teachers', 'babies', 'white people', 'black people', 'asian people', 'latino people', 'purple people', 'fire fighters', 'hamsters', 'macaroni and cheese','kangaroos', 'politicians', 'hospitals', 'girlfriends', 'boyfriends', 'exercises', 'eating dinner', 'pool parties', 'scooters', 'skateboards', 'apples', 'oranges', 'hotdogs', 'hamburgers', 'fat people', 'skinny people', 'doors', 'houses', 'cigars', 'marijuana', 'bands', 'popcorn', 'sodas', 'movies', 'blind people', 'elephants', 'shoes', 'hippies', 'beards', 'eyeballs', 'hands', 'noses', 'farts', 'computers', 'hackers', 'men', 'women', 'actors', 'actresses', 'pencils', 'fries', 'fires', 'lights', 'cities', 'websites', 'imagination', 'hopes', 'dreams', 'subs', 'hamsters', 'keyboards', 'phones', 'moms', 'dads', 'grandparents', 'old people', 'millenials', 'wars', 'christians', 'muslims', 'liberals', 'rednecks', 'neo-nazis', 'snow-flakes', 'ducks'];

function Game() {
    var connections = 20;
    var that = this;
    this.headlines = [];
    this.topics = (function () {
        var gameTopics = [];
        topics.sort(function() { return 0.5 - Math.random() });
        for (var i = 0; i < 15; i++) {
            gameTopics[i] = topics[i];
        }

        return gameTopics;
    })();

    this.users = (function () {
        var usersArr = [];
        for (var i = 0; i < connections; i++) {
            usersArr.push(new User(that));
        }
        return usersArr;
    })();

    this.update = function(time) {
        for (var i = 0; i < connections; i++) {
            that.users[i].checkUpdate(time);
        }
    };

    this.pushHeadline = function(headline) {
        this.headlines.unshift(headline);

        if(this.headlines.length > 30) {
            this.headlines.pop();
        }
    };
}

// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
var Vue = require('vue/dist/vue.common.js');

var r1 = sentiment("Butts butts butts.");

var app = electron.remote.app;
var appDir = jetpack.cwd(app.getAppPath());
var newGame = new Game();

var app = new Vue({
    el: "#app",
    data: function() {
        return {
            user: {
                info: {
                    first: 'User',
                    last: 'Fuckface'
                },
                headline: ''
            },
            cat: 'Cats',
            game: new Game(),
            pause: false
        }
    },
    methods: {
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
                var headline = new Headline(this.user.headline, this.user, userTopic);
                this.game.pushHeadline(headline);
            }
            this.pause = false;
        },
        likePost: function(index) {
            if(this.game.headlines[index].isDisliked) {
                this.game.headlines[index].isDisliked = false;
                this.game.headlines[index].isLiked = true;
            }
            else {
                this.game.headlines[index].isLiked = true;
            }

            this.game.headlines[index].like();
        },
        dislikePost: function(index) {
            if(this.game.headlines[index].isLiked) {
                this.game.headlines[index].isLiked = false;
                this.game.headlines[index].isDisliked = true;
            }
            else {
                this.game.headlines[index].isDisliked = true;
            }

            this.game.headlines[index].dislike();
        },
        addComment: function(index) {
            var headline = this.game.headlines[index];
            var comment = this.game.headlines[index].commentValue;

            this.game.headlines[index].addComment(comment, this.user);
            this.game.headlines[index].commentValue = '';
            this.pause = false;
        },
        resolvePic: function(pic) {
            var link = './img' + encodeURI(pic) + '.jpg';
            return link;
        }
    },
    mounted: function() {
        var sec = 0;
        function gameLoop() {
            if(!app.pause) {
                sec++;
                app.game.update(sec);
            }
            window.requestAnimationFrame(gameLoop);
        }

        window.requestAnimationFrame(gameLoop);
    }
});

}());
//# sourceMappingURL=app.js.map