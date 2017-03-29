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

//Basic class for user
function User(game) {
        //Age, sex, name
    this.info = generateInfo();
    this.game = game;
    this.playerOpinion = rand10() * 5;
    var activityLevel = 700 + Math.floor((Math.random() * 500) + 1);
    var aggression = rand10();
    var topicFeelings = generateTopicFeelings(this.game);

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
        if(time % activityLevel=== 0) {
            //Running function to check headlinr, passing game, and itself
            checkHeadlinr(this.game, this);
        }
    };

    this.influence = function(val) {
        if (this.playerOpinion < 100 && this.playerOpinion > 0) {
            console.log(this.info.first, this.playerOpinion);
            this.playerOpinion += val;
        }
    };

    //Function that runs everything involved in a users turn
    function checkHeadlinr(game, user) {
        //Function to read headlines
        checkHeadlines(game.headlines, user, game);
        //Function to create a headline
        createHeadline(game, user);
    }

    //Function for user to check new posts
    function checkHeadlines(headlines, user, game) {
        var userName = user.info.first+user.info.last;
        var postsToCheck = 0;
        //Checks the last 10 headlines
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

            //Check if they've interacted with the post already
            if(!headlines[i].interacted[userName]) {
                var playerFactor = 0;
                var repeatFactor = 0;
                var player = false;
                if(headlines[i].playerCreated && game.userHeadlines.length > 2) {
                    playerFactor = user.playerOpinion/10;
                    player = true;
                    for(var j = game.userHeadlines.length-2; j > 0; j--) {
                        if (game.userHeadlines[j].topic === topic) {
                            console.log('repeat');
                            repeatFactor += 7;
                        }
                    }
                }
                //Check if sentiment is positive
                if (sentiment$$1 > 0 && userFeeling > 5) {
                    if (player) {
                        user.playerOpinion += rand10();
                        console.log('increase');
                    }
                    //If the user feels positively towards the topic, there's a chance to like
                    var total = userFeeling + sentiment$$1 + playerFactor - repeatFactor;
                    if (total >= interactChance()) {
                        headlines[i].like();
                    }

                    if((total+aggression) >= commentChance()) {
                        headlines[i].addComment(sentence.affirm(), user);
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
                        headlines[i].dislike();
                    }

                    if((total+aggression) >= commentChance()) {
                        headlines[i].addComment(sentence.deny(), user);
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
                        headlines[i].dislike();
                    }

                    if((total+aggression) >= commentChance()) {
                        headlines[i].addComment(sentence.deny(), user);
                    }
                }
                //If the user feels negatively also, there's a chance to like
                else {
                    if (player) {
                        user.playerOpinion += rand10();
                        console.log('increase');
                    }
                    //Add 5 to users feeling to simulate negative feeling, reverse sentiment
                    var total = (userFeeling + 5) + (-1 * sentiment$$1) + playerFactor - repeatFactor;

                    if (total >= interactChance()) {
                        headlines[i].like();
                    }

                    if((total+aggression) >= commentChance()) {
                        headlines[i].addComment(sentence.affirm(), user);
                    }
                }
                headlines[i].interacted[userName] = 1;
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
            var headline = new Headline$2(statement, user, topic);
            //
            game.pushHeadline(headline);
        }
    }
}

var Headline$1 = require('../src/users/headline.js').Headline;

var topics = ['cats', 'dogs', 'birth-control', 'the police', 'teachers', 'babies', 'white people', 'black people', 'asian people', 'latino people', 'purple people', 'fire fighters', 'hamsters', 'macaroni and cheese','kangaroos', 'politicians', 'hospitals', 'girlfriends', 'boyfriends', 'exercises', 'eating dinner', 'pool parties', 'scooters', 'skateboards', 'apples', 'oranges', 'hotdogs', 'hamburgers', 'fat people', 'skinny people', 'doors', 'houses', 'cigars', 'marijuana', 'bands', 'popcorn', 'sodas', 'movies', 'blind people', 'elephants', 'shoes', 'hippies', 'beards', 'eyeballs', 'hands', 'noses', 'farts', 'computers', 'hackers', 'men', 'women', 'actors', 'actresses', 'pencils', 'fries', 'fires', 'lights', 'cities', 'websites', 'imagination', 'hopes', 'dreams', 'subs', 'hamsters', 'keyboards', 'phones', 'moms', 'dads', 'grandparents', 'old people', 'millenials', 'wars', 'christians', 'muslims', 'liberals', 'rednecks', 'neo-nazis', 'snow-flakes', 'ducks'];

