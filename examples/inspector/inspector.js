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

/*
function createSimpleAVM2(next, loadShellAbc) {
  var vm = new AVM2(sysMode, appMode);
  new BinaryFileReader(avm2Root + "generated/builtin/builtin.abc").readAll(null, function (buffer) {
    vm.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "builtin.abc"));
    if (loadShellAbc) {
      new BinaryFileReader(avm2Root + "generated/shell/shell.abc").readAll(null, function (buffer) {
        vm.applicationDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "shell.abc"));
        next(vm);
      });
    } else {
      next(vm);
    }
  });
}
*/

var avm2Root = "../../src/avm2/";
var rfile = getQueryVariable("rfile");
var builtinPath = avm2Root + "generated/builtin/builtin.abc";
var libraryPath = avm2Root + "generated/shell/shell.abc";
var avm2Instance = undefined;

/**
 * You can also specify a remote file as a query string parameters, ?rfile=... to load it automatically
 * when the page loads.
 */
if (rfile) {
  executeFile(rfile);
}

function executeFile(file, buffer) {
  if (!file.endsWith(".swf") && !avm2Instance) {
    var appMode = state.appCompiler ? null : EXECUTION_MODE.INTERPRET;
    createAVM2(builtinPath, libraryPath, sysMode, appMode, function (avm2) {
      avm2Instance = avm2;
      executeFile(file, buffer);
    });
    return;
  }
  if (file.endsWith(".abc")) {
    function runABC(file, buffer) {
      avm2Instance.applicationDomain.executeAbc(new AbcFile(new Uint8Array(buffer), file));
      terminate();
    }
    if (!buffer) {
      new BinaryFileReader(file).readAll(null, function(buffer) {
        runABC(file, buffer);
      });
    } else {
      runABC(file, buffer);
    }
  } else if (file.endsWith(".swf")) {
    function runSWF(file, buffer) {
      SWF.embed(buffer, $("#stage")[0], { onComplete: terminate });
    }
    if (!buffer) {
      new BinaryFileReader(file).readAll(null, function(buffer, error) {
        if (!buffer) {
          throw "Unable to open the file " + file + ": " + error;
        }
        runSWF(file, buffer);
      });
    } else {
      runSWF(file, buffer);
    }
  }
}

function terminate() {
  console.info(Counter);
}
