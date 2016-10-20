app.controller('TeamController', function($scope, $rootScope, $window, $location, $route) {
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

  /*
   ===================================================================================================================
      Actions
   ===================================================================================================================
   */

  // Create team
  $scope.create_team = function() {
    console.info('created the team: ' + $scope.name);

    socket.emit('team_create', {
        team: $scope.name,
        socket_id: socket.id
    });

  };

  // Create team
  $scope.join_room = function() {
      
    console.info('trying to join the room: ' + $scope.room);

    socket.emit('team_join', {
        room: $scope.room,
        team: $route.current.params.team,
        socket_id: socket.id
    });
  };

  /*
   ===================================================================================================================
      Socket Listeners
   ===================================================================================================================
   */

   // Team created, redirect to join room
   socket.on('team_created', function(data) {

       $location.path('/team/' + data.team + '/join');
       $scope.$apply();

   });

   // Team exists, give error message
   socket.on('team_exists', function(data) {

     $rootScope.$apply(function() {
         $scope.error = "This teamname does already exists, please try a different teamname";
     });

   });

   // Room joined, redirect to accepting teams
   socket.on('team_joined', function(data) {

       $location.path('/team/' + data.team + '/game/' + data.room + '/waiting');
       $scope.$apply();

   });

   socket.on('game_started', function(data) {
       $location.path('/team/' + $route.current.params.team + '/game/' + data.room + '/started');
       $scope.$apply();
   });

    //if team is declined
    socket.on('game_declined', function(data){
        $rootScope.$apply(function() {
            $scope.error = "The gamemaster has declined your team.";
        });
        $location.path('team/' + $route.current.params.team + '/join');
        $scope.$apply();
    });
    socket.on('room_does_not_exist', function(data){
        console.log("De game bestaat niet");
        $rootScope.$apply(function() {
            $scope.error = "The game you're trying to join does not exist (yet...)";
        });
        // $location.path('team/' + $route.current.params.team + '/join');
        // $scope.$apply();
    });

}); // End of TeamController
