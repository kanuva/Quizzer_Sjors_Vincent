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
        .when('/master/:roomPassword/accept-teams', {
            templateUrl: '/partials/master/accept-teams.html'
        })
        .when('/master/:roomPassword/dashboard', {
            templateUrl: '/partials/master/dashboard.html'
        })

        //.when('/master/select-question-categories', {
        //    templateUrl: '/partials/master/select-question-categories.html'
        //})

        .otherwise('/');
});


app.controller('quizMainController', function($scope) {

});


app.controller('master-controller', function($scope, $rootScope, $location, $http, $routeParams) {
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
    ACTIONS
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
        GENERAL
    --------------------------------------------------------------------------------------------------------------------
    */

    socket.on('serverReboot', function() {
        $rootScope.$apply(function() {
            $location.path('/');
            swal({
                type: "info",
                title: "Server Reboot",
                description: "Our apologies",
                timer: 1
            });
        });

    });

    /*
    --------------------------------------------------------------------------------------------------------------------
        MASTER
    --------------------------------------------------------------------------------------------------------------------
    */
    socket.on('Master_roomSuccessfullyCreated', function(data) {
        $rootScope.$apply(function() {
            $location.path('master/'+ data.roomPassword +'/accept-teams');
        });
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
        $rootScope.$apply(function() {
            $location.path('team/enter-roompassword');
        });
        swal("Team created", "Your team is successfully created, you may now enter the room password", "success");
    });

    socket.on('Team_teamAlreadyExists', function() {
        swal("Please try again!", "This team does already exists", "error");
        $scope.teamName = "";
    });

    socket.on('Team_Accepted');

});