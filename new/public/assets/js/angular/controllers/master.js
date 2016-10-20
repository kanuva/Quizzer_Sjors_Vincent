app.controller('MasterController', function($scope, $rootScope, $window, $location, $route, $http) {
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

  // Create room
  $scope.create_room = function() {

    console.info('created the room: ' + $scope.room);

    socket.emit('master_create', {
        room: $scope.room,
        master: socket.id
    });

  };

  // Accept team
  $scope.accept_team = function(team) {
      console.log('accepting team: ' + team.name);

      socket.emit('master_accept_team', {
          team: team.name,
          master: socket.id,
          room: $route.current.params.room
      });
  };

  // Accept team
  $scope.decline_team = function(team) {
      console.log('declining team: ' + team.name);

      socket.emit('master_decline_team', {
          team: team.name,
          master: socket.id,
          room: $route.current.params.room
      });
  };

  // Select the categories, has choosen the teams
  $scope.select_categories = function() {

      socket.emit('master_category', {
          room: $route.current.params.password,
          master: socket.id
      });

  };

  // Select the categories, has choosen the teams
  $scope.start_game = function() {
      var checked_categories = [];

      angular.forEach($scope.categories, function(value, key) {
          if(value.checked === true) {
              checked_categories.push(value.name);
          }
      });

      console.log(checked_categories);

      socket.emit('start_game', {
          room: $route.current.params.password,
          categories: checked_categories,
          master: socket.id
      });

  };



  // Category validation vars
    $scope.checked = 0;
    $scope.limit = 3;


    $scope.checkChanged = function (category) {
        if (category.checked) $scope.checked++;
        else $scope.checked--;
    };


  $scope.categories = [];
  $scope.getCategories = function () {
    $http.get('/categories')
        .success(function (data){

            data.forEach(function(category, key) {
                $scope.categories.push({ name: category, checked: false });
            });

        });
  };

  /*
   ===================================================================================================================
      Socket Listeners
   ===================================================================================================================
   */

   // Room created, redirect to accepting teams
   socket.on('master_created', function(data) {

       $location.path('/master/' + data.room + '/teams');
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


   socket.on('master_to_categories', function(data) {
       $location.path('/master/' + data.room + '/categories');
       $scope.$apply();
   });

    socket.on('master_game_started', function(data) {
        $location.path('/master/' + data.room + '/dashboard');
        $scope.$apply();
    });

}); // End of MasterController
