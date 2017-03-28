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

//Basic class for user
export default function User(game) {
        //Age, sex, name
    this.info = generateInfo();
    this.game = game;
    this.playerOpinion = rand10() * 5;
    var activityLevel = rand10();
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
        if(time % (activityLevel*200)=== 0) {
            //Running function to check headlinr, passing game, and itself
            checkHeadlinr(this.game, this);
        }
    };

    this.influence = function(val) {
        if (this.playerOpinion < 100 && this.playerOpinion > 0) {
            console.log(this.info.first, this.playerOpinion);
            this.playerOpinion += val;
        }
    }

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
            var sentiment = sentimentAnalysis(headline).score;

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
                if (sentiment > 0 && userFeeling > 5) {
                    if (player) {
                        user.playerOpinion += rand10();
                        console.log('increase');
                    }
                    //If the user feels positively towards the topic, there's a chance to like
                    var total = userFeeling + sentiment + playerFactor - repeatFactor;
                    if (total >= interactChance()) {
                        headlines[i].like();
                    }

                    if((total+aggression) >= commentChance()) {
                        headlines[i].addComment(sentence.affirm(), user);
                    }
                }
                //If the user feels negatively towards the topic, there's a chance to dislike
                else if (sentiment > 0 && userFeeling <= 5) {
                    if (player) {
                        user.playerOpinion -= rand10();
                    }
                    //Add 5 to users feeling to simulate negative feeling
                    var total = (userFeeling + 5) + sentiment - playerFactor - repeatFactor;

                    if (total >= interactChance()) {
                        headlines[i].dislike();
                    }

                    if((total+aggression) >= commentChance()) {
                        headlines[i].addComment(sentence.deny(), user);
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
                    var total = (userFeeling + 5) + (-1 * sentiment) + playerFactor - repeatFactor;

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
    };

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
    };
}
