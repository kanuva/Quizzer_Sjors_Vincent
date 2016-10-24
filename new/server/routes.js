var express     = require('express');
var mongoose    = require('mongoose');
/*
================================================================================
    Mongoose
================================================================================
*/
var model = require('./database');
var Game = model.game;
var Question = model.question;
var Team = model.team;
/*
================================================================================
    Routes
================================================================================
*/
var router = express.Router();

router.get('/categories', function(request, response) {
    Question.find({}).distinct('category', function(error, categories) {
        response.json(categories);
    });
});

router.get('/questions/:categoryOne/:categoryTwo?/:categoryThree?', function(request, response){

    Question.find({category: {$in:[request.params.categoryOne, request.params.categoryTwo, request.params.categoryThree]}}).exec(function(err, questions){
        response.json(questions);
    });

});

router.get('/games', function(request, response) {

    Game.find({}).exec(function(error, games) {
        response.json(games);
    });

});

router.get('/game/:password/teams', function(request, response) {

    var password = request.params.password;

    Game.findOne({ room: password }).exec(function(error, game) {
        response.json(game);
    });

});

router.get('/teams', function(request, response) {

    Team.find({}).exec(function(error, teams) {
        response.json(teams);
    });

});

module.exports = router;
