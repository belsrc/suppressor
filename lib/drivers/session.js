var Promise = require('bluebird');


function SessionDriver(session) {
  if(!session) {
    throw new Error('no session object given');
  }

  this.session = session;
}

SessionDriver.prototype.increment = function(field, id) {
  var _this = this;
  _this.session[field] = _this.session[field] || 0;
  _this.session[field]++;
  return Promise.resolve(id);
};

SessionDriver.prototype.count = function(field, id) {
  var _this = this;
  var count = _this.session[field] || 0;
  return Promise.resolve(count);
};

SessionDriver.prototype.time = function(id) {
  var _this = this;

  if(_this.session.lastTry) {
    return Promise.resolve(new Date(_this.session.lastTry));
  }
  else {
    return Promise.resolve(null);
  }
};

SessionDriver.prototype.setTime = function(id) {
  var _this = this;
  _this.session.lastTry = new Date();
  return Promise.resolve(id);
};

SessionDriver.prototype.clear = function(field, id) {
  var _this = this;

  _this.session[field] = null;
  _this.session.lastTry = null;
  return Promise.resolve(id);
};

module.exports = SessionDriver;
