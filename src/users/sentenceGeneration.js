var rita = require('rita');

var generator = RiGrammar();

var formatTextOpts = function(list) {
    var string = '';
    for (var i = 0; i < list.length; i++) {
        if (list.length - i === 1) {
            string += (list[i]);
            return string;
        }
        string += (list[i] + ' | ');
    }
}

var beginnings = ['I think', 'I know', 'I feel', 'Everyone knows', 'It\'s weird, ', 'Ya know,', 'Omg,', 'You should know', 'Woah,', 'Yo', 'Hey', 'Uhh'];
var possibleBeginnings = formatTextOpts(beginnings);

var badEndings = ['suck', 'are the worst', 'are terrible', 'are dirty', 'can stink', 'are bad', 'make <p> sick', 'make <p> cry', 'hurt babies', 'destroyed the world', 'are nonsense', 'killed my parents', 'ruined my relationship', 'stole my friends', 'gave me aids', 'murder bunnies', 'made <p> sad'];
var possibleBadEndings = formatTextOpts(badEndings);

var goodEndings = ['are the best', 'make <p> happy', 'are cool', 'make <p> smile', 'give <p> hope', 'fill <p> with glee', 'are pretty chill', 'make <p> joyous', 'are super', 'make everything better', 'make the world better', 'should be given an award', 'created world peace'];
var possibleGoodEndings = formatTextOpts(goodEndings);

var person = ['me', 'us', 'everyone', 'people', 'my friends', 'my family', 'my pets'];
var p = formatTextOpts(person);

generator.addRule('<start>', 'Rita init');
generator.addRule('<begin>', possibleBeginnings);
generator.addRule('<badEnd>', possibleBadEndings);
generator.addRule('<goodEnd>', possibleGoodEndings);
generator.addRule('<p>', p);

exports.generate = function(feeling, topic) {
    generator.removeRule('<start>');
    var flip = Math.floor((Math.random() * 2) + 1);
    if (feeling > 5) {
        if (flip === 2) {
            generator.addRule('<start>', '<begin> ' + topic + ' <goodEnd>');
        }
        else {
            topic = topic.charAt(0).toUpperCase() + topic.slice(1);
            generator.addRule('<start>',  topic + ' <goodEnd>');
        }
    }
    else {
        if (flip === 2) {
            generator.addRule('<start>', '<begin> ' + topic + ' <badEnd>');
        }
        else {
            topic = topic.charAt(0).toUpperCase() + topic.slice(1);
            generator.addRule('<start>',  topic + ' <badEnd>');
        }
    }

    return generator.expand();
}

var affirmations = ['Yeah', 'Good', 'Yes', 'Better', 'Awesome', 'Love', 'Great', 'Fantastic', 'woohoo', 'Cowabunga', 'Sweet', 'Nice', 'Agree', 'Cool'];

exports.affirm = function() {
    return affirmations[Math.floor(Math.random() * affirmations.length)];
};

var denials = ['Terrible', 'No', 'Disagree', 'Awful', 'Nonsense', 'Worst', 'Stupid', 'Nah', 'Dumb', 'Lame'];

exports.deny = function() {
    return denials[Math.floor(Math.random() * denials.length)];
};
