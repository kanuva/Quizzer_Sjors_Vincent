quizzer = require('./../app');
request = require('supertest');

describe("getAllQuestions", function() {
    it('GET /question retrieve JSON response', function(done) {
        request(quizzer)
            .get('/questions')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .end(function(err, res){
                if(err) return(done(err));
                done();
        });
    });


});