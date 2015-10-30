var chai    = require('chai');
var assert  = chai.assert;

var Suppressor = require('../lib/suppressor');

var sess = {
  loginCount: 1,
  lastTry: new Date()
};

var req = {
  connection: {
    remoteAddress: '127.0.0.1'
  }
};



suite('Suppressor', function() {

  suite('#increment', function() {

  });

  suite('#clear', function() {
    test('clears the session counter', function() {
      var sup = new Suppressor(sess);
      sess.loginCount = 5;
      sup.clear();
      assert.isNull(sess.loginCount);
    });

    test('clears the session timer', function() {
      var sup = new Suppressor(sess);
      sup.clear();
      assert.isNull(sess.lastTry);
    });
  });

});
