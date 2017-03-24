// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import env from './env';
import sentiment from 'sentiment';
import Game from './game.js';
var Headline =  require('../src/users/headline.js').Headline;
var Vue = require('vue/dist/vue.common.js');

var r1 = sentiment("Butts butts butts.");

var app = remote.app;
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
                var headline = new Headline(this.user.headline, this.user, userTopic)
                this.game.pushHeadline(headline);
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
                sec++
                app.game.update(sec);
            }
            window.requestAnimationFrame(gameLoop);
        }

        window.requestAnimationFrame(gameLoop);
    }
});
