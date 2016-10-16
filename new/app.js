var path        = require('path');
var mongoose    = require('mongoose');
var express     = require('express');
var app         = express();

var server      = require('http').Server(app);
var io          = require('socket.io')(server);

// Application variables
var games = []; // room, started, rounds, teamscores, teams, master, connected scoreboard, questions asked, selected categories
var teams = []; // all teams, that didn't join a game

// Database
var model = require('./server/database');

// Init
require('./server/init');

// Middleware
require('./server/middleware');

// Routes
var router = require('./server/routes');
app.use('/', router);

// Sockets.io
require('./server/sockets').listen(server, games);

// Serve
app.use(express.static('public'));

server.listen(1337, function() {
    console.log('server is now running at port 1337');
});
