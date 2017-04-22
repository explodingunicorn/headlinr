trees = {
    connections: [
        {
            desc: 'Gain 100 more connections',
            scale: 1
        },
        {
            desc: 'Gain 200 more connections',
            scale: 2
        },
        {
            desc: 'Gain 600 more connections',
            scale: 6
        },
        {
            desc: 'Gain 1000 more connections',
            scale: 10
        },
        {
            desc: 'Gain 8000 more connections',
            scale: 80
        },
        {
            desc: 'Gain 20000 more connections',
            scale: 200
        },
        {
            desc: 'Gain 50000 more connections',
            scale: 500
        },
        {
            desc: 'Gain 120000 more connections',
            scale: 1200
        },
        {
            desc: 'Gain 400000 more connections',
            scale: 4000
        },
    ],

    trends: [
        {
            desc: 'Resetting Trends Costs 5000 points less',
            type: 'reduction',
            scale: 1000
        },
        {
            desc: 'Add 2 more Trends to the list',
            type: 'addition',
            scale: 2
        },
        {
            desc: 'Resetting Trends Costs 5000 points less',
            type: 'reduction',
            scale: 2000
        },
        {
            desc: 'Add 2 more Trends to the list',
            type: 'addition',
            scale: 2
        },
        {
            desc: 'Resetting Trends Costs 5000 points less',
            type: 'reduction',
            scale: 3000
        },
        {
            desc: 'Add 1 more Trends to the list',
            type: 'addition',
            scale: 1
        },
        {
            desc: 'Resetting Trends Costs 5000 points less',
            type: 'reduction',
            scale: 4000
        },
        {
            desc: 'Add 1 more Trends to the list',
            type: 'addition',
            scale: 1
        },
    ]
};

exports.Upgrade = function() {
    this.connectionsLevel = 0;
    this.connectionsText = trees.connections[this.connectionsLevel].desc;
    this.trendsLevel = 0;
    this.trendsText = trees.trends[this.trendsLevel].desc;

    this.upgrade = function(type, game) {
        this[type+'Level']++
        var currentBranch = trees[type][this[type+'Level']-1]
        var newBranch = trees[type][this[type+'Level']]
        if(newBranch) {
            this[type+'Text'] = newBranch.desc;
        }
        this[type+'Leveled'](currentBranch, game);
    }

    this.connectionsLeveled = function(branch, game) {
        console.log('Leveled Connections');
        game.addUsers(branch.scale);
    }

    this.trendsLeveled = function(branch, game) {
        console.log('Leveled Trends');
        if(branch.type === 'addition') {
            game.addNewTopics(branch.scale);
        }
        else {
            console.log('Make price less');
        }
    }
}