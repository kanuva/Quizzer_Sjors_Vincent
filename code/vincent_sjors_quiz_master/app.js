var path = require('path');
var mongoose = require('mongoose');
var express = require('express');
var socketio = require('socket.io');
var quizzer = express();
var http = require('http').createServer(quizzer);
var io = socketio.listen(http);

var rooms = [];
var clients = [];
//var Teamwhowantstojoin = {};
var db = mongoose.connection;

var Questions = mongoose.Schema({
    question: String,
    answer: String,
    category: String
}, {collection: 'questions'});

var QuizQuestions = mongoose.model('QuizQuestions', Questions);

io.sockets.on('connection', function (socket) {
    socket.on('joinOrCreate', function (data) {
        socket.join(data.roomname);
        if (data.funtie === "create") {
            rooms.push(data.roomname, socket.id, false);
            console.log("room: " + data.roomname + ", quizzmastersocketid: " + socket.id);
        }
    });
    socket.on('join', function (data) {
        console.log("ik wil room joinen: " + data.Roomname);
        io.to(socket.id).emit('yourID', {socketID: socket.id});
        if (in_array(data.Roomname, rooms)) {
            console.log("ik stuur een ID naar een client: " + socket.id);

            io.to(data.Roomname).emit('nieuweclient', {
                Teamname: data.Teamname,
                Roomname: data.Roomname,
                clientID: socket.id
            })
        }
        else {
            console.log("nee jij mag niet joinen omdat de room niet bestaat: " + socket.id);
            io.to(socket.id).emit('refuse', {clientID: socket.id});
        }
    });

    socket.on('teamisAccepted', function (data) {
        clients.push(data);
        //io.to(data.clientID).emit('JebentAccepted', {roomname: data.roomname});
        //console.log("ik accepteer iemand voor roomname: " + data.roomname);
        io.emit('JebentAccepted', {roomname: data.roomname, clientID: data.teamID});
    });

    socket.on('teamisRefused', function (data) {
        //console.log("de master heeft declined: ");
        //console.log(data.clientID);
        io.emit('refuse', {clientID: data.clientID});
    });
    //socket.on('meldAanwezig', function (data){
    //    console.log("iemand wil zich aanwezig melden genaamd:" + data.Teamname);
    //    io.to(data.Roomname).emit('nieuweclient', data);
    //});

    socket.on('testfunctie', function (data) {
        console.log(socket.id);
        console.log(rooms[(rooms.indexOf(socket.id) - 1)]);

        io.to(rooms[(rooms.indexOf(socket.id) - 1)]).emit('testttt', data);
    });

    socket.on('pushQuestion', function (data) {
        io.to(data.roomID).emit('questionPull', data);
    });


    socket.on('sendGivenAnswer', function (data) {
        var clientName;
        for(var i=0; i < clients.length; i++) {
            var teamID = clients[i].teamID.replace(/\s+$/, '');

            if(socket.id == teamID) {
                clientName = clients[i].teamName;
            }
        }

        var result = [data, clientName];
        io.to(rooms[0]).emit('sendAnswer' , result);
        console.log(result);
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


//quizzer.get('/master', function(req,res) {
//  mongoose.connect('mongodb://localhost/quizmaster');
//  db.onerror(console.error.bind(console, 'connection error:'));
//  db.once('open', function(callback){
//    Quizquestions.find(function (err,Quizquestions) {
//      if (err) return console.log(err);
//      res.send(JSON.stringify(Quizquestions))
//    })
//  })
//});


http.listen(3000, function () {
    console.log('EXPRESS SERVER IS RUNNING');
});
