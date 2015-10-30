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
                console.log('jeej');
                console.log(response);
                $scope.getQuestions = response;
        });
    }


    //function getquestions() {
    //
    //    $http.get(document.location.protocol+'//'+document.location.host + '/questions'
    //    ).success(function (response) {
    //        return [response];
    //    });
    //};



        //$http.get(document.location.protocol+'//'+document.location.host + '/questions', function(data) {
        //    console.log('DB \\ data is: ' + data);
        //
        //});
    //}

});
