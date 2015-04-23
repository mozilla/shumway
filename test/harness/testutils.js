/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function Test() {}
Test.prototype = {
  advance: function(delay) {
    TestContext.enqueue('advance', [delay], NullMessageSink);
  },
  mouse_move: function(x, y) {
    TestContext.enqueue('mouse-move', [x, y]);
  },
  mouse_press: function(x, y) {
    TestContext.enqueue('mouse-press', [x, y]);
  },
  mouse_release: function(x, y) {
    TestContext.enqueue('mouse-release', [x, y]);
  },
  render: function() {
    var image = new Image();
    TestContext.enqueue('get-image', null, image);
    return image;
  },
  reset: function(file) {
    TestContext.reset(file);
  },
  get rate() { return TestContext.defaultRate; },
  get quit() { throw 'not impl'; },
  get trace() {
    var buffer = new Buffer();
    TestContext.enqueue('get-trace', null, buffer);
    return buffer;
  },
  get launched() { throw 'not impl'; },
};

function Buffer() {
  this.loaded = new Promise;
}
Buffer.load = function(path) {
  var buffer = new Buffer();
  var xhr = new XMLHttpRequest();
  xhr.open("GET", path, true);
  xhr.onreadystatechange = function(event) {
    if (xhr.readyState === 4) {
      buffer.s = xhr.status == 200 || xhr.status == 0 ? xhr.responseText : null;
      buffer.loaded.resolve();
    }
  }
  xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT"); // no-cache
  xhr.send(null);
  return buffer;
}
Buffer.prototype = {
  _message: function (s) {
    this.s = s;
    this.loaded.resolve();
  },
  diff: function(buffer) {
    Promise.when(this.loaded, buffer.loaded).then(function() {
      TestContext.compareTextResults(this.s, buffer.s); 
    }.bind(this));
  },
  find: function() { throw 'not impl'; },
  sub: function() { throw 'not impl'; },
  toString: function() { throw 'not impl'; }
};

function Image(path) {
  this.loaded = new Promise;
  this.failed = false;
  this.img = document.createElement('img');
  this.img.onload = function() {
    this.loaded.resolve();
  }.bind(this);
  this.img.onerror = function() {
    this.failed = true;
    this.loaded.resolve();
  }.bind(this);
  if (path)
    this.img.src = path;
}
Image.prototype = {
  _message: function (data) {
    if (data) {
      this.img.src = data;
    } else {
      this.failed = true;
      this.loaded.resolve();
    }
  },
  save: function() {},
  compare: function(image) {
    Promise.when(this.loaded, image.loaded).then(function() {
      TextContext.compareImageResults(this.img, image.img); 
    }.bind(this));
  }
};

function Socket() {throw 'not impl'; }
Socket.prototype = {
  close: function() {throw 'not impl'; },
  error: function() {throw 'not impl'; },
  send: function() {throw 'not impl'; },
  get closed() { return false; }
};

var verbose = false;

var print = function (s) {
  if (verbose && s)
    console.log ("INFO: " + s);
};

var error = function (s) {
  if (verbose && s)
    console.error ("ERROR: " + s);
};

function Native() {}
Native.print = print;

function execStas(path, filenames, onprogress) {
  function complete(resultPromises) {
    for (var i =0; i < resultPromises.length; i++) {
      resultPromises[i].promise.then(function (i, result) {
        onprogress(i, resultPromises.length, resultPromises[i].filename, result);
      }.bind(null, i));
    }
  }
  function exec(code) {
    var resultPromises = [];
    TestContext.onprogress = function (filename, promise) {
      resultPromises.push({filename: filename, promise: promise});
    };
    var jsCode = "var run_test, fail;\n" + code;
    var fn = new Function('filenames', jsCode);
    fn(filenames);
    TestContext.onprogress = null;
    complete(resultPromises);
  }
  function load() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", path, true);
    xhr.onreadystatechange = function(event) {
      if (xhr.readyState === 4) {
        if (xhr.status !== 200 && xhr.status !== 0) {
          complete(null, xhr.statusText);
          return;
        }
        exec(xhr.responseText);
      }
    }
    xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT"); // no-cache
    xhr.send(null);
  }
  var resultPromise = new Promise;
  load();
  return resultPromise;
}

function Promise() {
  this.resolved = false;
  this._callbacks = [];
}
Promise.when = function () {
  var numPromises = arguments.length;
  var promise = new Promise;
  if (!numPromises) {
    promise.resolve();
  } else {
    var values = [];
    for (var i = 0, n = numPromises; i < n; i++) {
      var arg = arguments[i];
      arg.then(function (val) {
        values.push(val);
        if (!--numPromises)
          promise.resolve.apply(promise, values);
      });
    }
  }
  return promise;
};
Promise.prototype.resolve = function (val) {
  if (this.resolved)
    return;

  this.resolved = true;
  this.value = val;

  var callbacks = this._callbacks;
  for (var i = 0, n = callbacks.length; i < n; i++) {
    var cb = callbacks[i];
    cb(val);
  }
};
Promise.prototype.then = function (cb) {
  if (this.resolved)
    cb(this.value);
  else
   this._callbacks.push(cb);
};

