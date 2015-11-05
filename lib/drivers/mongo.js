var mongodb = require('mongodb')
var MongoClient = mongodb.MongoClient;


var connect = function(ctx) {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(ctx.connectionString, function(error, db) {
      if(error) {
        reject(error);
      }
      else {
        var collection = db.collection(ctx.collectionName);
        resolve(collection);
      }
    });
  });
};

var insertIncDoc = function(collection, id, field) {
  return new Promise(function(resolve, reject) {
    var obj = {
      lookup: id,
      lastTry: null
    };
    obj[field] = 1;

    collection.insertOne(obj, function(error, result) {
      if(error) {
        reject(error);
      }
      else {
        resolve(id);
      }
    });
  });
};


function MongoDriver(conString, collection) {
  if(!conString) {
    throw new Error('no connection string given');
  }

  if(!collection) {
    throw new Error('No collection specified');
  }

  var _this = this;
  _this.connectionString = conString;
  _this.collectionName = collection;
}

MongoDriver.prototype.increment = function(field, id) {
  var _this = this;
  return connect(_this)
    .then(function(collection) {
      return collection
        .find({ lookup: id })
        .limit(1)
        .toArray()
        .then(function(docs) {
          if(!docs.length) {
            return insertIncDoc(collection, id, field);
          }
          else {
            var doc = docs[0];
            var update = {
              $set: {}
            };
            update.$set[field] = doc[field] + 1;
            collection.updateOne({ lookup: id }, update);

            return Promise.resolve(id);
          }
        });
    });
};

MongoDriver.prototype.count = function(field, id) {
  var _this = this;
  return connect(_this)
    .then(function(collection) {
      return collection
        .find({ lookup: id })
        .limit(1)
        .toArray()
        .then(function(docs) {
          if(!docs.length) {
            Promise.reject(new Error('unknown record'));
          }
          else {
            var doc = docs[0];
            var val = doc[field] || 0;
            return Promise.resolve(val);
          }
        });
    });
};

MongoDriver.prototype.time = function(id) {
  var _this = this;
  return connect(_this)
    .then(function(collection) {
      return collection
        .find({ lookup: id })
        .limit(1)
        .toArray()
        .then(function(docs) {
          if(!docs.length) {
            Promise.reject(new Error('unknown record'));
          }
          else {
            var doc = docs[0];
            return Promise.resolve(doc.lastTry);
          }
        });
    });
};

MongoDriver.prototype.setTime = function(id) {
  var _this = this;
  return connect(_this)
    .then(function(collection) {
      return collection
        .find({ lookup: id })
        .limit(1)
        .toArray()
        .then(function(docs) {
          if(!docs.length) {
            return Promise.reject(new Error('unknown record'));
          }
          else {
            var doc = docs[0];
            collection.updateOne({ lookup: id }, {$set: {lastTry: new Date()}});

            return Promise.resolve(id);
          }
        });
    });
};

MongoDriver.prototype.clear = function(field, id) {
  var _this = this;
  return connect(_this)
    .then(function(collection) {
      return collection
        .find({ lookup: id })
        .limit(1)
        .toArray()
        .then(function(docs) {
          if(!docs.length) {
            return Promise.reject(new Error('unknown record'));
          }
          else {
            var doc = docs[0];
            var update = {
              $set: {
                lastTry: null
              }
            };
            update.$set[field] = null;
            collection.updateOne({ lookup: id }, update);

            return Promise.resolve(id);
          }
        });
    });
};

module.exports = MongoDriver;
