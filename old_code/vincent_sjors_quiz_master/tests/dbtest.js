/**
 * Created by Vincent on 2-11-2015.
 */
var mongoose = require('mongoose');
var chai = require('chai');

//var chaiAsPromised = require("chai-as-promised");
//chai.use(chaiAsPromised);

var expect = chai.expect;

var Question = require('../app').model;

var testDBName = 'testQuizDB';

describe("question", function() {


    before(function (done){
        if (mongoose.connection.readyState === 0) {
            mongoose.connect('mongodb://localhost/' + testDBName, done);
        }
    });

    beforeEach(function (done) {
        mongoose.connection.db.dropDatabase(done);
    });

    describe('Version 1 NORMAL ASYNC', function () {
        it('should create a question', function (done) {

            var q = new Question({
                question: "Who wrote Twilight series of novels?",
                answer: "Stephenie Meyer",
                category: "Art and Literature"
            });
            console.log("ik kom in de it");

            q.save(function (err) {

                expect(err).to.be.null;

                Question.findOne({}, function(err, question) {
                    expect(question._id).to.exist;
                    expect(question.question).to.equal("Who wrote Twilight series of novels?");
                    expect(question.answer).to.equal("Stephenie Meyer");
                    expect(question.category).to.equal("Art and Literature");
                    done();
                });
            });
        });
    });
    //after(function (done) {
    //    mongoose.disconnect(function () {
    //        done();
    //    });
    //});

});

