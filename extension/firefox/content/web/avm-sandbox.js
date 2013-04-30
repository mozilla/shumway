// Extension communication object... as it used in pdf.js
var FirefoxCom = (function FirefoxComClosure() {
  return {
    /**
     * Creates an event that the extension is listening for and will
     * synchronously respond to.
     * NOTE: It is reccomended to use request() instead since one day we may not
     * be able to synchronously reply.
     * @param {String} action The action to trigger.
     * @param {String} data Optional data to send.
     * @return {*} The response.
     */
    requestSync: function(action, data) {
      var e = document.createEvent('CustomEvent');
      e.initCustomEvent('shumway.message', true, false,
        {action: action, data: data, sync: true});
      document.dispatchEvent(e);
      return e.detail.response;
    },
    /**
     * Creates an event that the extension is listening for and will
     * asynchronously respond by calling the callback.
     * @param {String} action The action to trigger.
     * @param {String} data Optional data to send.
     * @param {Function} callback Optional response callback that will be called
     * with one data argument.
     */
    request: function(action, data, callback) {
      var e = document.createEvent('CustomEvent');
      e.initCustomEvent('shumway.message', true, false,
        {action: action, data: data, sync: false});
      if (callback) {
        if ('nextId' in FirefoxCom.request) {
          FirefoxCom.request.nextId = 1;
        }
        var cookie = "requestId" + (FirefoxCom.request.nextId++);
        e.detail.cookie = cookie;

        document.addEventListener('shumway.response', function listener(event) {
          if (cookie !== event.detail.cookie)
            return;

          document.removeEventListener('shumway.response', listener, false);

          var response = event.detail.response;
          return callback(response);
        }, false);
      }
      return document.dispatchEvent(e);
    },
    initJS: function (callback) {
      FirefoxCom.request('externalCom', {action: 'init'});
      document.addEventListener('shumway.remote', function (e) {
        e.detail.result = callback(e.detail.functionName, e.detail.args);
      }, false);
    }
  };
})();

function fallback() {
  FirefoxCom.requestSync('fallback', null)
}

function runViewer() {
  var flashParams = JSON.parse(FirefoxCom.requestSync('getPluginParams', null));
  FileLoadingService.setBaseUrl(flashParams.baseUrl);

  movieUrl = flashParams.url;
  movieParams = flashParams.params;
  var isOverlay = flashParams.isOverlay;
  pauseExecution = flashParams.isPausedAtStart;
  console.log("url=" + movieUrl + ";params=" + uneval(movieParams));
  FirefoxCom.requestSync('loadFile', {url: movieUrl, sessionId: 0});
  if (isOverlay) {
    var fallbackDiv = document.getElementById('fallback');
    fallbackDiv.className = 'enabled';
    fallbackDiv.addEventListener('click', function(e) {
      fallback();
      e.preventDefault();
    });
  }
}

function showURL() {
  var flashParams = JSON.parse(FirefoxCom.requestSync('getPluginParams', null));
  window.prompt("Copy to clipboard", flashParams.url);
}

function Subscription() {}
Subscription.prototype = {
  subscribe: function (callback) {
    this.callback = callback;
    if (this.buffer) {
      for (var i = 0; i < this.buffer.length; i++) {
        var data = this.buffer[i];
        callback(data.array, {loaded: data.loaded, total: data.total});
      }
      delete this.buffer;
    }
  },
  send: function (data) {
    if (this.callback) {
      this.callback(data.array, {loaded: data.loaded, total: data.total});
      return;
    }
    if (!this.buffer)
      this.buffer = [];
    this.buffer.push(data);
  }
};

var subscription = null, movieUrl, movieParams;

window.addEventListener("message", function handlerMessage(e) {
  var args = e.data;
  switch (args.callback) {
    case "loadFile":
      if (args.sessionId != 0) {
        var session = FileLoadingService.sessions[args.sessionId];
        if (session)
          session.notify(args);
        return;
      }
      switch (args.topic) {
        case "open":
          subscription = new Subscription();
          parseSwf(movieUrl, movieParams, subscription);
          break;
        case "progress":
          subscription.send(args);
          console.log(movieUrl + ': loaded ' + args.loaded + '/' + args.total);
          break;
        case "error":
          console.error('Unable to download ' + movieUrl + ': ' + args.error);
          break;
      }
      break;
  }
}, true);

var FileLoadingService = {
  get baseUrl() { return movieUrl; },
  nextSessionId: 1, // 0 - is reserved
  sessions: [],
  createSession: function () {
    var sessionId = this.nextSessionId++;
    return this.sessions[sessionId] = {
      open: function (request) {
        var self = this;
        var path = FileLoadingService.resolveUrl(request.url);
        console.log('Session #' + sessionId +': loading ' + path);
        FirefoxCom.requestSync('loadFile', {url: path, method: request.method,
          mimeType: request.mimeType, postData: request.data, sessionId: sessionId});
      },
      notify: function (args) {
        switch (args.topic) {
          case "open": this.onopen(); break;
          case "close":
            this.onclose();
            delete FileLoadingService.sessions[sessionId];
            console.log('Session #' + sessionId +': closed');
            break;
          case "error": this.onerror(args.error); break;
          case "progress":
            console.log('Session #' + sessionId + ': loaded ' + args.loaded + '/' + args.total);
            this.onprogress(args.array, {bytesLoaded: args.loaded, bytesTotal: args.total});
            break;
        }
      }
    };
  },
  setBaseUrl: function (url) {
    var a = document.createElement('a');
    a.href = url || '#';
    a.setAttribute('style', 'display: none;');
    document.body.appendChild(a);
    FileLoadingService.baseUrl = a.href;
    document.body.removeChild(a);
  },
  resolveUrl: function (url) {
    if (url.indexOf('://') >= 0) return url;

    var base = FileLoadingService.baseUrl;
    base = base.lastIndexOf('/') >= 0 ? base.substring(0, base.lastIndexOf('/') + 1) : '';
    if (url.indexOf('/') === 0) {
      var m = /^[^:]+:\/\/[^\/]+/.exec(base);
      if (m) base = m[0];
    }
    return base + url;
  }
};

function parseSwf(url, params, file) {
  console.log("Parsing " + url + "...");
  function terminate() {}
  createAVM2(builtinPath, playerGlobalPath, EXECUTION_MODE.INTERPRET, EXECUTION_MODE.INTERPRET, function (avm2) {
    console.time("Initialize Renderer");
    SWF.embed(file, document, document.getElementById("viewer"), { onComplete: terminate, movieParams: params, onBeforeFrame: frame });
  });
}

var pauseExecution = false;
var initializeFrameControl = true;
function frame(e) {
  if (initializeFrameControl) {
    // skipping frame 0
    initializeFrameControl = false;
    return;
  }
  if (pauseExecution) {
    e.cancel = true;
  }
}

document.addEventListener('keydown', function (e) {
  if (e.keyCode == 119 && e.ctrlKey) { // Ctrl+F8
    pauseExecution = !pauseExecution;
  }
}, false);
