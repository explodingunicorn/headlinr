trees = {
    connections: [
        {
            desc: 'Gain 150 more connections',
            scale: 1.5,
            cost: 50000
        },
        {
            desc: 'Gain 200 more connections',
            scale: 2,
            cost: 70000
        },
        {
            desc: 'Gain 600 more connections',
            scale: 6,
            cost: 100000
        },
        {
            desc: 'Gain 1000 more connections',
            scale: 10,
            cost: 130000
        },
        {
            desc: 'Gain 8000 more connections',
            scale: 80,
            cost: 180000
        },
        {
            desc: 'Gain 20000 more connections',
            scale: 200,
            cost: 250000
        },
        {
            desc: 'Gain 50000 more connections',
            scale: 500,
            cost: 500000
        },
        {
            desc: 'Gain 120000 more connections',
            scale: 1200,
            cost: 2000000
        },
        {
            desc: 'Gain 400000 more connections',
            scale: 4000,
            cost: 100000000
        },
        {
            desc: 'Gain 400000 more connections',
            scale: 4000,
            cost: 300000000
        },
    ],

    trends: [
        {
            desc: 'Resetting Trends Costs 2000 points less',
            type: 'reduction',
            scale: 2000,
            cost: 50000
        },
        {
            desc: 'Add 1 more Trends to the list. Also resets the trends.',
            type: 'addition',
            scale: 1,
            cost: 100000
        },
        {
            desc: 'Resetting Trends Costs 3000 points less',
            type: 'reduction',
            scale: 3000,
            cost: 300000
        },
        {
            desc: 'Add 2 more Trends to the list. Also resets the trends.',
            type: 'addition',
            scale: 2,
            cost: 600000
        },
        {
            desc: 'Resetting Trends Costs 4000 points less',
            type: 'reduction',
            scale: 4000,
            cost: 1000000
        },
        {
            desc: 'Add 3 more Trends to the list. Also resets the trends.',
            type: 'addition',
            scale: 3,
            cost: 2000000
        },
        {
            desc: 'Resetting Trends Costs 5000 points less',
            type: 'reduction',
            scale: 5000,
            cost: 10000000
        },
        {
            desc: 'Add 4 more Trends to the list. Also resets the trends.',
            type: 'addition',
            scale: 4,
            cost: 100000000
        },
    ],
    dashboard: [
        {
            desc: "Unlock the 'Amount of Posts' visualizer",
            type: 'posts',
            cost: 100000
        },
        {
            desc: "Unlock the 'Average Likes/Dislikes' visualizer",
            type: 'likes',
            cost: 500000
        },
        {
            desc: "Unlock the 'Average Comments' visualizer",
            type: 'comments',
            cost: 1000000
        },
        {
            desc: "Unlock the 'Average Feelings' visualizer",
            type: 'feelings',
            cost: 10000000
        },
        {
            desc: "Unlock the 'Top Liked/Disliked Posts' visualizer",
            type: 'topPosts',
            cost: 100000000
        },
    ],
    automation: [
        {
            desc: "Automatically 'Like' every 10th post",
            type: 'like',
            scale: 10,
            cost: 50000,
        },
        {
            desc: "Automatically 'Comment' on every 10th post",
            type: 'comment',
            scale: 10,
            cost: 100000,
        },
        {
            desc: "Automatically 'Post' Headlines once in a while",
            type: 'headline',
            scale: 1200,
            cost: 200000,
        },
        {
            desc: "Automatically 'Like' every 5th post",
            type: 'like',
            scale: 5,
            cost: 10000000,
        },
        {
            desc: "Automatically 'Comment' on every 5th post",
            type: 'comment',
            scale: 5,
            cost: 20000000,
        },
        {
            desc: "Automatically 'Post' Headlines sometimes",
            type: 'headline',
            scale: 800,
            cost: 100000000,
        },
        {
            desc: "Automatically 'Like' every 2nd post",
            type: 'like',
            scale: 2,
            cost: 200000000,
        },
        {
            desc: "Automatically 'Comment' on every 2nd post",
            type: 'comment',
            scale: 2,
            cost: 300000000,
        },
        {
            desc: "Automatically 'Post' Headlines pretty often",
            type: 'headline',
            scale: 300,
            cost: 500000000,
        },
        {
            desc: "Automatically 'Like' every post",
            type: 'like',
            scale: 1,
            cost: 600000000,
        },
        {
            desc: "Automatically 'Comment' on every post",
            type: 'comment',
            scale: 1,
            cost: 700000000,
        },
        {
            desc: "Automatically 'Post' Headlines all the time, everyday",
            type: 'headline',
            scale: 100,
            cost: 1000000000,
        },
    ]
};

exports.Upgrade = function() {
    this.connectionsLevel = 0;
    this.connectionsText = trees.connections[this.connectionsLevel].desc;
    this.connectionsCost = trees.connections[this.connectionsLevel].cost;
    this.connectionsDone = false;

    this.trendsLevel = 0;
    this.trendsText = trees.trends[this.trendsLevel].desc;
    this.trendsCost = trees.trends[this.trendsLevel].cost;
    this.trendsDone = false;

    this.dashboardLevel = 0;
    this.dashboardText = trees.dashboard[this.dashboardLevel].desc;
    this.dashboardCost = trees.dashboard[this.dashboardLevel].cost;
    this.dashboardDone = false;

    this.automationLevel = 0;
    this.automationText = trees.automation[this.automationLevel].desc;
    this.automationCost = trees.automation[this.automationLevel].cost;
    this.automationDone = false;

    this.upgrade = function(type, game, player) {
        if(trees[type][this[type+'Level']].cost <= player.points) {
            //Subtract the cost from the users points
            player.points = player.points - trees[type][this[type+'Level']].cost;

            //Select the current branch, and level from the tree
            var currentBranch = trees[type][this[type+'Level']]

            //Level the selected branch;
            this[type+'Level']++
            
            //Saving a variable for the new level
            var newBranch = trees[type][this[type+'Level']]

            //If a new branch is there to be selected set a new description and cost
            if(newBranch) {
                this[type+'Text'] = newBranch.desc;
                this[type+'Cost'] = newBranch.cost;
                //Run the correct function that contacts the game to make the correct changes
            }
            else {
                this[type+'Text'] = "Branch finished!";
                this[type+'Done'] = true;
            }

            this[type+'Leveled'](currentBranch, game);
        }
    }

    this.connectionsLeveled = function(branch, game) {
        game.addUsers(branch.scale);
    }

    this.trendsLeveled = function(branch, game) {
        if(branch.type === 'addition') {
            game.addNewTrends(branch.scale);
        }
        else {
            game.reduceTrendsCost(branch.scale);
        }
    }

    this.dashboardLeveled = function(branch, game) {
        game.addVisual(branch.type);
    }

    this.automationLeveled = function(branch, game) {
        game.addAutomation(branch.type, branch.scale);
    }
}