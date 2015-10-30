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
  reset: 5 * 60
};
var suppressor = new Suppressor(request.session, options);

passport.authenticate('local', function(error, user) {
  if(error){
    return next(error);
  }
  else {
    request.logIn(user, function(error) {
      if(error) {
        suppressor.increment(request, function(error, overLimit) {
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
        suppressor.clear();
        // Log in was successful
      }
    });
  }
})(request, response, next);
```

### Methods
-----------------------------------------------------

#### #Suppressor(session, options)
The constructor takes the request session object and an options object.
The available options properties are:
* ```whitelist```: An array containing whitelisted IP addresses. Default is an empty array.
* ```blacklist```: An array containing blacklist IP addresses. Default is an empty array.
* ```count```: The number of tries before blocking. Default is 5.
* ```reset```: The number of seconds until the try count is reset. Default is 300 seconds (5 min).


#### #increment( request, callback)
Increments the try count. Requires the request object and a callback.
The callback is past an error, if one occurs, and a boolean value of whether the try count is over the limit.

#### #clear()
Clears the saved count number and the last try time.


### License
-----------------------------------------------------

Suppressor is licensed under the MIT license.

Copyright (c) 2015 Bryan Kizer

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
