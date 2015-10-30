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

quizzerApp.controller("quizzerController", function ($scope, $http) {
    $scope.getQuestions = setQuestions();

    function setQuestions() {
        $http
            .get('http://localhost:3000/questions')
            .success(function(response) {
                $scope.getQuestions = response;
        });
    };

});
