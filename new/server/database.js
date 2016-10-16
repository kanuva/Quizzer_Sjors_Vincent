var mongoose = require('mongoose')
/*
================================================================================
    Mongoose
================================================================================
*/
var questions = require('./db/import');
var db = mongoose.connect('mongodb://localhost/quizzer');
var Schema = mongoose.Schema;



var questionSchema = new Schema({
    question:   { type: String, required: true },
    answer:     { type: String, required: true },
    category:   { type: String, required: true }
}, { collection: 'questions' });



var teamSchema = new Schema({
    name:       { type: String, required: true },
    socket_id:  { type: String, required: true },
    score:      { type: Number, required: false, default: 0 }
}, { collection: 'teams' });



var gameSchema = new Schema({
    room:       { type: String, required: true },
    questions:  [],
    master:     { type: String, required: true },
    scoreboard: { type: String, required: true, default: false },
    teams: [
      {
        name:       { type: String, required: true },
        socket_id:  { type: String, required: true },
        accepted:   { type: String, required: true },
        score:      { type: Number, required: true, default: 0 }
      }
    ],
    categories:   [],
    round:   { type: Number, required: true },
    started:   { type: Boolean, required: true },
    ended:   { type: Boolean, required: true }
}, { collection: 'games' });



var questionModel = db.model('question', questionSchema);
var gameModel = db.model('game', gameSchema);
var teamModel = db.model('team', teamSchema);

// Fill collection when it's empty
questionModel.count({}, function(error, count) {
    if(count <= 0) {
        questionModel.create(questions);
        console.log('filled collection questions with: ' + questions.length + ' documents' );
    }
});




model = {
  question : questionModel,
  game: gameModel,
  team: teamModel,
};

module.exports = model;
