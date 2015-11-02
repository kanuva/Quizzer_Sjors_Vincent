var path = require('path');
var mongoose = require('mongoose');
var express = require('express');
var socketio = require('socket.io');
var quizzer = express();
var http = require('http').createServer(quizzer);
var io = socketio.listen(http);

var rooms = [];
var clients = [];

var db = mongoose.connection;

var Questions = mongoose.Schema({
    question: String,
    answer: String,
    category: String
}, {collection: 'questions'});

var QuizQuestions = mongoose.model('QuizQuestions', Questions);

io.sockets.on('connection', function (socket) {


    socket.on('addScoreboard', function (data) {
        var result = false;
        if (in_array(data, rooms)) {
            socket.join(data);
            result = true;
        }
        io.to(socket.id).emit('ScoreboardInit', {accepted: result});
    });

    socket.on('ScoreboardNewRound', function(data) {
       io.to(data.roomID).emit('clearAnswersAndSetQuestion', data);
    });

    socket.on('joinOrCreate', function (data) {
        if (data.funtie === "create") {
            if (!in_array(data.roomname, rooms)) {
                socket.join(data.roomname);
                rooms.push(data.roomname, socket.id, false, 0);
            }
            else {
                io.to(socket.id).emit('roomexists');
            }
        }
        else if (data.functie === "join") {
            socket.join(data.roomname);
        }
    });
    socket.on('join', function (data) {
        io.to(socket.id).emit('yourID', {socketID: socket.id});
        if (in_array(data.Roomname, rooms) && rooms[rooms.indexOf(data.Roomname) + 2] == false) { //kijk of de room bestaat en of deze nog niet gestart is


            io.to(data.Roomname).emit('nieuweclient', {
                Teamname: data.Teamname,
                Roomname: data.Roomname,
                clientID: socket.id
            })
        }
        else {
            io.to(socket.id).emit('refuse', {clientID: socket.id, reason: "The entered room does not exist or is allready playing"});
        }
    });

    socket.on('teamisAccepted', function (data) {
        var client = {
            teamID : data.teamID,
            score: 0,
            roomname: data.roomname,
            teamnaam: data.teamnaam
        };
        clients.push(client);

        io.emit('JebentAccepted', {roomname: data.roomname, clientID: data.teamID, teamnaam: data.teamnaam});
    });

    socket.on('endround', function (data) {
        if (rooms[rooms.indexOf(data.roomname) + 3] == 12) {
            io.to(data.roomname).emit('endofgame');
            rooms.splice(rooms.indexOf(data.roomname), 4);
            socket.leave(data.roomname);
        } else {
            io.to(data.roomname).emit('endofround');
            io.to(data.roomname).emit('scoreboarsShowAnswers', data.answers);
        }
    });

    socket.on('teamisRefused', function (data) {
        io.emit('refuse', {clientID: data.clientID, reason: "The quizmaster declined your invite to enter the quiz"});
    });

    socket.on('pushQuestion', function (data) {
        data.disabled = false; //dit is om de vraag voor de client te disablen
        rooms[rooms.indexOf(data.roomID) + 2] = true; //dit lockt de room (de game is dan gestart)
        rooms[rooms.indexOf(data.roomID) + 3] += 1; //Dit hoogt het aantal rondes op met 1
        data.roundnr = rooms[rooms.indexOf(data.roomID) + 3];
        io.to(data.roomID).emit('questionPull', data);
    });


    socket.on('sendGivenAnswer', function (data) {
        for (var i = 0; i < clients.length; i++) {
            var teamID = clients[i].teamID.replace(/\s+$/, '');
            if (data.MyID === teamID) {
                io.to(clients[i].roomname).emit('sendAnswer', {answer: data.answer, teamname: clients[i].teamnaam});
            }
        }
    });

    socket.on('answerCheck', function(data){
        for(var i=0; i < clients.length; i++) {
            if(clients[i].teamnaam == data.teamname) {
                if(data.correct) {
                    clients[i].score = (clients[i].score + 1);
                }
                var client = clients[i];
            }
        }

        io.to(data.roomname).emit('answersHandler', {data: data, client: client});
    });
});

function in_array(needle, haystack) {
    if (haystack.indexOf) return haystack.indexOf(needle) > -1;
    for (var i = 0; i < haystack.length; i++) {
        if (haystack[i] == needle) {
            return true;
        }
    }
    return false;
}

//Express
quizzer.use(express.static(path.join(__dirname, 'client-side')));

//Send questions
quizzer.get('/questions', function (request, res) {

    mongoose.connect('mongodb://localhost/QuizDB');

    db.on('error', console.error.bind(console, 'connection error:'));

    db.once('open', function (callback) {
        QuizQuestions.find(function (err, data) {
            if (err) return console.log(err);
            res.send(JSON.stringify(data));
            mongoose.connection.close();
        });
    });
});


http.listen(3000, function () {
    console.log('EXPRESS SERVER IS RUNNING');
});