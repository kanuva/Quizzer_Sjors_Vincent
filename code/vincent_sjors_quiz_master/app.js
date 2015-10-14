var express = require('express');
var quizzer = express();
var path = require('path');


quizzer.use(express.static(path.join(__dirname, 'client-side')));

quizzer.get('/', function (req, res) {
    //res.send('Hello World!');
});


var server = quizzer.listen(3000);