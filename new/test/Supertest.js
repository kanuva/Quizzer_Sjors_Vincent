quizzer = require('../app.js').quizzer;
request = require('supertest');

describe("getAllcategories", function() {
    it('GET /categories retrieve JSON response', function(done) {
        request(quizzer)
            .get('/categories')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .end(function(err, res){
                if(err) return(done(err));
                done();
            });
    });
});