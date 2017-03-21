//import sentiment from sentiment;
var fs = require('fs');
var path = require('path');
var fFirstNames = fs.readFileSync(path.join(__dirname, 'female.txt')).toString().split("\n");
var mFirstNames = fs.readFileSync(path.join(__dirname, 'male.txt')).toString().split("\n");
var lastNames = fs.readFileSync(path.join(__dirname, 'family.txt')).toString().split("\n");
import Headline from './headline.js';

//Basic class for user
export default function User(game) {
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
    }

    this.checkUpdate = function(time) {
        if(time % (activityLevel*100)=== 0) {
            console.log(this.info.first + " is checking");
            checkHeadlinr(this.game, this.info);
            generateNextActivity();
        }
    };

    //Function that runs everything involved in a users turn
    function checkHeadlinr(game, info) {
        checkHeadlines(game.headlines, info);
        createHeadline(game, info);
    }

    //Function for user to check new posts
    function checkHeadlines(headlines, info) {
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
                console.log(headlines[i])
                //Read the headline, and determine the reaction to the headline
                if(headlines[i]) {
                    headlines[i].like();
                    headlines[i].addComment(info.first + ' commenting', info);
                }
            }
        }
    };

    //Function for user to push a new headline
    function createHeadline(game, info) {
        var headline = new Headline("My name is " + info.first, info);
        game.pushHeadline(headline, info);
    };

    //Determines User's Reaction to post given
    function react(statement, type) {
        for (var i = 0; i < game.headlines.length; i++) {

        }
        //var rating = sentiment(statement);
    };
}
