// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import sentiment from 'sentiment';
import Game from './game.js';
var Headline =  require('../src/users/headline.js').Headline;
var Round = require('../src/users/round.js').Round;
var Vue = require('vue/dist/vue.common.js');

var app = remote.app;
var appDir = jetpack.cwd(app.getAppPath());

var app = new Vue({
    el: "#app",
    data: {
        state: {
            start: 0,
            game: 1,
            stats: 0
        },
        rounds: new Round(),
        roundComplete: false,
        currentRound: 0,
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
                famePoints: 0
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
            var headline = this.user.headline.toLowerCase()
            for (var i = 0; i < this.game.topics.length; i++) {
                var topic = this.game.topics[i];
                if(headline.includes(topic)) {
                    key = true;
                    userTopic = topic;
                    break;
                }
            }
            if (key) {
                var headline = new Headline(this.user.headline, this.user, userTopic, true)
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
        var pastLikes = 0;
        var pastComments = 0;
        function gameLoop() {
            if(!app.pause) {
                sec++
                app.game.update(sec);
            }

            app.user.score.likes = 0;
            app.user.score.comments = 0;
            app.user.score.users = 0;
            for (var i = 0; i < app.game.userHeadlines.length; i++) {
                app.user.score.likes += app.game.userHeadlines[i].score;
                app.user.score.comments += app.game.userHeadlines[i].comments.length;
            }

            if (pastLikes !== app.user.score.likes) {
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
