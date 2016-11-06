var server_io = require('socket.io');
var model = require('./database');
var allgames;

module.exports.listen = function (server) {
    var io = server_io.listen(server);

    io.on('connection', function (socket) {

        var Game = model.game;


        var Team = model.team;

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
        socket.on('master_create', function (data) {
            var exists = false;
            console.log("data.room " + data.room);
            Game.find({}).exec(function (error, games) {
                games.forEach(function (element, index) {
                    if (games[index].room === data.room) {
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
                    round:      0,
                    ended:      false,
                    started:    false
                  }
              );

                    game.save(function (error) {
                        if (error) {
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
        socket.on('master_accept_team', function (data) {

            console.log('accepting team to game...');
            console.log(data);

            Game.findOneAndUpdate({'master': data.master, 'teams.name': data.team}, {

                "$set": {
                    "teams.$.accepted": true
                }

            }, {new: true}, function (error, game) {
                if (!error) {
                    io.to(data.master).emit('master_team_accepted', data);
                    Game.findOne({"teams.name": data.team}, {'teams.$': 1}, function (error, game) {
                        console.log('team is accepted: ' + data.team);
                        io.to(game.teams[0].socket_id).emit('team_temp_accept', data);
                    });
                }
            });

        });

        // Declining the team
        socket.on('master_decline_team', function (data) {
            Game.findOneAndUpdate({'master': data.master, 'teams.name': data.team}, {

                "$set": {
                    "teams.$.accepted": false
                }

            }, {new: true}, function (error, game) {
                if (!error) {
                    io.to(data.master).emit('master_team_declined', data);
                    Game.findOne({"teams.name": data.team}, {'teams.$': 1}, function (error, game) {
                        console.log('team is declined: ' + data.team);
                        io.to(game.teams[0].socket_id).emit('team_temp_declined', data);
                    });
                }

            });

        });

        // Master has choosen the teams, select categories
        socket.on('master_category', function (data) {

            console.log('Master has chooses it\'s teams and will select the quiz categories now ...');

            Game.findOneAndUpdate({'master': data.master, 'room': data.room}, {
                $pull: {
                    "teams": {
                        accepted: {
                            $in: ['false', 'none']
                        }
                    }
                },
                $set: {
                    'started': true
                }
            }, {new: false}, function (error, game) {
                if (!error) {
                    io.to(data.master).emit('master_to_categories', game);
                    game.teams.forEach(function (team, index) {
                        if (team.accepted === "true") {
                            io.to(team.socket_id).emit('game_started', game);
                        }
                        else {
                            io.to(team.socket_id).emit('game_declined', game);
                        }
                    });

                } else {
                    console.log(error);
                }
            });

        });

        socket.on('start_game', function (data) {

            console.log('trying to start game');
            console.log(data);

            Game.findOneAndUpdate({room: data.room, master: data.master}, {

                $set: {
                    'categories': data.categories
                }

            }, {new: true}, function (error, game) {

                if (!error) {

                    console.log('SUCCESS: Categories are set in the game');
                    console.log(game);

                    io.to(data.master).emit('master_game_started', data);

                }

                else {

                    console.log('ERROR: Categories aren\'t set');

                }

            });

        });

        socket.on('sentQuestion', function (data) {
            console.log(data);
            console.log("game:");

            if(data.answers.length > 0) {

                data.answers.forEach(function(answer, key) {
                    var points = (answer.answered == 'correct') ? 1 : 0;
                    var teams = [];

                    Game.findOne({ 'master' : data.masterId }).exec(function(error, room) {
                        teams = room.teams;

                        console.log('updating scores...')


                        teams.forEach(function(team, key) {
                            if(answer.team == team.name) {
                                console.log('team found updating score... by: ' + points);
                                teams[key].score += points;
                            }
                        });

                        console.log(teams);


                        Game.findOneAndUpdate({ 'master':data.masterId }, {
                            $set : {
                                'teams' : teams
                            }
                        }, { new: true }, function(error, room) {

                            // after update
                            console.log(room);

                        });


                    });

                });

            }

            // Set ask question to database record
            Game.findOneAndUpdate({ 'master': data.masterId }, {
                $push: { questions: data.question },
                $inc: { round: 1}
            }, { new: true }, function(error, game) {

                // after update

            });

            // Send question to all clients
            Game.findOne({'master': data.masterId}).exec(function (error, room) {
                if (!error) {
                    room.teams.forEach(function (team, index) {
                        io.to(team.socket_id).emit('new_question', data.question);
                    });
                }
            });

        });

        socket.on('round_Ended', function (data) {
            Game.findOne({'master': data.masterId}).exec(function (error, room) {
                if (!error) {
                    room.teams.forEach(function (team, index) {
                        io.to(team.socket_id).emit('new_round');
                    });

                }
            });
        });

        /*
         --------------------------------------------------------------------------
         Team sockets...
         --------------------------------------------------------------------------
         */

        // create team
        socket.on('team_create', function (data) {
            var exists = false;

            Team.find({}).exec(function (error, teams) {

                teams.forEach(function (element, index) {

                    if (teams[index].name === data.team) {
                        socket.emit('team_exists');
                        exists = true;
                    }

                });

                if (!exists) {
                    var team = new Team(
                        {
                            name: data.team,
                            socket_id: data.socket_id,
                            score: 0,
                            accepted: 'none'
                        }
                    );
                    team.save(function (error) {
                        if (error) {

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

        });

        // Join room
        socket.on('team_join', function (data) {
            Game.findOne({room: data.room}).exec(function (error, game) {
                if (game.master != null && game.started == false) {

                    Game.findOneAndUpdate({room: data.room}, {

                        "$push": {
                            "teams": {
                                name: data.team,
                                socket_id: data.socket_id,
                                points: 0,
                                accepted: 'none'
                            }
                        }

                    }, function (error, numAffected, rawResponse) {

                        if (!error) {

                            io.to(data.socket_id).emit('team_joined', data);

                            Game.findOne({room: data.room}).exec(function (error, room) {
                                if (!error) {

                                    io.to(room.master).emit('team_joined', data);

                                }
                            });

                        }

                    });
                } else if (game.started == true) {
                    //Client should be rejected because this game has allready been started
                    io.to(data.socket_id).emit('game_has_been_started', data);
                }
                else if (game.master == null) {
                    //Client should be rejected because the room does not exist
                    io.to(data.socket_id).emit('game_does_not_exist', data);
                }

            });
        });

        socket.on('sent_answer', function (data) {
            Game.findOne({'teams.socket_id': data.socket_id}).exec(function (error, foundData) {
                if (!error) {
                    io.to(foundData.master).emit('question_Answer', {answer: data.answer, team: data.team});
                    console.log("Found data:");
                    console.log(foundData);
                }
            });
        });

        return io;
    });
};
