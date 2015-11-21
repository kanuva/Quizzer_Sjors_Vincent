/**
 * Created by sjors on 6-11-15.
 */

var socket = io.connect(window.location.protocol + '//' + window.location.host);
var app = angular.module('quizMainModule', ['ngRoute']);

/*
========================================================================================================================
    Routes
========================================================================================================================
*/

app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/partials/main-menu.html'
        })


        .when('/team-create', {
            templateUrl: '/partials/team/create-team.html'
        })
        .when('/team-join-room', {
            templateUrl: '/partials/team/join-room.html'
        })



        .when('/master-create-room', {
            templateUrl: '/partials/master/create-room.html'
        })
        .when('/master-select-team', {
            templateUrl: '/partials/master/select-teams.html'
        })
        .when('/master-overview', {
            templateUrl: '/partials/master/overview.html'
        })
        .when('/master-select-categories', {
            templateUrl: '/partials/master/select-categories.html'
        })

        .otherwise('/');
});


app.controller('quizMainController', function($scope) {
    $scope.roomName, $scope.teamName;
});


app.controller('master-controller', function($scope, $location, $http) {
    // Category validation vars
    $scope.checked = 0;
    $scope.limit = 3;


    $scope.checkChanged = function(cat){
        if(cat.checked) $scope.checked++;
        else $scope.checked--;
    };

    // Get all categories
    $scope.questionCategories = [];
    $scope.getCategories = function() {
        $http.get('/getCategories')
        .success(function(data) {
            $scope.questionCategories.splice(0, $scope.questionCategories.length);
            data.forEach(function(e, i){
                $scope.questionCategories.push({ name: data[i], checked : false });
            });
        });
    };

    $scope.teams = [];


/*
========================================================================================================================

========================================================================================================================
 */
    $scope.sendRoomName = function() {
        socket.emit('Master_sendRoomName', { roomName:  $scope.roomName });
    };

    $scope.sendTeamName = function() {
        socket.emit('Team_sendTeamName', { teamName:  $scope.teamName });
    };

    $scope.requestJoinRoom = function() {
        console.log({ roomName:  $scope.roomName });
        socket.emit('Team_requestJoinRoom', { roomName:  $scope.roomName });
    };

/*
========================================================================================================================
    Socket Listeners
========================================================================================================================
*/
    /**
     * MASTER
     */
    socket.on('Master_roomSuccessfullyCreated', function() {
        $location.path('master-select-team');
        //swal("Room created", "The room is successfully created", "success");
    });

    socket.on('Master_roomAlreadyExists', function() {
        swal("Please try again!", "The room does already exists", "error");
    });

    socket.on('Master_getIncomingTeam', function(data) {
        swal("A client wants to join\, may he?", "warning");
        console.log(data);
    });

    /**
     * TEAM
     */
    socket.on('Team_teamSuccessfullyCreated', function() {
        $location.path('team-join-room');
        swal("Team created", "Your team is successfully created, you may now enter the room password", "success");
    });

    socket.on('Team_teamAlreadyExists', function() {
        $location.path('team-join-room');
        swal("Please try again!", "This team does already exists", "error");
    });

    socket.on('Team_Accepted')

});