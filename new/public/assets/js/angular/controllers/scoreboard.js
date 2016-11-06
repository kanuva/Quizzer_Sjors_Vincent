app.controller('ScoreboardController', function ($scope, $rootScope, $window, $location, $route, $http) {

    $scope.games =[];
    $scope.selectGame ={};

    $scope.selectRoom_init = function () {
        $http.get('/games')
            .success(function(data){
                angular.forEach(data, function(value, key){
                    $scope.games.push(value);
                });
                console.log(data);
            })
    };

    $scope.dashboard_init = function() {
        $http.get('/game/'+ $route.current.params.game)
            .success(function(data){
                console.log(data);
            })
    };

    /*
    ===================================================================================================================
        Server socket
    ===================================================================================================================
    */
    socket.on('serverReboot', function () {
        $rootScope.$apply(function () {
            $location.path('/');
            $route.reload();
        });
    });


}); // End of scoreboardController