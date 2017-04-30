//import sentiment from sentiment;
var fs = require('fs');
var path = require('path');
var fFirstNames = fs.readFileSync(path.join(__dirname, 'female.txt')).toString().split("\n");
var mFirstNames = fs.readFileSync(path.join(__dirname, 'male.txt')).toString().split("\n");
var lastNames = fs.readFileSync(path.join(__dirname, 'family.txt')).toString().split("\n");

//Other classes needed
var Headline = require('../src/users/headline.js').Headline;
var sentence = require('../src/users/sentenceGeneration.js');

//Utilities
var rand10 = require('../src/utilities.js').rand10;
var headlineChance = require('../src/utilities.js').headlineChance;
var interactChance = require('../src/utilities.js').interactChance;
var commentChance = require('../src/utilities.js').commentChance;

//Sentiment
var sentimentAnalysis = require('sentiment');

//Basic class for user, a user represents multiple connections
export default function User(game, group) {
        //Age, sex, name
    var sex = Math.floor(Math.random() * 10);
    this.names = (function() {
        var arr = [];
        arr.push(generateName());
        arr.push(generateName());
        return arr;
    })();
    this.game = game;
    this.group = group;
    this.playerOpinion = rand10() * 5;
    var activityLevel = 800 + Math.floor((Math.random() * 300) + 1);
    var scaleReacts = 1;
    var aggression = rand10();
    console.log(aggression);
    this.pic = {
        type: 'user',
        link: ''
    }
    if (sex > 4) {
        this.pic.link = '/boys/boy (' + Math.floor((Math.random() * 60) + 1) + ')';
        console.log('boy');
    } else {
        this.pic.link = '/girls/girl (' + Math.floor((Math.random() * 60) + 1) + ')';
        console.log('girl');
    }
    var self = this;

    function generateName() {
        var randFirstF = Math.floor((Math.random() * fFirstNames.length) + 1);
        var randFirstM = Math.floor((Math.random() * mFirstNames.length) + 1);
        var randLast = Math.floor((Math.random() * lastNames.length) + 1);
        var name = {};
        name.pic = {
            type: 'user'
        };
        if (sex > 4) {
            name.first = mFirstNames[randFirstM];
            name.pic.link = '/boys/boy (' + Math.floor((Math.random() * 60) + 1) + ')';
        } else {
            name.first = fFirstNames[randFirstF];
            name.pic.link = '/girls/girl (' + Math.floor((Math.random() * 60) + 1) + ')';
        }
        name.last = lastNames[randLast];

        return name;
    }

    this.generateTopicFeelings = function() {
        var trends = {};

        for (var i = 0; i < this.game.trends.length; i++) {
            trends[this.game.trends[i]] = rand10();
        }
        return trends;
    }

    this.generateNewFeelings = function() {
        trendFeelings = this.generateTopicFeelings();
    }

    var trendFeelings = this.generateTopicFeelings();

    this.generateMoreNames = function(num) {
        if(num<1000) {
            for(var i = 0; i < num; i++) {
                this.names.push(generateName());
            }
        }
    }

    this.generateNewActivityLevel = function() {
        var sub;
        if (this.names.length > 100) {
            if(activityLevel < 100) {
                scaleReacts += 8;
            }
            else {
                activityLevel = activityLevel - 150
                console.log(activityLevel);
            }
        }
        else {
            activityLevel = activityLevel - (this.names.length * 5);
            scaleReacts += 1;
            console.log(activityLevel);
        }
        console.log(this.names.length);
    }

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
    }

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
            var trend = headlines[i].trend;
            var userFeeling = trendFeelings[trend];
            var sentiment = headlines[i].sentimentScore;
            var playerFactor = 0;
            var repeatFactor = 0;
            var player = false;
            var scale = 1;

            if(headlines[i].playerCreated) {
                playerFactor = user.playerOpinion/10;
                player = true;
                scale = scaleReacts;
                if(game.userHeadlines.length > 1) {
                    for(var j = game.userHeadlines.length-2; j >= 0; j--) {
                        if (game.userHeadlines[j].trend === trend) {
                            repeatFactor += 4;
                        }
                    }
                }
            }
            //Check if sentiment is positive
            if (sentiment > 0 && userFeeling > 5) {
                if (player) {
                    user.playerOpinion += rand10();
                }
                //If the user feels positively towards the trend, there's a chance to like
                var total = userFeeling + sentiment + playerFactor - repeatFactor;
                if (total >= interactChance()) {
                    headlines[i].like(scale);
                }

                if((total+aggression) >= commentChance()) {
                    headlines[i].addComment(sentence.affirm(), user, name);
                }
            }
            //If the user feels negatively towards the trend, there's a chance to dislike
            else if (sentiment > 0 && userFeeling <= 5) {
                if (player) {
                    user.playerOpinion -= rand10();
                }
                //Add 5 to users feeling to simulate negative feeling
                var total = (userFeeling + 5) + sentiment - playerFactor - repeatFactor;

                if (total >= interactChance()) {
                    headlines[i].dislike(scale);
                }

                if((total+aggression) >= commentChance()) {
                    headlines[i].addComment(sentence.deny(), user, name);
                }
            }
            //If it's negative
            else if (sentiment <= 0 && userFeeling > 5) {
                if (player) {
                    user.playerOpinion -= rand10();
                }
                //If the user feels positively, there's a chance to dislike
                //Create a total, reverse the sentiment
                var total = (userFeeling + 5) + (-1 * sentiment) - playerFactor - repeatFactor;

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
                var total = (userFeeling + 5) + (-1 * sentiment) + playerFactor - repeatFactor;

                if (total >= interactChance()) {
                    headlines[i].like(scale);
                }

                if((total+aggression) >= commentChance()) {
                    headlines[i].addComment(sentence.affirm(), user, name);
                }
            }
        }
    };

    //Function for user to push a new headline
    function createHeadline(game, user, name) {
        if (aggression >= headlineChance()) {
            var trend = game.trends[Math.floor(Math.random() * game.trends.length)];
            var feeling = trendFeelings[trend];
            var statement = sentence.generate(feeling, trend);

            //Creating a new headline
            var headline = new Headline(statement, user, trend, name);
            //
            game.pushHeadline(headline, self.group);
        }
    };
}
