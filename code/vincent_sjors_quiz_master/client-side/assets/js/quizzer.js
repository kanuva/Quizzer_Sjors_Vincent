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

quizzerApp.controller("quizzerController", function ($scope, $http, $routeParams) {
    $scope.currentRoute = $routeParams;

    console.log($scope.currentRoute);

    $scope.getquestions = function () {
        console.log("Ik wil de questions getten");
        $http.get()
    }

});
