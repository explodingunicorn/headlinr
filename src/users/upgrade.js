trees = {
    connections: [
        {
            desc: 'Gain 10 more connections',
            scale: 10
        },
        {
            desc: 'Gain 20 more connections',
            scale: 20
        },
        {
            desc: 'Gain 50 more connections',
            scale: 50
        },
        {
            desc: 'Gain 200 more connections',
            scale: 200
        },
        {
            desc: 'Gain 1000 more connections',
            scale: 1000
        },
    ],

    trends: [
        {
            desc: 'Resetting Trends Costs 1000 points less',
            type: 'reduction',
            scale: 1000
        },
        {
            desc: 'Add 2 more Trends to the list',
            type: 'addition',
            scale: 2
        },
        {
            desc: 'Resetting Trends Costs 2000 points less',
            type: 'reduction',
            scale: 2000
        },
        {
            desc: 'Add 2 more Trends to the list',
            type: 'addition',
            scale: 2
        },
        {
            desc: 'Resetting Trends Costs 3000 points less',
            type: 'reduction',
            scale: 3000
        },
        {
            desc: 'Add 1 more Trends to the list',
            type: 'addition',
            scale: 1
        },
        {
            desc: 'Resetting Trends Costs 4000 points less',
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
        this[type+'Leveled'](currentBranch.scale, game);
    }

    this.connectionsLeveled = function(scale, game) {
        console.log('Leveled Connections');
        for (var i = 0; i < scale; i++) {
            game.addUser();
        }
    }

    this.trendsLeveled = function(scale, game) {
        console.log('Leveled Trends');
    }
}