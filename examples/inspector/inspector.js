/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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

var BinaryFileReader = (function binaryFileReader() {
  function constructor(url, method, mimeType, data) {
    this.url = url;
    this.method = method;
    this.mimeType = mimeType;
    this.data = data;
  }

  constructor.prototype = {
    readAll: function(progress, complete) {
      var url = this.url;
      var xhr = new XMLHttpRequest({mozSystem:true});
      var async = true;
      xhr.open(this.method || "GET", this.url, async);
      xhr.responseType = "arraybuffer";
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
      if (this.mimeType)
        xhr.setRequestHeader("Content-Type", this.mimeType);
      xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT"); // no-cache
      xhr.send(this.data || null);
    },
    readAsync: function(ondata, onerror, onopen, oncomplete, onhttpstatus) {
      var xhr = new XMLHttpRequest({mozSystem:true});
      var url = this.url;
      xhr.open(this.method || "GET", url, true);
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
        if(xhr.readyState === 2 && onhttpstatus) {
          onhttpstatus(url, xhr.status, xhr.getAllResponseHeaders());
        }
        if (xhr.readyState === 4) {
          if (xhr.status !== 200 && xhr.status !== 0) {
            onerror(xhr.statusText);
          }
          if (oncomplete)
            oncomplete();
        }
      }
      if (this.mimeType)
        xhr.setRequestHeader("Content-Type", this.mimeType);
      xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT"); // no-cache
      xhr.send(this.data || null);
      if (onopen)
        onopen();
    }
  };
  return constructor;
})();

var asyncLoading = getQueryVariable("async") === "true";
var libraryAbcs
function grabAbc(abcName) {
  var entry = libraryScripts[abcName];
  if (entry) {
    var offset = entry.offset;
    var length = entry.length;
    return new AbcFile(new Uint8Array(libraryAbcs, offset, length), abcName);
  }
  return null
}

function findDefiningAbc(mn) {
  if (!avm2.builtinsLoaded) {
    return null;
  }
  var name;
  for (var i = 0; i < mn.namespaces.length; i++) {
    var name = mn.namespaces[i].originalURI + ":" + mn.name;
    var abcName = playerGlobalNames[name];
    if (abcName) {
      break;
    }
  }
  if (abcName) {
    return grabAbc(abcName);
  }
  return null;
}

/** Global sanityTests array, sanity tests add themselves to this */
var sanityTests = [];

// avm2 must be global.
var avm2;
function createAVM2(builtinPath, libraryPath, sysMode, appMode, next) {
  assert (builtinPath);
  new BinaryFileReader(builtinPath).readAll(null, function (buffer) {
    avm2 = new AVM2(sysMode, appMode, findDefiningAbc);
    console.time("Execute builtin.abc");
    avm2.loadedAbcs = {};
    // Avoid loading more Abcs while the builtins are loaded
    avm2.builtinsLoaded = false;
    avm2.systemDomain.onMessage.register('classCreated', Stubs.onClassCreated);
    avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "builtin.abc"));
    avm2.builtinsLoaded = true;
    console.timeEnd("Execute builtin.abc");
    new BinaryFileReader(libraryPath).readAll(null, function (buffer) {
      // If library is shell.abc, then just go ahead and run it now since
      // it's not worth doing it lazily given that it is so small.
      if (libraryPath === shellAbcPath) {
        avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), libraryPath));
      } else {
        libraryAbcs = buffer;
      }
      next(avm2);
    });
  });
}

var avm2Root = "../../src/avm2/";
var remoteFile = getQueryVariable("rfile");
var builtinPath = avm2Root + "generated/builtin/builtin.abc";
var shellAbcPath = avm2Root + "generated/shell/shell.abc";
var playerGlobalAbcPath = "../../src/flash/playerglobal.abc";

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
    obj[decodeURIComponent(key)] = decodeURIComponent(value);
  }

  return obj;
}

/**
 * You can also specify a remote file as a query string parameters, ?rfile=... to load it automatically
 * when the page loads.
 */
if (remoteFile) {
  document.getElementById('openFileToolbar').setAttribute('hidden', true);
  executeFile(remoteFile, null, parseQueryString(window.location.search));
}

var yt = getQueryVariable('yt');
if (yt) {
  var xhr = new XMLHttpRequest({mozSystem: true});
  xhr.open('GET', 'http://www.youtube.com/watch?v=' + yt, true);
  xhr.onload = function (e) {
    var config = JSON.parse(/ytplayer\.config\s*=\s*(.+?);<\/script/.exec(xhr.responseText)[1]);
    // HACK removing FLVs from the fmt_list
    config.args.fmt_list = config.args.fmt_list.split(',').filter(function (s) {
      var fid = s.split('/')[0];
      return fid !== '5' && fid !== '34' && fid !== '35'; // more?
    }).join(',');

    var swf = config.url;

    document.getElementById('openFileToolbar').setAttribute('hidden', true);
    executeFile(swf, null, config.args);
  };
  xhr.send(null);
}

