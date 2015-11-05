'use strict';

var merge = require('lodash.merge');
var Promise = require('bluebird');

var mongoDriver = require(__dirname + '/drivers/mongo');
var redisDriver = require(__dirname + '/drivers/redis');
var sessionDriver = require(__dirname + '/drivers/session');

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


/*
{
  // type of driver {session, mongo, redis}
  driver: '',

  // if session type, the session object to use
  session: Obj,

  // If mongo type, the connection string and collection name
  conString: '',
  collection: '',

  // If redis type, the host, port and any options to pass to the driver
  host: '',
  port: num,
  options: Obj
}
 */

var getDriver = function(obj) {
  switch(obj.driver) {
    case 'session':
      return new sessionDriver(obj.session);

    case 'mongo':
      return new mongoDriver(obj.conString, obj.collection);

    case 'redis':
      return new redisDriver(obj.host, obj.port, obj.options);

    default:
      throw new Error('Unknown driver');
  }
};



/**
 * Initializes a new instance of the Suppressor class.
 * @param {Number} options   The options object.
 */
function Suppressor(options) {
  options = options || {};

  // Need to clone the defaults otherwise the merge func will modify
  // the defaults and that persists
  this._options = merge(JSON.parse(JSON.stringify(defaults)), options);
  this._driver = getDriver(this._options);
}


/**
 * Increments the the try counter that is stored in the session.
 * @param  {Object}    request   The Express Request object.
 * @param  {Function}  callback  The callback function(error, overLimit).
 */
Suppressor.prototype.increment = function(request, id, callback) {
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

    return _this._driver
      .increment(_this._options.field, id)
      .then(function() {
        return _this._driver.count(_this._options.field, id);
      })
      .then(function(count) {
        if(count > _this._options.count) {
          return _this._driver
            .time(id)
            .then(function(time) {
              if(time) {
                return _this._driver
                  .increment(_this._options.field, id)
                  .then(function() {
                    return _this._driver.setTimesetTime(id);
                  })
                  .then(function() {
                    if(callback) {
                      return callback(null, false);
                    }
                    else {
                      return Promise.resolve(false);
                    }
                  })
              }
              else {
                return _this._driver
                  .setTime(id)
                  .then(function() {
                    if(callback) {
                      return callback(null, true);
                    }
                    else {
                      return Promise.resolve(true);
                    }
                  })
              }
            })
        }
        else {
          if(callback) {
             return callback(null, false);
           }
           else {
             return Promise.resolve(false);
           }
        }
      })


    // _this._session[_this._options.field] = _this._session[_this._options.field] || 0;
    // _this._session[_this._options.field]++;
    //
    // if(_this._session[_this._options.field] > _this._options.count) {
    //   if(_this._session.lastTry) {
    //     var lastTry = new Date(_this._session.lastTry);
    //     var now = new Date();
    //     var timeout = (now.getTime() - lastTry.getTime()) / 1000;
    //
    //     if(timeout > _this._options.reset) {
    //       _this._session[_this._options.field] = 1;
    //       _this._session.lastTry = new Date();
    //
    //       if(callback) {
    //         return callback(null, false);
    //       }
    //       else {
    //         return Promise.resolve(false);
    //       }
    //     }
    //     else {
    //       if(callback) {
    //         return callback(null, true);
    //       }
    //       else {
    //         return Promise.resolve(true);
    //       }
    //     }
    //   }
    //   else {
    //     _this._session.lastTry = new Date();
    //
    //     if(callback) {
    //       return callback(null, true);
    //     }
    //     else {
    //       return Promise.resolve(true);
    //     }
    //   }
    // }
    // else {
    //  if(callback) {
    //     return callback(null, false);
    //   }
    //   else {
    //     return Promise.resolve(false);
    //   }
    // }





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
Suppressor.prototype.clear = function(id, callback) {
  var _this = this;
  _this._driver
    .clear(_this._options.field, id)
    .then(function() {
      if(callback) {
        return callback(null);
      }
      else {
        return Promise.resolve();
      }
    })
    .catch(function(error) {
      if(callback) {
        return callback(error);
      }
      else {
        return Promise.reject(error);
      }
    });
};



module.exports = Suppressor;
