// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import sentiment from 'sentiment';
import Game from './game.js';
var Headline =  require('../src/users/headline.js').Headline;
var UpgradeSystem = require('../src/users/upgrade.js').Upgrade;
var Vue = require('vue/dist/vue.common.js');

var app = remote.app;
var appDir = jetpack.cwd(app.getAppPath());

var app = new Vue({
    el: "#app",
    data: {
        state: {
            start: 1,
            game: 0,
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
                famePoints: 9999999999
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
            var headline = this.user.headline.toLowerCase()
            var len = headline.split(' ').length;
            if (len < 10) {
                var check = this.game.playerHeadline(headline);
            }

            if(check) {
                this.user.headline = '';
            }
        },
        likePost: function(index) {
            this.game.playerLike(index);
        },
        dislikePost: function(index) {
            this.game.playerDislike(index);
        },
        addComment: function(index) {
            this.game.playerComment(index, this.user);
            this.pause = false;
        },
        changeTrends: function() {
            if (this.user.score.famePoints > this.game.trendsCost) {
                this.game.addNewTrends('purchase');
                this.user.score.famePoints = this.user.score.famePoints - this.game.trendsCost;
            }
        },
        resolvePic: function(pic) {
            if (pic) {
                var link = './img' + encodeURI(pic) + '.jpg';
            }
            else {
                var link = 'http://bulma.io/images/placeholders/96x96.png';
            }
            return link;
        },
        formatNum: function(x) {
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    },
    mounted: function() {
        this.game.newPlayer(this.user);
        this.data = this.game.collector;
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

            app.user.score.likes = app.game.playerScore;
            app.user.score.comments = app.game.playerComments;

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
