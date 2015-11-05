var chai   = require('chai');
var assert = chai.assert;
var merge  = require('lodash.merge');

var Suppressor = require('../lib/suppressor');

var req = {
  connection: {
    remoteAddress: '127.0.0.1'
  }
};

var options = {
  count: 5,
  reset: 5 * 60,
  field: 'counter',
  driver: 'session'
};


suite('Suppressor', function() {

  suite('#increment', function() {

    test('does NOT throw for null request', function() {
      var sess = function(){};
      options.session = sess;
      var sup = new Suppressor(options);
      assert.doesNotThrow(function() {
        sup.increment(null, function() {});
      });
    });

    test('returns Promise when no callback is given', function() {
      var sess = function(){};
      options.session = sess;
      var sup = new Suppressor(options);
      var result = sup.increment(req);
      var actual = result.constructor.name;
      assert.strictEqual(actual, 'Promise');
    });

    test('correctly increments field value', function() {
      var sess = function(){};
      options.session = sess;
      var sup = new Suppressor(options);

      // Doesnt exist before inc call
      assert.isUndefined(sess.counter);

      // inc call adds the field and incs to one
      sup.increment(req, function(error, actual) {
        var expected = 1;
        assert.strictEqual(expected, sess.counter);
      });
    });

    test('always returns true for blacklisted', function() {
      var tmp = JSON.parse(JSON.stringify(options));
      tmp.blacklist = ['127.0.0.1'];
      var expected = true;

      var sess = function(){};
      tmp.session = sess;
      var sup = new Suppressor(tmp);

      sup.increment(req, function(error, actual) {
        return assert.strictEqual(expected, actual);
      });

      var sess2 = {counter: 6};
      tmp.session = sess2;
      var sup2 = new Suppressor(tmp);

      sup2.increment(req, function(error, actual) {
        return assert.strictEqual(expected, actual);
      });
    });

    test('always returns false for whitelisted', function() {
      var tmp = {
        count: 5,
        reset: 5 * 60,
        field: 'counter',
        whitelist: ['127.0.0.1'],
        driver: 'session'
      };
      var expected = false;

      var sess = function(){};
      tmp.session = sess;
      var sup = new Suppressor(tmp);
      sup.increment(req, function(error, actual) {
        return assert.strictEqual(expected, actual);
      });

      var sess2 = {counter: 6};
      tmp.session = sess2;
      var sup2 = new Suppressor(tmp);
      sup2.increment(req, function(error, actual) {
        assert.strictEqual(expected, actual);
      });
    });

    test('returns false when below the limit', function() {
      var sess = function(){};
      options.session = sess;
      var sup = new Suppressor(options);
      var expected = false;

      sup.increment(req, function(error, actual) {
        assert.strictEqual(expected, actual);
      });
    });

    test('returns true when above the limit', function() {
      var sess = {counter: 6};
      options.session = sess;
      var sup = new Suppressor(options);
      var expected = true;

      sup.increment(req, function(error, actual) {
        assert.strictEqual(expected, actual);
      });
    });
  });

  suite('#clear', function() {

    test('clears the session counter', function() {
      var sess = function(){};
      var options = {
        count: 5,
        reset: 5 * 60,
        field: 'counter',
        driver: 'session'
      };

      sess[options.field] = 5;
      options.session = sess;
      var sup = new Suppressor(options);

      sup.clear(options.field, function() {
        assert.isNull(sess[options.field]);
      });
    });

    test('clears the session timer', function() {
      var sess = function(){};
      var options = {
        count: 5,
        reset: 5 * 60,
        field: 'counter',
        driver: 'session'
      };

      sess.lastTry = new Date();
      options.session = sess;
      var sup = new Suppressor(options);

      sup.clear(null, function() {
        assert.isNull(sess.lastTry);
      });
    });
  });

});
