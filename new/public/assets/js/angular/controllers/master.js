app.controller('MasterController', function($scope, $rootScope, $window, $location, $route) {

  /*
   ===================================================================================================================
      Actions
   ===================================================================================================================
   */

  // Create room
  $scope.create_room = function() {

    console.info('created the room: ' + $scope.room);

    socket.emit('master_create', {
        room: $scope.room,
        master: socket.id
    });

  }

  // Accept team
  $scope.accept_team = function(team) {
      console.log('accepting team' + team.name);

      socket.emit('master_accept_team', {
          team: team.name,
          master: socket.id,
          room: $route.current.params.team
      });
  }

  // Accept team
  $scope.decline_team = function(team) {
      console.log('declining team' + team.name);

      socket.emit('master_decline_team', {
          team: team.name,
          master: socket.id,
          room: $route.current.params.team
      });
  }

  /*
   ===================================================================================================================
      Socket Listeners
   ===================================================================================================================
   */

   // Room created, redirect to accepting teams
   socket.on('master_created', function(data) {

       $location.path('/master/' + $scope.room + '/teams');
       $scope.$apply();

   });

   // Room exists, give error message
   socket.on('master_exists', function(data) {

     $rootScope.$apply(function() {
         $scope.error = "The room already exists, please a different roomname";
     });

   });

   $scope.teams = new Array();
   // Team is joining
   socket.on('team_joined', function(data) {

       console.log('team wants to join...');
       $rootScope.$apply(function() {

           $scope.teams.push({ name: data.team, accepted: false });

       });

       console.log($scope.teams);
   });


   // Team is accepted
   socket.on('master_team_accepted', function(data) {

       $rootScope.$apply(function() {
          angular.forEach($scope.teams, function(team, key) {
              if(team.name === data.team) {
                  $scope.teams[key].accepted = true;
              }
          });
       });

   });

   // Team is declined
   socket.on('master_team_declined', function(data) {

       $rootScope.$apply(function() {
          angular.forEach($scope.teams, function(team, key) {
              if(team.name === data.team) {
                  $scope.teams[key].accepted = 'declined';
              }
          });
       });

   });

}); // End of MasterController
