var server_io = require('socket.io');
var model = require('./database');
var allgames;

module.exports.listen = function(server) {
  var io = server_io.listen(server);

    io.on('connection', function (socket) {

        var Game = model.game;
        var allgames;
        Game.find({}).exec(function(error, games) {
          allgames = games;
        });

        var Team = model.team;
        var allteams;
        Team.find({}).exec(function(error, teams) {
            allteams = teams;
        });

      /*
      --------------------------------------------------------------------------
          Server  sockets...
      --------------------------------------------------------------------------
      */
      socket.emit('serverReboot');


      /*
      --------------------------------------------------------------------------
          Master sockets...
      --------------------------------------------------------------------------
      */
      socket.on('master_create', function(data) {
          var exists = false;

          allgames.forEach(function(element, index) {
              if(allgames[index].room === data.room) {
                  socket.emit('master_exists');
                  exists = true;
              }
          });

          // If game doesn't exist, create game
          if(!exists) {
              var game = new Game(
                  {
                    room:       data.room,
                    questions:  [],
                    master:     data.master,
                    scoreboard: 'null',
                    teams:      [],
                    categories: [],
                    round:      1,
                    ended:      false,
                    started:    false,
                  }
              );

              game.save(function(error) {
                    if(error) {
                        console.log('room isn\'t created');
                        console.log(error);
                    } else {
                        console.log('room created');
                        io.to(socket.id).emit('master_created', data);
                    }
              });

          } else {
              console.log('room already exists');
          }
        });


        // Accepting the team
        socket.on('master_accept_team', function(data) {

            console.log('accepting team to game...');
            console.log(data);

            Game.findOneAndUpdate({ 'master': data.master, 'teams.name': data.team }, {

                "$set" : {
                    "teams.$.accepted" : true,
                }

            }, { new: true }, function(error, game) {
                if(!error) {

                    console.log('team is accepted: ' + data.team);
                    console.log(game);

                    io.to(data.master).emit('master_team_accepted', data);
                }

            });

        });

        // Declining the team
        socket.on('master_decline_team', function(data) {

            console.log('declining team to game...');
            console.log(data);

            Game.findOneAndUpdate({ 'master': data.master, 'teams.name': data.team }, {

                "$set" : {
                    "teams.$.accepted" : false,
                }

            }, { new: true }, function(error, game) {
                if(!error) {

                    console.log('team is declined: ' + data.team);
                    console.log(game);

                    io.to(data.master).emit('master_team_declined', data);
                }

            });

        });

        // Start the game
        socket.on('start_game', function(data) {

            console.log('start game...');
            console.log(data);

            Game.findOneAndUpdate({ 'master': data.master, 'room': data.room }, {
                $pull : {
                    "teams" : {
                        accepted: {
                            $in : ['false', 'none']
                        }
                    }
                },
                $set : {
                    'started': true
                }
            }, { new: true }, function(error, game) {
                if(!error) {

                    console.log('started the game and removed the teams that aren\'t accepted');

                    io.to(data.master).emit('game_started', game);

                    game.teams.forEach(function(team, index) {
                        io.to(team.socket_id).emit('game_started', game);
                    });

                } else {
                    console.log(error);
                }
            });

        });

        /*
        --------------------------------------------------------------------------
            Team sockets...
        --------------------------------------------------------------------------
        */

        // create team
        socket.on('team_create', function(data) {
            var exists = false;

            allteams.forEach(function(element, index) {
                if(allteams[index].name === data.team) {
                    socket.emit('team_exists');
                    exists = true;
                }
            });

            console.log(data);

            if(!exists) {
                var team = new Team(
                    {
                      name: data.team,
                      socket_id: data.socket_id,
                      score: 0,
                      accepted: 'none',
                    }
                );
                team.save(function(error) {
                      if(error) {

                          console.log('team isn\'t created');
                          console.log(error);

                      } else {

                          console.log('team created');

                          io.to(data.socket_id).emit('team_created', data);

                      }
                });

            } else {
                console.log('team already exists');
            }
          });

          // Join room
          socket.on('team_join', function(data) {

              Game.findOneAndUpdate({ room: data.room }, {

                  "$push" : {
                      "teams" : {
                          name :     data.team,
                          socket_id: data.socket_id,
                          points:    0,
                          accepted:  'none' }
                  }

              }, function(error, numAffected, rawResponse) {

                  if(!error) {

                      io.to(data.socket_id).emit('team_joined', data)

                      Game.findOne({ room: data.room }).exec(function(error, room) {

                          io.to(room.master).emit('team_joined', data);

                      });

                  }

              });
          });
    });

  return io;
}
