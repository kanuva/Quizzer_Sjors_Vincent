app.controller('ScoreboardController', function ($scope, $rootScope, $window, $location, $route, $http) {

    $scope.games = [];
    $scope.selectGame = {};
    $scope.currentGame = {};

    $scope.selectRoom_init = function () {
        $http.get('/games')
            .success(function (data) {
                angular.forEach(data, function (value, key) {
                    $scope.games.push(value);
                });
                console.log(data);
            })
    };

    $scope.dashboard_init = function () {
        $http.get('/game/' + $route.current.params.game)
            .success(function (data) {
                $scope.currentGame = data;
                console.log($scope.currentGame);
                socket.emit('scoreboard_join', {room: data.room, socket_id: socket.id});

            })
    };

    $scope.refresh = function () {
        $http.get('/game/' + $route.current.params.game)
            .success(function (data) {
                $scope.currentGame = data;
                console.log($scope.currentGame);
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

    socket.on('scoreboard_refresh', function () {
        $scope.refresh();
    })


}); // End of scoreboardController