var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  var likesAfterOne;
  var likesAfterLike;
  var relLikesTwo;

  suite('GET /api/stock-prices/', function() {

    test('Viewing one stock', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'GOOG' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.isNumber(res.body.stockData.price);
          assert.isNumber(res.body.stockData.likes);
          likesAfterOne = res.body.stockData.likes;
          done();
        });
    });

    test('Viewing one stock and liking it', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'GOOG', like: true })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.isNumber(res.body.stockData.price);
          assert.isNumber(res.body.stockData.likes);
          assert.isAtLeast(res.body.stockData.likes, likesAfterOne);
          likesAfterLike = res.body.stockData.likes;
          done();
        });
    });

    test('Viewing the same stock and liking it again', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: 'GOOG', like: true })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.isNumber(res.body.stockData.price);
          assert.equal(res.body.stockData.likes, likesAfterLike);
          done();
        });
    });

    test('Viewing two stocks', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: ['GOOG', 'MSFT'] })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData);
          assert.lengthOf(res.body.stockData, 2);
          assert.equal(res.body.stockData[0].stock, 'GOOG');
          assert.equal(res.body.stockData[1].stock, 'MSFT');
          assert.isNumber(res.body.stockData[0].price);
          assert.isNumber(res.body.stockData[1].price);
          assert.isNumber(res.body.stockData[0].rel_likes);
          assert.isNumber(res.body.stockData[1].rel_likes);
          assert.equal(res.body.stockData[0].rel_likes, -res.body.stockData[1].rel_likes);
          relLikesTwo = res.body.stockData[0].rel_likes;
          done();
        });
    });

    test('Viewing two stocks and liking them', function(done) {
      chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: ['GOOG', 'MSFT'], like: true })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body.stockData);
          assert.lengthOf(res.body.stockData, 2);
          assert.equal(res.body.stockData[0].stock, 'GOOG');
          assert.equal(res.body.stockData[1].stock, 'MSFT');
          assert.isNumber(res.body.stockData[0].price);
          assert.isNumber(res.body.stockData[1].price);
          assert.isNumber(res.body.stockData[0].rel_likes);
          assert.isNumber(res.body.stockData[1].rel_likes);
          assert.equal(res.body.stockData[0].rel_likes, -res.body.stockData[1].rel_likes);
          assert.isTrue(res.body.stockData[0].rel_likes === relLikesTwo || res.body.stockData[0].rel_likes === relLikesTwo - 1);
          done();
        });
    });

  });

});
