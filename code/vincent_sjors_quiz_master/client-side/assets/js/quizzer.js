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
        .when('/popup', {
            templateUrl: 'partials/popup.html'
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
    $scope.masterQuestion   = "Currently there isn't a question selected";
    $scope.masterAnswer     = "";


    $scope.selectQuestion = function selectQuestion(question, clients) {

        if(clients.length >= 1) {
            $scope.masterQuestion = question.question;
            $scope.masterAnswer = question.answer;
            socket.emit('pushQuestion', { question : question.question });
        } else {
            $().showPopUp();
        }
    };

    function getQuestions() {
        $http
            .get('http://localhost:3000/questions')
            .success(function(response) {
                $scope.getQuestions = response;
        });
    }



});
