

var con = 'mongodb://localhost/suppressor';
var mongoDriver = require(__dirname + '/lib/drivers/mongo');
var redisDriver = require(__dirname + '/lib/drivers/redis');

var md = new mongoDriver(con, 'log');
var rd = new redisDriver();



rd
  .increment('asdfasdfasdfds', 'counter')
  .then(function(value) {
    console.log(value);
    process.exit();
  });

// md
//   .clear('asdfasdfasdfds', 'counter')
//   .then(function(value) {
//     console.log(value);
//     process.exit();
//   });
