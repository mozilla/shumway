var BinaryFileReader = (function binaryFileReader() {
  function constructor(url, responseType) {
    this.url = url;
    this.responseType = responseType || "arraybuffer";
  }

  constructor.prototype = {
    readAll: function(progress, complete) {
      var url = this.url;
      var xhr = new XMLHttpRequest();
      var async = true;
      xhr.open("GET", this.url, async);
      xhr.responseType = this.responseType;
      if (progress) {
        xhr.onprogress = function(event) {
          progress(xhr.response, event.loaded, event.total);
        };
      }
      xhr.onreadystatechange = function(event) {
        if (xhr.readyState === 4) {
          if (xhr.status !== 200 && xhr.status !== 0) {
            unexpected("Path: " + url + " not found.");
            complete(null, xhr.statusText);
            return;
          }
          complete(xhr.response);
        }
      }
      xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT"); // no-cache
      xhr.send(null);
    },
    readAsync: function(ondata, onerror, onopen, oncomplete) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", this.url, true);
      // arraybuffer is not provide onprogress, fetching as regular chars
      if ('overrideMimeType' in xhr)
        xhr.overrideMimeType('text/plain; charset=x-user-defined');
      var lastPosition = 0;
      xhr.onprogress = function (e) {
        var position = e.loaded;
        var chunk = xhr.responseText.substring(lastPosition, position);
        var data = new Uint8Array(chunk.length);
        for (var i = 0; i < data.length; i++)
          data[i] = chunk.charCodeAt(i) & 0xFF;
        ondata(data, { loaded: e.loaded, total: e.total });
        lastPosition = position;
      };
      xhr.onreadystatechange = function(event) {
        if (xhr.readyState === 4) {
          if (xhr.status !== 200 && xhr.status !== 0) {
            onerror(xhr.statusText);
          }
          if (oncomplete)
            oncomplete();
        }
      }
      xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT"); // no-cache
      xhr.send(null);
      if (onopen)
        onopen();
    }
  };
  return constructor;
})();

var asyncLoading = getQueryVariable("async") === "true";

// avm2 must be global.
var avm2;

function createAVM2(builtinPath, libraryPath, sysMode, appMode, next) {
  assert (builtinPath);
  new BinaryFileReader(builtinPath).readAll(null, function (buffer) {
    avm2 = new AVM2(sysMode, appMode);
    console.time("Execute builtin.abc");
    avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "builtin.abc"));
    console.timeEnd("Execute builtin.abc");
    if (libraryPath) {
      new BinaryFileReader(libraryPath).readAll(null, function (buffer) {
        avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), libraryPath));
        next(avm2);
      });
    } else {
      next(avm2);
    }
  });
}

var avm2Root = "../../src/avm2/";
var remoteFile = getQueryVariable("rfile");
var builtinPath = avm2Root + "generated/builtin/builtin.abc";
var libraryPath = avm2Root + "generated/shell/shell.abc";
var playerGlobalPath = "../../src/flash/playerGlobal.min.abc";

function parseQueryString(qs) {
  if (!qs)
    return {};

  if (qs.charAt(0) == '?')
    qs = qs.slice(1);

  var values = qs.split('&');
  var obj = {};
  for (var i = 0; i < values.length; i++) {
    var kv = values[i].split('=');
    var key = kv[0], value = kv[1];
    obj[key] = value;
  }

  return obj;
}

/**
 * You can also specify a remote file as a query string parameters, ?rfile=... to load it automatically
 * when the page loads.
 */
if (remoteFile) {
  $('#openFileToolbar')[0].setAttribute('hidden', true);
  executeFile(remoteFile, null, parseQueryString(window.location.search));
}

function showMessage(msg) {
  $('#message').text(msg);
  $('#message')[0].parentElement.removeAttribute('hidden');
}

function executeFile(file, buffer, movieParams) {
  // All execution paths must now load AVM2.
  if (!state.appCompiler) {
    showMessage("Running in the Interpreter");
  }
  var sysMode = state.sysCompiler ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET;
  var appMode = state.appCompiler ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET;
  if (file.endsWith(".abc")) {
    createAVM2(builtinPath, libraryPath, sysMode, appMode, function (avm2) {
      function runABC(file, buffer) {
        avm2.applicationDomain.executeAbc(new AbcFile(new Uint8Array(buffer), file));
        terminate();
      }
      if (!buffer) {
        new BinaryFileReader(file).readAll(null, function(buffer) {
          runABC(file, buffer);
        });
      } else {
        runABC(file, buffer);
      }
    });
  } else if (file.endsWith(".swf")) {
    createAVM2(builtinPath, playerGlobalPath, sysMode, appMode, function (avm2) {
      function runSWF(file, buffer) {
        SWF.embed(buffer, $("#stage")[0], { onComplete: terminate, onBeforeFrame: frame, movieParams: movieParams || {} });
      }
      if (!buffer && asyncLoading) {
        var subscription = {
          subscribe: function (callback) {
            this.callback = callback;
          }
        };
        runSWF(file, subscription);
        FileLoadingService.baseUrl = file;
        new BinaryFileReader(file).readAsync(
          function onchunk(data, progressInfo) {
            subscription.callback(data, progressInfo);
          },
          function onerror(error) {
            console.error("Unable to open the file " + file + ": " + error);
          });
      } else if (!buffer) {
        FileLoadingService.baseUrl = file;
        new BinaryFileReader(file).readAll(null, function(buffer, error) {
          if (!buffer) {
            throw "Unable to open the file " + file + ": " + error;
          }
          runSWF(file, buffer);
        });
      } else {
        runSWF(file, buffer);
      }
    });
  }
}

function terminate() {}

var initializeFrameControl = true;
var pauseExecution = getQueryVariable("paused") === "true";
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

var FileLoadingService = {
  createSession: function () {
    return {
      open: function (request) {
        var self = this;
        var base = FileLoadingService.baseUrl || '';
        base = base.lastIndexOf('/') >= 0 ? base.substring(0, base.lastIndexOf('/') + 1) : '';
        var path = base ? base + request.url : request.url;
        console.log('FileLoadingService: loading ' + path);
        new BinaryFileReader(path).readAsync(
          function (data, progress) {
            self.onprogress(data, {bytesLoaded: progress.loaded, bytesTotal: progress.total});
          },
          function (e) { self.onerror(e); },
          self.onopen,
          self.onclose);
      }
    };
  }
};
