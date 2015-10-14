var quizzer = angular.module("quizzerApp", ['ngRoute']);

quizzer.config(function($routeProvider) {
  $routeProvider
    .when('/team', {
      templateUrl: '/partials/team.html'
    })

    .when('/master', {
      templateUrl: '/partials/master.html'
    })
})

quizzer.controller("quizzerController", function($scope, $routeParams) {
  $scope.currentRoute = $routeParams;

  console.log($scope.currentRoute);
});
