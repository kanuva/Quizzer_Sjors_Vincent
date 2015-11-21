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


        .when('/team/enter-teamname', {
            templateUrl: '/partials/team/enter-teamname.html'
        })
        .when('/team/enter-roompassword', {
            templateUrl: '/partials/team/enter-roompassword.html'
        })



        .when('/master/create-roompassword', {
            templateUrl: '/partials/master/create-roompassword.html'
        })
        .when('/master/accept-teams', {
            templateUrl: '/partials/master/accept-teams.html'
        })
        .when('/master/dashboard', {
            templateUrl: '/partials/master/dashboard.html'
        })

        //.when('/master/select-question-categories', {
        //    templateUrl: '/partials/master/select-question-categories.html'
        //})

        .otherwise('/');
});


app.controller('quizMainController', function($scope) {
    $scope.roomPassword, $scope.teamName;
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
    $scope.sendRoomPassword = function() {
        socket.emit('Master_sendRoomPassword', { roomPassword:  $scope.roomPassword });
    };

    $scope.sendTeamName = function() {
        socket.emit('Team_sendTeamName', { teamName:  $scope.teamName });
    };

    $scope.requestJoinRoom = function() {
        console.log({ roomPassword:  $scope.roomPassword });
        socket.emit('Team_requestJoinRoom', { roomPassword:  $scope.roomPassword });
    };

/*
========================================================================================================================
    Socket Listeners
========================================================================================================================
*/
    /*
    --------------------------------------------------------------------------------------------------------------------
     MASTER
    --------------------------------------------------------------------------------------------------------------------
     */
    socket.on('Master_roomSuccessfullyCreated', function() {
        $location.path('master/accept-teams');
        //swal("Room created", "The room is successfully created", "success");
    });

    socket.on('Master_roomAlreadyExists', function() {
        swal("Please try again!", "The room does already exists", "error");
        $scope.roomPassword = "";
    });

    socket.on('Master_getIncomingTeam', function(data) {
        swal({
            type: "warning",
            title: "A team wants to join, may he?",
            description: "sure :)",
            confirmButtonText: "Accept"
        });
        console.log(data);
    });

    /*
     --------------------------------------------------------------------------------------------------------------------
        TEAM
     --------------------------------------------------------------------------------------------------------------------
     */
    socket.on('Team_teamSuccessfullyCreated', function() {
        $location.path('team/enter-roompassword');
        swal("Team created", "Your team is successfully created, you may now enter the room password", "success");
    });

    socket.on('Team_teamAlreadyExists', function() {
        swal("Please try again!", "This team does already exists", "error");
        $scope.teamName = "";
    });

    socket.on('Team_Accepted');

});