var headline = 35;
var interaction = 5;
var comment = 120;

exports.rand10 = function () {
    return Math.floor((Math.random() * 10) + 1);
}

exports.headlineChance = function () {
    return Math.floor((Math.random() * headline) + 1);
}

exports.interactChance = function () {
    return Math.floor((Math.random() * interaction) + 1);
}

exports.commentChance = function() {
    return Math.floor((Math.random() * comment) + 1);
}
