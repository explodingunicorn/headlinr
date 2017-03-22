import User from './users/user.js';
import Headline from './users/headline.js'

export default function Game() {
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
    }

    this.pushHeadline = function(headline) {
        this.headlines.unshift(headline);

        if(this.headlines.length > 30) {
            this.headlines.pop();
            console.log('popped');
        }
    }
}

var topics = ['cats', 'dogs', 'birth-control', 'the police', 'teachers', 'babies', 'the color purple', 'the color green', 'the color red', 'the color blue', 'the color orange', 'white people', 'black people', 'asian people', 'latino people', 'purple people', 'fire fighters', 'hamsters', 'macaroni and cheese', 'kangaroos', 'politicians', 'hospitals', 'girlfriends', 'boyfriends', 'exercising', 'eating dinner', 'pool parties', 'scooters', 'skateboards'];
