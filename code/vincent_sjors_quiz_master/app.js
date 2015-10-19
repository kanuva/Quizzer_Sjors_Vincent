var path = require('path');

var express = require('express');
var quizzer = express();

var WebSocket = require('ws').Server;
var ws = new WebSocket({port: 8080});

//Express
quizzer.use(express.static(path.join(__dirname, 'client-side')));

quizzer.get('/', function (req, res) {
    //res.send('Hello World!');
});


//WebSocket
ws.on('open', function connection() {
  ws.send('test');
});

ws.on('message', function incomming(message) {
  console.log('message recieved');
});


var server = quizzer.listen(3000, function() {
  console.log('EXPRESS SERVER IS RUNNING');
});
