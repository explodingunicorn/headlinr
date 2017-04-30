// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import sentiment from 'sentiment';
import Game from './game.js';
var Headline =  require('../src/users/headline.js').Headline;
var Player = require('../src/users/player.js').Player;
var UpgradeSystem = require('../src/users/upgrade.js').Upgrade;
var Vue = require('vue/dist/vue.common.js');
var Webcam = require('../src/webcam.js');

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
        headline: '',
        time: 'Time',
        game: new Game(),
        player: new Player(),
        data: null,
        pause: false,
        upgradeSystem: new UpgradeSystem(),
        upgrades: 0,
        takingPicture: false,
        editing: false,
        wordLimit: false,
        noTrend: false
    },
    methods: {
        attachCamera: function() {
            setTimeout(function() {
                Webcam.attach('#myCamera');
            }, 0)
        },
        takePicture: function() {
            var app = this;
            Webcam.snap( function(data_uri) {
				app.player.pic.link = data_uri;
                app.takingPicture = false;
			} );
        },
        startGame: function() {
            this.moveState('game');
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
            var headline = this.headline.toLowerCase()
            var len = headline.split(' ').length;
            if (len < 10) {
                var check = this.player.headline(headline, this);
            }
            else {
                this.wordLimit = true;
            }

            if(check) {
                this.headline = '';
                this.wordLimit = false;
                this.noTrend = false;
            }
        },
        likePost: function(index) {
            this.player.like(index);
        },
        dislikePost: function(index) {
            this.player.dislike(index);
        },
        addComment: function(index) {
            this.player.comment(index, this.user);
            this.pause = false;
        },
        changeTrends: function() {
            if (this.player.points > this.game.trendsCost) {
                this.game.addNewTrends('purchase');
                this.player.points = this.player.points - this.game.trendsCost;
            }
        },
        resolvePic: function(pic) {
            if (pic.link) {
                if (pic.type === 'player') {
                    var link = this.player.pic.link;
                }
                else {
                    var link = './img' + encodeURI(pic.link) + '.jpg';
                }
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
        this.data = this.game.collector;
        this.player = this.game.player;
        var sec = 0;
        var pastLikes = 0;
        var pastComments = 0;
        function gameLoop() {
            if(!app.pause) {
                sec++
                app.game.update(sec);
            }

            app.player.calculateCurrentPoints();

            window.requestAnimationFrame(gameLoop);
        }

        window.requestAnimationFrame(gameLoop);
    }
});
