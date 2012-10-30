var BinaryFileReader = (function binaryFileReader() {
  function constructor(url, responseType) {
    this.url = url;
    this.responseType = responseType || "arraybuffer";
  }

  constructor.prototype = {
    readAll: function(progress, complete) {
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
            complete(null, xhr.statusText);
            return;
          }
          complete(xhr.response);
        }
      }
      xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT"); // no-cache
      xhr.send(null);
    }
  };
  return constructor;
})();

var sysMode = EXECUTION_MODE.INTERPRET;

// avm2 must be global.
var avm2;

function createAVM2(builtinPath, libraryPath, sysMode, appMode, next) {
  assert (builtinPath);
  new BinaryFileReader(builtinPath).readAll(null, function (buffer) {
    avm2 = new AVM2(sysMode, appMode);
    avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "builtin.abc"));
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
var rfile = getQueryVariable("rfile");
var builtinPath = avm2Root + "generated/builtin/builtin.abc";
var libraryPath = avm2Root + "generated/shell/shell.abc";
var playerGlobalPath = "../../src/flash/playerGlobal.min.abc";

/**
 * You can also specify a remote file as a query string parameters, ?rfile=... to load it automatically
 * when the page loads.
 */
if (rfile) {
  executeFile(rfile);
}

function showMessage(msg) {
  $('#message').text(msg);
  $('#message')[0].parentElement.removeAttribute('hidden');
}

function executeFile(file, buffer) {
  // All execution paths must now load AVM2.
  if (!state.compiler) {
    showMessage("Running in the Interpreter");
  }
  var appMode = state.compiler ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET;
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
        SWF.embed(buffer, $("#stage")[0], { onComplete: terminate });
      }
      if (!buffer) {
        new BinaryFileReader(file).readAll(null, function(buffer) {
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

function terminate() {
  console.info(Counter);
}
