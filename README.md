## Suppressor
Simple module that helps limit log in requests made to an Express application.

### Install
-----------------------------------------------------

Install the package
```bash
npm install suppressor --save
```

Then simply include the module and add it into the application.
```javascript
var Suppressor = require('suppressor');
var options = {
  count: 5,
  reset: 5 * 60,
  driver: 'session',
  session: request.session
};
var suppressor = new Suppressor(options);

passport.authenticate('local', function(error, user) {
  request.logIn(user, function(error) {
    if(error) {
      suppressor.increment(request, null, function(error, overLimit) {
        if(error) {
          next(error);
        }
        else {
          if(overLimit) {
            // Do something with when the
            // limit has been exceeded
          }
          else {
            // Log in failed but limit hasn't been hit
          }
        }
      });
    }
    else {
      suppressor.clear(null, function(error) {
        // Log in was successful
      });
    }
  });

})(request, response, next);
```

If the callback is omitted, than a Promise is returned.
```javascript
var Suppressor = require('suppressor');
var options = {
  count: 5,
  reset: 5 * 60,
  driver: 'session',
  session: request.session
};
var suppressor = new Suppressor(options);

passport.authenticate('local', function(error, user) {
  request.logIn(user, function(error) {
    if(error) {
      suppressor
        .increment(request, null)
        .then(function(overLimit) {
          if(overLimit) {
            // Do something with when the
            // limit has been exceeded
          }
          else {
            // Log in failed but limit hasn't been hit
          }
        })
    }
    else {
      suppressor
        .clear(null)
        .then(function() {
          // Log in was successful
        });
    }
  });
})(request, response, next);
```


### Methods
-----------------------------------------------------

#### #Suppressor(options)
The constructor takes an options object.
The available options properties are:
* ```driver```: The type of driver to use. The available options are ```session```, ```mongo``` and ```redis```.
* ```session```: The application's session object, only needed when using the session driver.
* ```conString```: The Mongo DB connection string, only needed when using the mongo driver.
* ```collection```: The Mongo DB collection to use, only needed when using the mongo driver.
* ```host```: The redis host to use, only needed when using the redis driver. [Defaults to '127.0.0.1']
* ```port```: The redis port to use, only needed when using the redis driver. [Defaults to 6379]
* ```options```: Any additional options to passed to the underlying redis connection.
* ```whitelist```: An array containing whitelisted IP addresses, these addresses skip all attempt counts. Default is an empty array.
* ```blacklist```: An array containing blacklist IP addresses, these addresses are always rejected. Default is an empty array.
* ```count```: The number of tries before blocking. Default is 5.
* ```reset```: The number of seconds until the try count is reset. Default is 300 seconds (5 min).
* ```field```: The field name to track and increment. Defaults to 'loginCount'.

__Bare minimum for each driver__
```javascript
var session = {
  count: 5,
  reset: 5 * 60,
  driver: 'session',
  session: request.session
};
var sessionSuppressor = new Suppressor(session);

var mongo = {
  count: 5,
  reset: 5 * 60,
  driver: 'mongo',
  conString: 'mongodb://localhost/suppressor',
  collection: 'limiter'
};
var mongoSuppressor = new Suppressor(mongo);

var redis = {
  count: 5,
  reset: 5 * 60,
  driver: 'redis'
};
var redisSuppressor = new Suppressor(redis);
```


#### #increment(request, id[, callback])
Increments the try count. Requires the request object and an id. The callback can be omitted to return a Promise.
The ID parameter can be null when using the Session driver as it handles IDs automatically.
The callback is passed an error, if one occurs, and a boolean value of whether the try count is over the limit.
If no callback is provided than a bluebird Promise is returned.

#### #clear(id[, callback])
Clears the saved count number and the last try time. The callback can be omitted to return a Promise.
The ID parameter can be null when using the Session driver as it handles IDs automatically.


### License
-----------------------------------------------------

Suppressor is licensed under the MIT license.

Copyright (c) 2015 Bryan Kizer

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
