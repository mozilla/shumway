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
          complete(xhr.response);
        }
      }
      xhr.setRequestHeader("If-Modified-Since", "Fri, 01 Jan 1960 00:00:00 GMT"); // no-cache
      xhr.send(null);
    }
  };
  return constructor;
})();

var sysMode = ALWAYS_INTERPRET;
var appMode = state.appCompiler ? null : ALWAYS_INTERPRET;

function createAVM2(next, loadShellAbc) {
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

var avm2Root = "../../src/avm2/";
var rfile = getQueryVariable("rfile");

/**
 * You can also specify a remote file as a query string parameters, ?rfile=... to load it automatically
 * when the page loads.
 */
if (rfile) {
  executeFile(rfile);
}

var avm2Instance = undefined;

function executeFile(file) {
  if (file.endsWith(".abc")) {
    if (avm2Instance) {
      new BinaryFileReader(file).readAll(null, function(buffer) {
        avm2Instance.applicationDomain.executeAbc(new AbcFile(new Uint8Array(buffer), file));
        terminate();
      })
    } else {
      createAVM2(function(avm2) {
        avm2Instance = avm2;
        new BinaryFileReader(file).readAll(null, function(buffer) {
          avm2.applicationDomain.executeAbc(new AbcFile(new Uint8Array(buffer), file));
          terminate();
        });
      }, true);
    }
  } else if (file.endsWith(".swf")) {
    createAVM2(function(avm2) {
      new BinaryFileReader(file).readAll(null, function(buffer) {
        SWF.embed(buffer, $("#stage")[0], {avm2: avm2});
      });
    });
  }
}

function terminate() {
  console.info(Counter);
}