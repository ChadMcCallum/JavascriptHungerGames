var runner = {};

runner.Players = [];
runner.init = function () {
    var template = _.template($('#rowtemplate').html());
    var i = 1;
    _.each(players, function(player) {
        var p = {
            food: 300 * players.length - 1,
            reputation: 0,
            instance: player,
            id: i++,
            totalHunts: 0,
            totalSlacks: 0
        };
        runner.Players.push(p);
        $('.container').append(template(p));
    });
}

runner.round = function(i) {
    log("Starting Round " + (i + 1), "bg-primary");
    //bonus hunt value
    var m = Math.round(Math.random() * ((runner.Players.length * (runner.Players.length - 1)) - 1) + 1);
    log("Bonus threshhold: " + m, "bg-info");
    //randomize hunt order
    var randomPlayers = _.shuffle(runner.Players);
    var randomNames = _.reduce(randomPlayers, function (memo, p) { return memo + p.instance.name + ", "; }, "");
    log("Random hunt order for this round: " + randomNames, "bg-info");
    //get each player's choices
    _.each(runner.Players, function (player) {
        var hunts = _.reject(randomPlayers, function (rand) { return rand.id == player.id });
        var huntReps = _.pluck(hunts, 'reputation');
        player.huntChoices = player.instance.huntChoices(i, player.food, player.reputation, m, huntReps);
        log("Player " + player.instance.name + "'s hunt choices: " + _.reduce(player.huntChoices, function (memo, choice) { return memo + choice + ", "; }, ""), "bg-success");
    });
    //calculate individual results
    var k = 0;
    _.each(runner.Players, function (player) {
        player.totalHunts += _.reduce(player.huntChoices, function (memo, choice) { return memo + (choice == 'h' ? 1 : 0); }, 0);
        player.totalSlacks += _.reduce(player.huntChoices, function (memo, choice) { return memo + (choice == 's' ? 1 : 0); }, 0);
        player.reputation = player.totalHunts / (player.totalHunts + player.totalSlacks);
        log("Player " + player.instance.name + "'s reputation: " + player.reputation, "bg-info");
        var foodEarnings = [];
        var hunts = _.reject(randomPlayers, function (rand) { return rand.id == player.id });
        for (var j = 0; j < hunts.length; j++) {
            var playerChoice = player.huntChoices[j];
            var coworkerChoiceIndex = k == 0 ? 0 : (j < k ? k - 1 : k);
            var coworkerChoice = hunts[j].huntChoices[coworkerChoiceIndex];
            if (playerChoice == 'h') {
                player.food -= 6;
            } else {
                player.food -= 2;
            }
            if (playerChoice == 'h' && coworkerChoice == 'h') {
                foodEarnings.push(6);
                player.food += 6;
            } else if (playerChoice == 'h' || coworkerChoice == 'h') {
                foodEarnings.push(3);
                player.food += 3;
            } else {
                foodEarnings.push(0);
            }
        }
        player.instance.huntOutcomes(foodEarnings);
        log("Player " + player.instance.name + "'s hunt outcomes: " + _.reduce(foodEarnings, function (memo, choice) { return memo + choice + ", "; }, ""), "bg-success");
        k++;
    });
    //calculate bonus
    var totalHunts = _.reduce(runner.Players, function (memo, player) {
        return memo + _.reduce(player.huntChoices, function (memo, choice) { return memo + (choice == 'h' ? 1 : 0) }, 0);
    }, 0);
    log("Total hunts: " + totalHunts, "bg-info");
    var bonus = (m <= totalHunts ? (2 * (runner.Players.length - 1)) : 0);
    log("Bonus food this round: " + bonus, "bg-info");
    _.each(runner.Players, function (player) {
        player.instance.roundEnd(bonus, m, runner.Players.length);
        log("Player " + player.instance.name + "'s food remaining: " + player.food, "bg-info");
        if (player.food <= 0) {
            log("Player " + player.instance.name + " has died!", "bg-danger");
        }
        $('#' + player.id + " .food").html(player.food);
        $('#' + player.id + " .rep").html(player.reputation);
    });
    runner.Players = _.reject(runner.Players, function (player) { return player.food <= 0; });
}

runner.run = function (iterations) {
    var i = 0;
    var interval = setInterval(function () {
        runner.round(i);
        i++;
        if (i > iterations || runner.Players.length < 2) {
            clearInterval(interval);
        }
    }, 10);
}


var players = [];
var hunter = {};
hunter.name = "Hunter";
hunter.huntChoices = function (roundNumber, currentFood, currentRep, m, playerReps) {
    var results = [];
    _.each(playerReps, function () {
        results.push('h');
    });
    return results;
};

hunter.huntOutcomes = function(foodEarnings) {

};

hunter.roundEnd = function(award, m, numberHunters) {

};

players.push(hunter);

var slacker = {};
slacker.name = "Slacker";
slacker.huntChoices = function (roundNumber, currentFood, currentRep, m, playerReps) {
    var results = [];
    _.each(playerReps, function () {
        results.push('s');
    });
    return results;
};

slacker.huntOutcomes = function (foodEarnings) {

};

slacker.roundEnd = function (award, m, numberHunters) {

};

players.push(slacker);

var rando = {};
rando.name = "rando";
rando.huntChoices = function (roundNumber, currentFood, currentRep, m, playerReps) {
    var results = [];
    _.each(playerReps, function () {
        results.push(Math.round(Math.random() * 10) % 2 == 0 ? 'h' : 's');
    });
    return results;
};

rando.huntOutcomes = function (foodEarnings) {

};

rando.roundEnd = function (award, m, numberHunters) {

};

players.push(rando);

function log(text, cls) {
    $('.container').append("<p class='" + cls + "'>" + text + "</p>");
}

var helpHunters = {};

helpHunters.name = "HelpHunters";
helpHunters.huntChoices = function(roundNumber, currentFood, currentRep, m, playerReps) {
    var results = [];
    _.each(playerReps, function(rep) {
        rep >= 0.5 ? results.push('h') : results.push('s');
    });
    return results;
}

helpHunters.huntOutcomes = function (foodEarnings) {

};

helpHunters.roundEnd = function (award, m, numberHunters) {

};

players.push(helpHunters);