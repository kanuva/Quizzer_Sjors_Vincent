var quizzerApp = angular.module("quizzerApp", ['ngRoute']);


quizzerApp.config(function ($routeProvider) {

    $routeProvider

        .when('/', {
            templateUrl: '/partials/index.html'
        })

        .when('/team', {
            templateUrl: '/partials/team.html'
        })

        .when('/master', {
            templateUrl: '/partials/master.html'
        })
        .when('/#/', {
            templateUrl: 'partials/index.html'
        })
        .when('/score', {
            templateUrl: 'partials/scoreboard.html'
        })
        .otherwise('/');
});


quizzerApp.factory('socket', function ($rootScope) {
    var socket = io.connect(document.location.protocol + '//' + document.location.host);
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
});


quizzerApp.controller("quizzerController", function ($scope, $http, socket) {
    $scope.getQuestions = getQuestions();
    $scope.masterQuestion   = "Currently there is no question selected";
    $scope.masterAnswer     = "";

    $scope.selectQuestion = function selectQuestion(question) {
        var roomid = "";
        if($("#room-id").html() !== undefined) {
            roomid = $("#room-id").html();
        }
            $scope.masterQuestion = question.question;
            $scope.masterAnswer = question.answer;
            socket.emit('pushQuestion', { question : question.question, roomID: roomid });
    };

    function getQuestions() {
        $http
            .get('http://localhost:3000/questions')
            .success(function(response) {
                $scope.getQuestions = response;
        });
    }


    //socket.on('questionPull', function(data) {
    //    console.log('received some data...');
    //});



});
