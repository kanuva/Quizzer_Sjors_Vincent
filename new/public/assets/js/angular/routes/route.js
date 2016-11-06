/*
 =======================================================================================================================
    Routes
 =======================================================================================================================
 */

app.config(function ($routeProvider) {
    $routeProvider

        // Intro screen...
        .when('/', {
            templateUrl: '/views/index.html'
        })


        // Team routes...
        .when('/team/create', {
            templateUrl: '/views/team/create.html',
            controller: 'TeamController as team'
        })
        .when('/team/:team/join', {
            templateUrl: '/views/team/join.html',
            controller: 'TeamController as team'
        })
	    .when('/team/:team/game/:game/waiting', {
            templateUrl: '/views/team/waiting.html',
            controller: 'TeamController as team'
        })
        .when('/team/:team/game/:game/started', {
            templateUrl: '/views/team/game.html',
            controller: 'TeamController as team'
        })

        // Master routes...
        .when('/master/create', {
            templateUrl: '/views/master/create.html',
            controller: 'MasterController as master'
        })

        .when('/master/:password/teams', {
            templateUrl: '/views/master/teams.html',
            controller: 'MasterController as master'
        })

        .when('/master/:password/categories', {
            templateUrl: '/views/master/category.html',
            controller: 'MasterController as master'
        })

        .when('/master/:password/dashboard', {
            templateUrl: '/views/master/dashboard.html',
            controller: 'MasterController as master'
        })

        //Scoreboard routes
        .when('/scoreboard/selectgame', {
            templateUrl: '/views/scoreboard/selectgame.html',
            controller: 'ScoreboardController as scoreboard'
        })

        .when('/scoreboard/:game', {
            templateUrl: '/views/scoreboard/scoreboard.html',
            controller: 'ScoreboardController as scoreboard'
        })

        .otherwise('/');
});
