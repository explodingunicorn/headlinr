import User from './users/user.js';
var Headline = require('../src/users/headline.js').Headline;

var topics = ['cats', 'dogs', 'birth-control', 'the police', 'teachers', 'babies', 'white people', 'purple people', 'fire fighters', 'hamsters', 'macaroni','kangaroos', 'politicians', 'hospitals', 'girlfriends', 'boyfriends', 'exercises', 'eating dinner', 'pool parties', 'scooters', 'skateboards', 'apples', 'oranges', 'hotdogs', 'hamburgers', 'fat people', 'skinny people', 'doors', 'houses', 'cigars', 'marijuanas', 'bands', 'popcorn', 'sodas', 'movies', 'blind people', 'elephants', 'shoes', 'hippies', 'beards', 'eyeballs', 'hands', 'noses', 'farts', 'computers', 'hackers', 'men', 'women', 'actors', 'actresses', 'pencils', 'fries', 'fires', 'lights', 'cities', 'websites', 'hopes', 'dreams', 'subs', 'hamsters', 'keyboards', 'phones', 'moms', 'dads', 'grandparents', 'old people', 'millenials', 'wars', 'christians', 'muslims', 'liberals', 'rednecks', 'neo-nazis', 'snow-flakes', 'ducks', 'colds', 'fevers', 'pancakes', 'boogers', 'white people', 'black people', 'red people', 'green people', 'televisions', 'haters', 'bugs', 'basketballs', 'sweatshirts', 'clothes', 'donuts', 'dinosaurs', 'bosses', 'co-workers', 'snakes'];

export default function Game() {
    var connections = 50;
    this.connectionsScale = 2;
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
        for (var i = 0; i < this.users.length; i++) {
            that.users[i].checkUpdate(time);
        }
    }

    this.pushHeadline = function(headline, user) {
        this.headlines.unshift(headline);

        if(user) {
            this.userHeadlines.unshift(headline);
        }

        if(this.headlines.length > 30) {
            this.headlines.pop();
        }
    }

    this.addUsers = function(scale) {
        var modeledScale = scale*100;
        var amountToAdd = modeledScale/this.users.length;
        for (var i = 0; i < this.users.length; i++) {
            this.users[i].generateMoreNames(amountToAdd);
            this.users[i].generateNewActivityLevel();
        }
        this.connectionsScale = this.users[0].names.length;
    }
}
