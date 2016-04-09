/**
 * Created by sjors on 6-11-15.
 */
var path        = require('path');
var questions   = require('./Questions');
var mongoose    = require('mongoose');
var express     = require('express');
var app         = express();
var server      = require('http').Server(app);
var io          = require('socket.io')(server);

var teamNames = [];
/**
 * Properties in teamNames
 * -----------------------------------------------------------------------------
 * teamName: data.teamName              (the team name)
 * clientID: socket.id                  (the id of the team)
 *
 * @type {Array}
 */

var gameData = [];
/**
 * Properties in gameData
 * -----------------------------------------------------------------------------
 * roomPassword: data.roomPassword,                 (the room password)
 * quizMaster: socket.id,                           (the id of the master_backup)
 * scoreBoard: socket.id of the scoreboard window)  (the id of the scoreboard)
 * questionNumber: 0,                               (the amount of questions that are passed, default 1)
 * roundNumber: 1,                                  (the amount of rounds that are passed, default: 1)
 * questions: [],                                   (will be a array, question that are ask)
 * teams: [],                                       (will be a array)
 * started: false                                   (default when initializing)
 *
 * @type {Array}
 */

/*
================================================================================
    Mongoose
================================================================================
*/
var db = mongoose.connect('mongodb://localhost/pubQuiz');
var Schema = mongoose.Schema;

var questionSchema = new Schema({
    question:   { type: String, required: true },
    answer:     { type: String, required: true },
    category:   { type: String, required: true }
}, { collection: 'questions' });

var questionModel = db.model('questionList', questionSchema);

// Fill collection when it's empty
questionModel.count({}, function(error, count) {
    if(count <= 0) {
        questionModel.create(questions);
        console.log('filled collection questions with: ' + questions.length + ' documents' );
    }
});
/*
================================================================================
    API Routes
================================================================================
*/

/** Send all categories */
app.get('/getCategories', function(request, response) {
    questionModel.find({}).distinct('category', function(err, categories) {
        response.json(categories);
    });
});


/** Send all rooms */
app.get('/getAllRooms', function(request, response) {
    var rooms = [];

    gameData.forEach(function(element, index) {
        rooms.push(gameData[index].roomPassword);
    });

    response.json(rooms)
});

/*
================================================================================
    socket.io
================================================================================
*/
io.on('connection', function (socket) {

    socket.emit('serverReboot');

    /**
     ***************************************************************************
        MASTER
     ***************************************************************************
     */

    /*
    ----------------------------------------------------------------------------
        Receiving roomPassword & Check if roomPassword doesn't exists
    ----------------------------------------------------------------------------
     */
    socket.on('Master_sendRoomPassword', function(data) {
        var checkIfExists = false;
        gameData.forEach(function(element, index) {
            if(gameData[index].roomPassword === data.roomPassword) {
                socket.emit('Master_roomAlreadyExists');
                checkIfExists = true;
            }
        });

        if(checkIfExists === false) {
            console.log('room is created');
            gameData.push({
                roomPassword: data.roomPassword,
                quizMaster: socket.id,
                scoreBoard: null,
                questionNumber: 0,
                roundNumber: 1,
                questions: [],
                teams: [],
                started: false
            });
            socket.emit('Master_roomSuccessfullyCreated', data);
        }
    });

    socket.on('Master_acceptClientToRoom', function(data) {
		socket.broadcast.to(data.clientID).emit('Team_Accepted');
    });

    socket.on('Master_declineClientToRoom', function(data) {
        socket.to(data.clientID).emit('Team_Declined');
        teamNames.forEach(function(element, index) {
            if (teamNames[index].teamName === data.teamName) {
                teamNames.splice(index, 2);
            }
        });
    });


    /**
    ****************************************************************************
       TEAM
    ****************************************************************************
    */

    /*
    ----------------------------------------------------------------------------
      Receiving teamName & Check if TeamName doesn't exists
    ----------------------------------------------------------------------------
    */
    socket.on('Team_sendTeamName', function(data) {
        var checkIfExists = false;
        teamNames.forEach(function(element, index) {
                if (teamNames[index].teamName === data.teamName) {
                    socket.emit('Team_teamAlreadyExists');
                    checkIfExists = true;
                }
        });

        if(checkIfExists === false) {
            console.log('team '+ data.teamName +' is created');
            teamNames.push({
                teamName: data.teamName,
                clientID: socket.id
            });
            socket.emit('Team_teamSuccessfullyCreated');
        }
    });

    /**
     * Request to join a room
     */
    socket.on('Team_requestJoinRoom', function(data) {
        gameData.forEach(function(element, index) {
            if(gameData[index].roomPassword === data.roomPassword) {
                teamNames.forEach(function(element, count) {
                    if(teamNames[count].clientID === socket.id) {
                        socket.to(gameData[index].quizMaster).emit('Master_getIncomingTeam', teamNames[count]);
                        console.log('roomPassword:' + data.roomPassword);
                    }
                });
            }
        });
    });
});

// Express
app.use(express.static('public'));

// Start server on port 80
server.listen(3000, function() {
    console.log('Server is running on port 3000...')
});
