import { User } from "./user";
import { Player } from "./player";
import { DataCollector } from "./dataCollector";
import trends from "../data/trends";

export default class Game {
    private G = this;
    private connections = 50;
    private trendsAmt = 10;

    public player = new Player(this);
    public collector = new DataCollector(this);

    public totalConnections = 50;
    public headlines = [];
    private userHeadlines = [];
    private bestHeadlines = [];

    public trends = this.generateTrends();
    public trendsCost = 30000;
    private postsToRead = 5;
    public visualsUnlocked = {
        posts: false,
        likes: false,
        comments: false,
        feelings: false,
        topPosts: false,
    };

    private automation = {
        like: 0,
        likeCount: 0,
        comment: 0,
        commentCount: 0,
        headline: false,
        headlineCount: 0,
    };

    private userGroupQueues = (function () {
        const arr = [];
        for (let i = 0; i < 5; i++) {
            arr[i] = [];
        }

        return arr;
    })();

    private users = (function (game: Game) {
        const usersArr = [];
        const groupCount = game.userGroupQueues.length;
        for (let i = 0; i < game.connections / groupCount; i++) {
            for (let j = 0; j < groupCount; j++) {
                usersArr.push(new User(game, j));
            }
        }
        return usersArr;
    })(this.G);

    constructor() {}

    private generateTrends() {
        const gameTrends = [];
        trends.sort(function () {
            return 0.5 - Math.random();
        });
        for (let i = 0; i < this.trendsAmt; i++) {
            gameTrends[i] = trends[i];
        }

        return gameTrends;
    }

    public createNewTrends() {
        this.trends = this.generateTrends();
    }

    public update(time) {
        for (let i = 0; i < this.users.length; i++) {
            this.users[i].checkUpdate(time);
        }

        if (this.automation.headline) {
            if (time % this.automation.headlineCount === 0) {
                this.player.headline();
            }
        }
    }

    private checkAutomation() {
        //Check if like is activated
        if (this.automation.like) {
            this.automation.likeCount++;

            if (this.automation.like === this.automation.likeCount) {
                this.player.like(0);
                this.automation.likeCount = 0;
            }
        }

        if (this.automation.comment) {
            this.automation.commentCount++;

            if (this.automation.comment === this.automation.commentCount) {
                this.player.comment(0);
                this.automation.commentCount = 0;
            }
        }
    }

    public pushHeadline = function (headline, group, user) {
        this.collector.pushNewHeadline(headline);
        //If a user is posting, post to all groups
        if (group === "all") {
            for (let i = 0; i < this.userGroupQueues.length; i++) {
                this.userGroupQueues[i].unshift(headline);

                if (this.userGroupQueues[i].length > this.postsToRead) {
                    this.userGroupQueues[i].pop();
                }
            }
        }
        //Otherwise post to the respective group
        else {
            this.userGroupQueues[group].unshift(headline);

            if (this.userGroupQueues[group].length > this.postsToRead) {
                this.userGroupQueues[group].pop();
            }
        }
        //Also post it to the collective group for the user to view all posts
        this.headlines.unshift(headline);

        //If the user is posting push it to the users headlines as well
        if (user) {
            this.userHeadlines.unshift(headline);

            if (this.userHeadlines.length > 20) {
                this.userHeadlines.pop();
            }
        }

        //Pop off the 30th post so the timeline isn't infinite
        if (this.headlines.length > 30) {
            this.headlines.pop();
        }

        this.checkAutomation();
    };

    private pushBestHeadline(post) {
        this.bestHeadlines.unshift(post);

        if (this.bestHeadlines.length > 10) {
            this.bestHeadlines.pop();
        }
    }

    private addUsers(scale) {
        const modeledScale = scale * 100;
        console.log(modeledScale);
        if (scale < 10) {
            this.postsToRead++;
        } else {
            this.postsToRead += 8;
        }
        const amountToAdd = modeledScale / this.users.length;
        for (let i = 0; i < this.users.length; i++) {
            this.users[i].generateMoreNames(amountToAdd);
            this.users[i].generateNewActivityLevel();
        }
        this.totalConnections = this.totalConnections + modeledScale;
    }

    private reduceTrendsCost(scale) {
        this.trendsCost = this.trendsCost - scale;
    }

    public addNewTrends(scale, points) {
        if (scale !== "purchase") {
            this.trendsAmt = this.trendsAmt + scale;
        }
        this.trends = this.generateTrends();
        this.collector.clearData();

        for (let i = 0; i < this.users.length; i++) {
            this.users[i].generateNewFeelings();
        }
    }

    public addVisual(type) {
        this.visualsUnlocked[type] = true;
    }

    public addAutomation(type, scale) {
        console.log(type, scale);
        if (type !== "headline") {
            this.automation[type] = scale;
            this.automation[type + "Count"] = 0;
        } else {
            this.automation[type] = true;
            this.automation[type + "Count"] = scale;
        }
    }
}
