var redis   = require('redis');
var Promise = require('bluebird');


var namespaceField = function(id) {
  return 'suppressor_' + id;
};

var getRecord = function(ctx, id, callback) {
  id = namespaceField(id);
  ctx.client.get(id, function(error, record) {
    if(error) {
      callback(error);
    }
    else {
      callback(null, JSON.parse(record));
    }
  });
};


function RedisDriver(host, port, options) {
  this.host = host || '127.0.0.1';
  this.port = port || 6379;
  this.options = options || {};
  this.client = redis.createClient(port, host, options);
}

RedisDriver.prototype.increment = function(field, id) {
  var _this = this;
  return new Promise(function(resolve, reject) {
    getRecord(_this, id, function(error, record) {
      if(error) {
        return reject(error);
      }

      if(!record) {
        record = {};
        record[field] = 1;
        record.lastTry = null;
        record.lookup = id;
      }
      else {
        record[field]++;
      }

      _this.client.set(namespaceField(id), JSON.stringify(record));
      return resolve(id);
    });
  });
};

RedisDriver.prototype.count = function(field, id) {
  var _this = this;
  return new Promise(function(resolve, reject) {
    getRecord(_this, id, function(error, record) {
      if(!record) {
        reject(new Error('unknown record'));
      }
      else {
        var val = record[field] || 0;
        resolve(val);
      }
    });
  });
};

RedisDriver.prototype.time = function(id) {
  var _this = this;
  return new Promise(function(resolve, reject) {
    getRecord(_this, id, function(error, record) {
      if(!record) {
        reject(new Error('unknown record'));
      }
      else {
        resolve(record.lastTry);
      }
    });
  });
};

RedisDriver.prototype.setTime = function(id) {
  var _this = this;
  return new Promise(function(resolve, reject) {
    getRecord(_this, id, function(error, record) {
      if(!record) {
        reject(new Error('unknown record'));
      }
      else {
        record.lastTry = new Date();
        _this.client.set(namespaceField(id), JSON.stringify(record));
        resolve(id);
      }
    });
  });
};

RedisDriver.prototype.clear = function(field, id) {
  var _this = this;
  return new Promise(function(resolve, reject) {
    getRecord(_this, id, function(error, record) {
      if(!record) {
        reject(new Error('unknown record'));
      }
      else {
        record[field] = null;
        record.lastTry = null;
        _this.client.set(namespaceField(id), JSON.stringify(record));
        resolve(id);
      }
    });
  });
};

module.exports = RedisDriver;
