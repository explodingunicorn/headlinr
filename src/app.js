// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import env from './env';
import sentiment from 'sentiment';
import Game from './game.js';
var Vue = require('vue/dist/vue.common.js');

var r1 = sentiment("Butts butts butts.");

var app = remote.app;
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
            sec++
            app.game.update(sec);
            window.requestAnimationFrame(gameLoop);
        }

        window.requestAnimationFrame(gameLoop);
    }
});
