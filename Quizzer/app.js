/**
 * Created by sjors on 6-11-15.
 */
var path        = require('path');
var questions   = require('./Questions');
var mongoose    = require('mongoose');
var express     = require('express');
var app         = express();
var server      = require('http').Server(app);
var io      = require('socket.io')(server);

var teamNames = [];
var gameData = [];
/**
 * Properties in gameData
 * ------------------------
 * roomName: data.roomName,
 * quizMaster: socket.id,
 * questionNumber: 0,
 * roundNumber: 1,
 * questions: [],
 * teams: [],
 * started: false
 */

/*
========================================================================================================================
    Mongoose
========================================================================================================================
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
========================================================================================================================
    API Routes
========================================================================================================================
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
        rooms.push(gameData[index].roomName);
    });

    response.json(rooms)
});

/*
========================================================================================================================
    socket.io
========================================================================================================================
*/
io.on('connection', function (socket) {
    console.log('connected');

    /**
     * Receiving roomName & Check if roomName doesn't exists
     */
    socket.on('Master_sendRoomName', function(data) {
        var checkIfExists = false;
        gameData.forEach(function(element, index) {
            if(gameData[index].roomName === data.roomName) {
                socket.emit('Master_roomAlreadyExists');
                checkIfExists = true;
            }
        });

        if(checkIfExists === false) {
            console.log('room is created');
            gameData.push({
                roomName: data.roomName,
                quizMaster: socket.id,
                questionNumber: 0,
                roundNumber: 1,
                questions: [],
                teams: [],
                started: false
            });
            socket.emit('Master_roomSuccessfullyCreated');
        }
    });

    /**
     * Receiving teamName & Check if TeamName doesn't exists
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
            console.log('team is created');
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
        console.log('---');
        console.log(data);

        gameData.forEach(function(element, index) {
            if(gameData[index].teamName === data.teamName) {
                teams.forEach(function(element, index) {
                    if(teams[index].clientID === socket.id) {
                        socket.emit('')
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
    console.log('Server is running...')
});