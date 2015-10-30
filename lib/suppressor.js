'use strict';


var defaults = {
  whitelist: [],
  blacklist: [],
  count: 5,
  reset: (5 * 60) // 5 minutes
};


/**
 * Initializes a new instance of the Suppressor class.
 * @param {Object} session   The session object.
 * @param {Number} options   The options object.
 */
function Suppressor(session, options) {
  options = options || {};
  this._session = session;
  this._count = options.count || defaults.counts;
  this._reset = options.reset || defaults.reset;
  this._whitelist = options.whitelist || defaults.whitelist;
  this._blacklist = options.blacklist || defaults.blacklist;
}


/**
 * Increments the the try counter that is stored in the session.
 * @param  {Object}    response  The Express Response object.
 * @param  {Object}    request   The Express Request object.
 * @param  {Function}  callback  The callback function(error, overLimit).
 */
Suppressor.prototype.increment = function(response, request, callback) {
  var _this = this;

  try {
    if(~_this._whitelist.indexOf(request.connection.remoteAddress)) {
      return callback(null, false);
    }

    if(~_this._blacklist.indexOf(request.connection.remoteAddress)) {
      return callback(null, true);
    }

    _this._session.loginCount = _this._session.loginCount || 0;
    _this._session.loginCount++;

    if(_this._session.loginCount > _this._tryCount) {
      if(_this._session.lastTry) {
        var lastTry = new Date(_this._session.lastTry);
        var now = new Date();
        var timeout = (now.getTime() - lastTry.getTime()) / 1000;

        if(timeout > _this._reset) {
          _this._session.loginCount = 1;
          _this._session.lastTry = new Date();
          return callback(null, false);
        }
        else {
          return callback(null, true);
        }
      }
      else {
        _this._session.lastTry = new Date();
        return callback(null, true);
      }
    }
    else {
      return callback(null, false);
    }
  }
  catch(error) {
    callback(error);
  }
};


/**
 * Clears the session values.
 */
Suppressor.prototype.clear = function() {
  var _this = this;
  _this._session.loginCount = null;
  _this._session.lastTry = null;
};



module.exports = Suppressor;
