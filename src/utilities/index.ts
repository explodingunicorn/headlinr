var headline = 35;
var interaction = 5;
var comment = 120;

export const rand10 = function () {
    return Math.floor(Math.random() * 10 + 1);
};

export const headlineChance = function () {
    return Math.floor(Math.random() * headline + 1);
};

export const interactChance = function () {
    return Math.floor(Math.random() * interaction + 1);
};

export const commentChance = function () {
    return Math.floor(Math.random() * comment + 1);
};
