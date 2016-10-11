/**
 * Created by sjors on 6-11-15.
 */

var socket = io.connect(window.location.protocol + '//' + window.location.host);
var app = angular.module('quizMainModule', ['ngRoute']);

/*
 =======================================================================================================================
    Routes
 =======================================================================================================================
 */

app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/partials/main-menu.html'
        })

        .when('/team/enter-teamname', {
            templateUrl: '/partials/team/enter-teamname.html'
        })
        .when('/team/enter-roompassword', {
            templateUrl: '/partials/team/enter-roompassword.html'
        })
		.when('/team/enter-game', {
            templateUrl: '/partials/team/waitscreen.html'
        })

        .when('/master/create-roompassword', {
            templateUrl: '/partials/master/create-roompassword.html'
        })
        .when('/master/:roomPassword/accept-teams', {
            templateUrl: '/partials/master/accept-teams.html'
        })
        .when('/master/:roomPassword/dashboard', {
            templateUrl: '/partials/master/dashboard.html'
        })

        // .when('/master_backup/select-question-categories', {
        //    templateUrl: '/partials/master_backup/select-question-categories.html'
        // })

        .otherwise('/');
});


app.controller('quizMainController', function ($rootScope, $route, $location) {
    /*
     ===================================================================================================================
        Socket Listeners
     ===================================================================================================================
     */

    socket.on('serverReboot', function () {
        $rootScope.$apply(function () {
            $location.path('/');
            $route.reload();
        });
    });

});


app.controller('master-controller', function ($scope, $rootScope, $location, $http, $route) {
    // Category validation vars
    $scope.checked = 0;
    $scope.limit = 3;


    $scope.checkChanged = function (cat) {
        if (cat.checked) $scope.checked++;
        else $scope.checked--;
    };

    // Get all categories
    $scope.questionCategories = [];
    $scope.getCategories = function () {
        $http.get('/getCategories')
            .success(function (data) {
                $scope.questionCategories.splice(0, $scope.questionCategories.length);
                data.forEach(function (e, i) {
                    $scope.questionCategories.push({name: data[i], checked: false});
                });
            });
    };

    $scope.joinRequests = {};
    $scope.acceptedRequests = {};
    $scope.someisAccepted = false;

    /*
     ===================================================================================================================
         Actions
     ===================================================================================================================
     */
    $scope.sendRoomPassword = function () {
        socket.emit('Master_sendRoomPassword', {roomPassword: $scope.roomPassword});
    };

    $scope.acceptTeam = function(team) {
        socket.emit('Master_acceptClientToRoom', team);
        $scope.acceptedRequests[team.teamName] = {teamName: team.teamName, clientID: team.clientID};
        delete $scope.joinRequests[team.teamName];
        $scope.someisAccepted = true;
    };

    $scope.declineTeam = function(team) {
        socket.emit('Master_declineClientToRoom', team);
        delete $scope.joinRequests[team.teamName];
    };

    /*
     ===================================================================================================================
        Socket Listeners
     ===================================================================================================================
     */

    socket.on('Master_roomSuccessfullyCreated', function (data) {
        $rootScope.$apply(function () {
            $location.path('master/' + data.roomPassword + '/accept-teams');
            console.log($route);
        });
    });

    socket.on('Master_roomAlreadyExists', function () {
        swal("Please try again!", "The room does already exists", "error");
        $scope.roomPassword = "";
    });

    socket.on('Master_getIncomingTeam', function (data) {
        $scope.$apply(function () {
            $scope.joinRequests[data.teamName] = {teamName: data.teamName, clientID: data.clientID};
        });
    });
});


app.controller('team-controller', function ($scope, $rootScope, $location) {
    $scope.waitscreenTitle = 'Waiting for the quiz master...';
    /*
     ===================================================================================================================
     Click Actions
     ===================================================================================================================
     */

    $scope.sendTeamName = function () {
        socket.emit('Team_sendTeamName', {teamName: $scope.teamName});
    };

    $scope.requestJoinRoom = function () {
        console.log({roomPassword: $scope.roomPassword});
        socket.emit('Team_requestJoinRoom', {roomPassword: $scope.roomPassword});

        $location.path('team/enter-game');
    };

    /*
     ===================================================================================================================
        Socket Listeners
     ===================================================================================================================
     */
    socket.on('Team_teamSuccessfullyCreated', function () {
        $rootScope.$apply(function () {
            $location.path('team/enter-roompassword');
        });
        swal({
			title:"Team created",
			text: "Your team is successfully created, you may now enter the room password",
			type: "success",
			timer: 1500,
			showConfirmButton: false
		});
    });

    socket.on('Team_teamAlreadyExists', function () {
        swal("Please try again!", "This team does already exists", "error");
        $scope.teamName = "";
    });

    socket.on('Team_Accepted', function() {
		console.log('we are in the game');
        $rootScope.$apply(function() {
            $scope.waitscreenTitle = "You are accepted to the game";
        });
    });

    socket.on('Team_Declined', function() {
        console.log('we are declined');
        $rootScope.$apply(function () {
            $location.path('team/enter-teamname');
        });

    })

});
