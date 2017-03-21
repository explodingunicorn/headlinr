(function () {'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var os = require('os');
var electron = require('electron');
var jetpack = _interopDefault(require('fs-jetpack'));
var sentiment = _interopDefault(require('sentiment'));

// Simple wrapper exposing environment variables to rest of the code.

// The variables have been written to `env.json` by the build process.
var env = jetpack.cwd(__dirname).read('env.json', 'json');

function HeadlineComment(comment, name) {
    this.comment = comment;
    this.commentName = name;
    this.score = 0;

    function like() {
        this.score++;
    }

    function dislike() {
        this.score--;
    }
}

function Headline(headline, name, topic) {
    this.headline = headline;
    this.postName = name;
    this.topic = topic;
    this.score = 0;
    this.comments = [];

    //function to add a user comment
    function addComment(comment) {
        var comment = new HeadlineComment(comment, name);
        this.comments.push(comment);
    }

    //function to add to the posts score
    this.like = function() {
        console.log('upvote');
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
//Basic class for user
function User(game) {
        //Age, sex, name
    this.info = generateInfo();
    this.game = game;
    var activityLevel = Math.floor((Math.random() * 10) + 5);

        //Their aggression level
        // this.aggression = generateAggression(agg);
        // //Their likes and dislikes in regards to current topics
        // this.preferences = generatePreferences(pref);
        // //How often they get on Headlinr
        // this.activityLevel = act;

    function generateInfo() {
        var sex = Math.floor((Math.random() * 20) + 5);
        var randFirstF = Math.floor((Math.random() * fFirstNames.length) + 1);
        var randFirstM = Math.floor((Math.random() * mFirstNames.length) + 1);
        var randLast = Math.floor((Math.random() * lastNames.length) + 1);

        var name = {};

        if (sex === 1) {
            name.first = mFirstNames[randFirstM];
        } else {
            name.first = fFirstNames[randFirstF];
        }
        name.last = lastNames[randLast];

        return name;
    }

    var generateNextActivity = function() {
        activityLevel = Math.floor((Math.random() * 10) + 5);
    };

    this.checkUpdate = function(time) {
        if(time % (activityLevel*100)=== 0) {
            console.log(this.info.first + " is checking");
            checkHeadlinr(this.game, this.info);
            generateNextActivity();
        }
    };

    //Function that runs everything involved in a users turn
    function checkHeadlinr(game, info) {
        checkHeadlines(game.headlines);
        createHeadline(game, info);
    }

    //Function for user to check new posts
    function checkHeadlines(headlines) {
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
                console.log(headlines[i]);
                //Read the headline, and determine the reaction to the headline
                if(headlines[i]) {
                    headlines[i].like();
                }
            }
        }
    }

    //Function for user to push a new headline
    function createHeadline(game, info) {
        var headline = new Headline("My name is " + info.first, name);
        game.pushHeadline(headline, info);
    }

    //Determines User's Reaction to post given
    function react(statement, type) {
        for (var i = 0; i < game.headlines.length; i++) {

        }
        //var rating = sentiment(statement);
    }
}

function Game() {
    var connections = 20;
    var that = this;
    this.headlines = [];
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

    this.pushHeadline = function(headline, name) {
        this.headlines.unshift(headline);

        if(this.headlines.length > 30) {
            this.headlines.pop();
            console.log('popped');
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
            cat: 'Cats',
            game: new Game(),
        }
    },
    methods: {

    },
    mounted: function() {
        var sec = 0;
        function gameLoop() {
            sec++;
            app.game.update(sec);
            window.requestAnimationFrame(gameLoop);
        }

        window.requestAnimationFrame(gameLoop);
    }
});

}());
//# sourceMappingURL=app.js.map