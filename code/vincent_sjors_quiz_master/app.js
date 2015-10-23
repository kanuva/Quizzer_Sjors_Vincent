var path = require('path');
var mongoose = require('mongoose');
var express = require('express');
var socketio = require('socket.io');
var quizzer = express();
var http = require('http').createServer(quizzer);
var io = socketio.listen(http);

var rooms = [];
//var db = mongoose.connection;

//var quizSchema = mongoose.Schema({
//    question: String,
//    category: String,
//    Answer: String
//});

//var Quizquestions = mongoose.model('Quizquestions', quizSchema);

io.sockets.on('connection', function (socket) {
    socket.on('create', function (room) {
        socket.join(room);
        console.log("ik kreeg een room binnen genaamd: " + room)
        rooms.push(room);
    });
    socket.on('join', function (room) {
        console.log("ik wil room joinen: " + room);
        if (in_array(room, rooms)) {
            socket.join(room);
            console.log("joined: "+room);
        }
        else {
            console.log("nee jij mag niet joinen" + room);
            io.to(socket.id).emit('refuse');
        }
    });
    socket.on('meldAanwezig', function (data){
        console.log("iemand wil zich aanwezig melden genaamd:" + data.Teamname);
        io.to(data.Roomname).emit('nieuweclient', data);
    })
});

function in_array(needle, haystack) {
    if (haystack.indexOf) return haystack.indexOf(needle) > -1;
    for (var i = 0; i<haystack.length;i++){
        if (haystack[i] == needle) {
            return true;
        }
    }
    return false;
}

//Express
quizzer.use(express.static(path.join(__dirname, 'client-side')));

quizzer.get('/', function (req, res) {
    //res.send('Hello World!');
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


//WebSocket
//ws.on('open', function connection() {
//  ws.send('test');
//});
//
//ws.on('message', function incomming(message) {
//  console.log('message recieved');
//});


http.listen(3000, function () {
    console.log('EXPRESS SERVER IS RUNNING');
});