var TestContext = {
  enqueue: function(msg, args, respondTo) {
    var promise = new Promise;
    TestContext._previousPromise.then(function () {
      TestContext._currentPromise = promise;
      TestContext._driverWindow.postMessage({
        type: 'test-message',
        topic: msg,
        args: args
      }, '*');
      if (respondTo) {
        var responsePromise = new Promise;
        TestContext._responsePromise = responsePromise;
        responsePromise.then(function (s) {
          respondTo._message(s);
          promise.resolve();
        });
      } else {
        promise.resolve();
      }
    });
    TestContext._previousPromise = promise;
  },
  compareTextResults: function (actual, expected) {
    var result;
    if (actual == expected) {
      TestContext.log('SUCCESS');
      result = {failure: false};
    } else {
      TestContext.log('FAILED: ' + actual + ' !== ' + expected);
      result = {failure: true, type: 'text', data1: actual, data2: expected};
    }
    TestContext._currentResultPromise.resolve(result);
  },
  compareImageResults: function (actual, expected) {
    throw 'not impl';
  },
  onprogress: null,
  defaultRate: 1,
  _id: Date.now(),
  _slavePath: 'harness/slave.html',
  _driverWindow: null,
  _resultPromise: new Promise,
  _currentResultPromise: null,
  _currentPromise: null,
  _previousPromise: new Promise,
  _responsePromise: null,
  reset: function (file) {
    var promise = new Promise;
    TestContext._previousPromise.then(function () {
      TestContext._currentPromise = promise;
    });
    TestContext._previousPromise = promise;

    var resultPromise = new Promise;
    TestContext._resultPromise.then(function () {
      TestContext.log('Testing ' + file + '...');
      TestContext._currentResultPromise = resultPromise;

      var id = TestContext._id++;
      var movieFrame = document.getElementById('movie')
      movieFrame.addEventListener('load', function frameLoad() {
        movieFrame.removeEventListener('load', frameLoad);
        var movie = movieFrame.contentWindow;
        TestContext._driverWindow = movie;
        TestContext._responsePromise = promise;
        movie.postMessage({
          type: 'test-message',
          topic: 'load',
          path: file.indexOf(':') >= 0 || file[0] === '/' ? file : '../' + file
        }, '*');
      });
      movieFrame.src = TestContext._slavePath + '?n=' + id;
    });
    TestContext._resultPromise = resultPromise;

    if (TestContext.onprogress) {
      TestContext.onprogress(file, resultPromise);
    }
  },
  log: function (s) {
    console.log('TEST: ' + s);
  }
};
TestContext._previousPromise.resolve();
TestContext._resultPromise.resolve();

var NullMessageSink = {
  _message: function() {}
};

window.addEventListener('message', function (e) {
  var data = e.data;
  if (typeof data !== 'object' || data.type !== 'test-response')
    return;
  TestContext._responsePromise.resolve(data.result);
});

function execEq(file, frames, onprogress) {
    var promise = new Promise;
    TestContext._previousPromise.then(function () {
      TestContext._currentPromise = promise;
    });

    var framesPromises = [];
    var lastPromise = promise;
    for (var i = 0; i < frames.length; i++) {
      var framePromise = new Promise
      framePromise.then(function (i, result) {
        onprogress(i, frames.length, frames[i], result);
      }.bind(null, i));
      framesPromises.push(framePromise);
      var responsePromise = new Promise;
      lastPromise.then(function (responsePromise) {
        TestContext._currentPromise = responsePromise;
        TestContext._responsePromise = responsePromise;
      }.bind(null, responsePromise));
      lastPromise = responsePromise;

      responsePromise.then(function (result) {
        // redirecting to right promise (in case if snapshots send out-of-order)
        var j = result.index;
        var snapshot = result.snapshot;
        framesPromises[j].resolve({
          failure: false,
          snapshot: snapshot
        });
      });
    }
    TestContext._previousPromise = lastPromise;

    var resultPromise = Promise.when.apply(Promise, framesPromises);
    TestContext._resultPromise.then(function () {
      TestContext.log('Testing ' + file + '...');
      TestContext._currentResultPromise = resultPromise;

      var id = TestContext._id++;
      var movieFrame = document.getElementById('movie')
      movieFrame.addEventListener('load', function frameLoad() {
        movieFrame.removeEventListener('load', frameLoad);
        var movie = movieFrame.contentWindow;
        TestContext._driverWindow = movie;
        TestContext._responsePromise = promise;
        movie.postMessage({
          type: 'test-message',
          topic: 'load',
          path: file.indexOf(':') >= 0 || file[0] === '/' ? file : '../' + file,
          reportFrames: frames
        }, '*');
      });
      movieFrame.src = TestContext._slavePath + '?n=' + id;
    });
    TestContext._resultPromise = resultPromise;
}