function Game() {
    var connections = 30;
    var that = this;
    this.headlines = [];
    this.userHeadlines = [];
    var topicsAmt = 20;
    this.topics = (function () {
        var gameTopics = [];
        topics.sort(function() { return 0.5 - Math.random() });
        for (var i = 0; i < topicsAmt; i++) {
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

    this.pushHeadline = function(headline, user) {
        this.headlines.unshift(headline);

        if(user) {
            this.userHeadlines.unshift(headline);
        }

        if(this.headlines.length > 30) {
            this.headlines.pop();
        }
    };
}

// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
var Headline =  require('../src/users/headline.js').Headline;
var Round = require('../src/users/round.js').Round;
var Vue = require('vue/dist/vue.common.js');

var app = electron.remote.app;
var appDir = jetpack.cwd(app.getAppPath());

var app = new Vue({
    el: "#app",
    data: {
        state: {
            start: 1,
            game: 0,
            stats: 0
        },
        rounds: new Round(),
        roundComplete: false,
        currentRound: 0,
        user: {
            info: {
                first: '',
                last: ''
            },
            headline: '',
            score: {
                likes: 0,
                likesReq: 1,
                comments: 0,
                commentsReq: 1,
                users: 0,
                usersReq: 1
            }
        },
        time: 'Time',
        game: new Game(),
        pause: false
    },
    methods: {
        startGame: function() {
            if (this.user.info.first && this.user.info.last) {
                this.moveState('game');
            }
        },
        checkRoundComplete: function() {
          if(this.user.score.likes >= this.user.score.likesReq && this.user.score.comments >= this.user.score.commentsReq && this.user.score.users >= this.user.score.usersReq) {
              this.roundComplete = true;
          }  
        },
        generateNewRound: function() {
            var reqs = this.rounds.generateRound();
            this.user.score.likesReq = reqs.likes;
            this.user.score.commentsReq = reqs.comments;
            this.user.score.usersReq = reqs.users;

            this.currentRound++;
            this.roundComplete = false;
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
                var headline = new Headline(this.user.headline, this.user, userTopic, true);
                this.game.pushHeadline(headline, true);
                this.user.headline = '';
            }
            this.pause = false;
        },
        likePost: function(index) {
            if(this.game.headlines[index].isDisliked) {
                this.game.headlines[index].isDisliked = false;
                this.game.headlines[index].isLiked = true;
                this.game.headlines[index].user.influence(10);
                this.game.headlines[index].like();
            }
            else if(this.game.headlines[index].isLiked) {
                this.game.headlines[index].isLiked = true;
            }
            else {
                this.game.headlines[index].isLiked = true;
                this.game.headlines[index].user.influence(10);
                this.game.headlines[index].like();
            }  
        },
        dislikePost: function(index) {
            if(this.game.headlines[index].isLiked) {
                this.game.headlines[index].isLiked = false;
                this.game.headlines[index].isDisliked = true;
                this.game.headlines[index].user.influence(-10);
                this.game.headlines[index].dislike();
            }
            else if (this.game.headlines[index].isDisliked) {
                this.game.headlines[index].isDisliked = true;
            }
            else {
                this.game.headlines[index].isDisliked = true;
                this.game.headlines[index].user.influence(-10);
                this.game.headlines[index].dislike();
            }
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
        this.generateNewRound();
        var sec = 0;
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

            for (var j = 0; j < app.game.users.length; j++) {
                if(app.game.users[j].playerOpinion > 50) {
                    app.user.score.users += 1;
                }
            }

            if(!app.roundComplete) {
                app.checkRoundComplete();
            }
            window.requestAnimationFrame(gameLoop);
        }

        window.requestAnimationFrame(gameLoop);
    }
});

}());
//# sourceMappingURL=app.js.map