var simpleMode = getQueryVariable("simpleMode") === "true";
if (simpleMode) {
  document.body.setAttribute('class', 'simple');
}

function showMessage(msg) {
  document.getElementById('message').textContent = msg;
  document.getElementById('message').parentElement.removeAttribute('hidden');
}

function executeFile(file, buffer, movieParams) {
  // All execution paths must now load AVM2.
  if (!state.appCompiler) {
    showMessage("Running in the Interpreter");
  }
  var sysMode = state.sysCompiler ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET;
  var appMode = state.appCompiler ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET;
  if (file.endsWith(".abc")) {
    libraryScripts = {};
    createAVM2(builtinPath, shellAbcPath, sysMode, appMode, function (avm2) {
      function runAbc(file, buffer) {
        avm2.applicationDomain.executeAbc(new AbcFile(new Uint8Array(buffer), file));
        terminate();
      }
      if (!buffer) {
        new BinaryFileReader(file).readAll(null, function(buffer) {
          runAbc(file, buffer);
        });
      } else {
        runAbc(file, buffer);
      }
    });
  } else if (file.endsWith(".swf")) {
    libraryScripts = playerGlobalScripts;
    createAVM2(builtinPath, playerGlobalAbcPath, sysMode, appMode, function (avm2) {
      function runSWF(file, buffer) {
        var swfURL = FileLoadingService.resolveUrl(file);
        var loaderURL = getQueryVariable("loaderURL") || swfURL;
        SWF.embed(buffer || file, document, document.getElementById('stage'), {
          onComplete: terminate,
          onStageInitialized: stageInitialized,
          onBeforeFrame: frame,
          url: swfURL,
          loaderURL: loaderURL,
          movieParams: movieParams || {},
        });
      }
      if (!buffer && asyncLoading) {
        FileLoadingService.setBaseUrl(file);
        runSWF(file);
      } else if (!buffer) {
        FileLoadingService.setBaseUrl(file);
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
  } else if (file.endsWith(".js") || file.endsWith("/")) {
    libraryScripts = playerGlobalScripts;
    var sysMode = state.sysCompiler ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET;
    var appMode = state.appCompiler ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET;
    createAVM2(builtinPath, playerGlobalAbcPath, sysMode, appMode, function (avm2) {
      if (file.endsWith("/")) {
        readDirectoryListing(file, function (files) {
          function loadNextScript(done) {
            if (!files.length) {
              done();
              return;
            }
            var sanityTest = files.pop();
            console.info("Loading Sanity Test: " + sanityTest);
            loadScript(sanityTest, function () {
              loadNextScript(done);
            });
          }
          loadNextScript(function whenAllScriptsAreLoaded() {
            console.info("Executing Sanity Test");
            sanityTests.forEach(function (test) {
              test(console, avm2);
            });
          });
        });
      } else {
        loadScript(file, function () {
          sanityTests.forEach(function (test) {
            test(console, avm2);
          });
        });
      }
    });
  }
}

function stageInitialized(stage) {
  if (TRACE_SYMBOLS_INFO) {
    var traceSymbolsInfo = document.getElementById('traceSymbolsInfo');
    traceSymbolsInfo.removeAttribute('hidden');
    traceSymbolsInfo.appendChild(stage._control);
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

(function setStageSize() {
  var stageSize = getQueryVariable("size");
  if (stageSize && /^\d+x\d+$/.test(stageSize)) {
    var dims = stageSize.split('x');
    var stage = document.getElementById('stage');
    stage.style.width = dims[0] + "px";
    stage.style.height = dims[1] + "px";
  }
})();

var FileLoadingService = {
  createSession: function () {
    return {
      open: function (request) {
        if (request.url.indexOf('http://s.youtube.com/stream_204') === 0) {
          // No reason to send error report yet, let's keep it this way for now.
          // 204 means no response, so no data will be expected.
          console.error('YT_CALLBACK: ' + request.url);
          this.onopen && this.onopen();
          this.onclose && this.onclose();
          return;
        }

        var self = this;
        var path = FileLoadingService.resolveUrl(request.url);
        console.log('FileLoadingService: loading ' + path + ", data: " + request.data);
        new BinaryFileReader(path, request.method, request.mimeType, request.data).readAsync(
          function (data, progress) {
            self.onprogress(data, {bytesLoaded: progress.loaded, bytesTotal: progress.total});
          },
          function (e) { self.onerror(e); },
          self.onopen,
          self.onclose,
          self.onhttpstatus);
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
    if (url.indexOf('://') >= 0) {
      return url;
    }

    var base = FileLoadingService.baseUrl || '';
    base = base.lastIndexOf('/') >= 0 ? base.substring(0, base.lastIndexOf('/') + 1) : '';
    if (url.indexOf('/') === 0) {
      var m = /^[^:]+:\/\/[^\/]+/.exec(base);
      if (m) base = m[0];
    }
    return base + url;
  }
};
