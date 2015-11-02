'use strict';

var merge = require('lodash.merge');
var Promise = require('bluebird');

/**
 * Sensible defaults
 */
var defaults = {
  whitelist: [],
  blacklist: [],
  count: 5,
  reset: (5 * 60), // 5 minutes
  field: 'loginCount'
};


/**
 * Initializes a new instance of the Suppressor class.
 * @param {Object} session   The session object.
 * @param {Number} options   The options object.
 */
function Suppressor(session, options) {
  options = options || {};
  this._session = session;
  this._options = merge(defaults, options);
}


/**
 * Increments the the try counter that is stored in the session.
 * @param  {Object}    request   The Express Request object.
 * @param  {Function}  callback  The callback function(error, overLimit).
 */
Suppressor.prototype.increment = function(request, callback) {
  var _this = this;

  try {
    if(request) {
      if(~_this._options.whitelist.indexOf(request.connection.remoteAddress)) {
        if(callback) {
          return callback(null, false);
        }
        else {
          return Promise.resolve(false);
        }
      }

      if(~_this._options.blacklist.indexOf(request.connection.remoteAddress)) {
        if(callback) {
          return callback(null, true);
        }
        else {
          return Promise.resolve(true);
        }
      }
    }

    _this._session[_this._options.field] = _this._session[_this._options.field] || 0;
    _this._session[_this._options.field]++;

    if(_this._session[_this._options.field] > _this._options.count) {
      if(_this._session.lastTry) {
        var lastTry = new Date(_this._session.lastTry);
        var now = new Date();
        var timeout = (now.getTime() - lastTry.getTime()) / 1000;

        if(timeout > _this._options.reset) {
          _this._session[_this._options.field] = 1;
          _this._session.lastTry = new Date();

          if(callback) {
            return callback(null, false);
          }
          else {
            return Promise.resolve(false);
          }
        }
        else {
          if(callback) {
            return callback(null, true);
          }
          else {
            return Promise.resolve(true);
          }
        }
      }
      else {
        _this._session.lastTry = new Date();

        if(callback) {
          return callback(null, true);
        }
        else {
          return Promise.resolve(true);
        }
      }
    }
    else {
     if(callback) {
        return callback(null, false);
      }
      else {
        return Promise.resolve(false);
      }
    }
  }
  catch(error) {
    if(callback) {
      callback(error);
    }
    else {
      return Promise.reject(error);
    }
  }
};


/**
 * Clears the session values.
 */
Suppressor.prototype.clear = function() {
  var _this = this;
  _this._session[_this._options.field] = null;
  _this._session.lastTry = null;
};



module.exports = Suppressor;
