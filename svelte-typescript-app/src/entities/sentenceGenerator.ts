const beginnings = [
    "I think",
    "I know",
    "I feel",
    "Everyone knows",
    "It's weird, ",
    "Ya know,",
    "Omg,",
    "You should know",
    "Woah,",
    "Yo",
    "Hey",
    "Uhh",
];

const badEndings = [
    "suck",
    "are the worst",
    "are terrible",
    "are dirty",
    "can stink",
    "are bad",
    "make <p> sick",
    "make <p> cry",
    "hurt babies",
    "destroyed the world",
    "are nonsense",
    "killed my parents",
    "ruined my relationship",
    "stole my friends",
    "gave me aids",
    "murder bunnies",
    "made <p> sad",
];

const goodEndings = [
    "are the best",
    "make <p> happy",
    "are cool",
    "make <p> smile",
    "give <p> hope",
    "fill <p> with glee",
    "are pretty chill",
    "make <p> joyous",
    "are super",
    "make everything better",
    "make the world better",
    "should be given an award",
    "created world peace",
];

const person = [
    "me",
    "us",
    "everyone",
    "people",
    "my friends",
    "my family",
    "my pets",
];

const getRandomWord = (wordArr: string[]) => {
    const rand = Math.ceil(Math.random() * (wordArr.length - 1));
    return wordArr[rand];
};

const generateFullSentence = (
    beginning: string,
    topic: string,
    ending: string
) => {
    const randomPerson = getRandomWord(person);
    return `${beginning} ${topic} ${ending.replace("<p>", randomPerson)}`;
};

const generateSmallSentence = (topic: string, ending: string) => {
    const randomPerson = getRandomWord(person);
    return `${topic} ${ending.replace("<p>", randomPerson)}`;
};

export const generate = function (feeling, topic) {
    const flip = Math.floor(Math.random() * 2 + 1);
    const beginning = getRandomWord(beginnings);
    if (feeling > 5) {
        const ending = getRandomWord(goodEndings);
        if (flip === 2) {
            return generateFullSentence(beginning, topic, ending);
        } else {
            topic = topic.charAt(0).toUpperCase() + topic.slice(1);
            return generateSmallSentence(topic, ending);
        }
    } else {
        const ending = getRandomWord(badEndings);
        if (flip === 2) {
            return generateFullSentence(beginning, topic, ending);
        } else {
            topic = topic.charAt(0).toUpperCase() + topic.slice(1);
            return generateSmallSentence(topic, ending);
        }
    }
};

const affirmations = [
    "Yeah",
    "Good",
    "Yes",
    "Better",
    "Awesome",
    "Love",
    "Great",
    "Fantastic",
    "woohoo",
    "Cowabunga",
    "Sweet",
    "Nice",
    "Agree",
    "Cool",
];

export const affirm = function () {
    return affirmations[Math.floor(Math.random() * affirmations.length)];
};

const denials = [
    "Terrible",
    "No",
    "Disagree",
    "Awful",
    "Nonsense",
    "Worst",
    "Stupid",
    "Nah",
    "Dumb",
    "Lame",
];

export const deny = function () {
    return denials[Math.floor(Math.random() * denials.length)];
};

export default {
    generate,
    affirm,
    deny,
};
