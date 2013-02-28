enableVerifier.value = true;
enableC4.value = true;
release = true;

var avm2Root = SHUMWAY_ROOT + "avm2/";
var builtinPath = avm2Root + "generated/builtin/builtin.abc";
var libraryPath = avm2Root + "generated/shell/shell.abc";
var playerGlobalPath = SHUMWAY_ROOT + "flash/playerGlobal.min.abc";

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

// avm2 must be global.
var avm2;

function createAVM2(builtinPath, libraryPath, sysMode, appMode, next) {
  console.time("createAVM2");
  assert (builtinPath);
  avm2 = new AVM2(sysMode, appMode);
  var builtinAbc, libraryAbc;
  // Batch I/O requests.
  new BinaryFileReader(builtinPath).readAll(null, function (buffer) {
    builtinAbc = new AbcFile(new Uint8Array(buffer), "builtin.abc");
    executeAbc();
  });
  if (libraryPath) {
    new BinaryFileReader(libraryPath).readAll(null, function (buffer) {
      libraryAbc = new AbcFile(new Uint8Array(buffer), libraryPath);
      executeAbc();
    });
  }
  function executeAbc() {
    if (libraryPath) {
      if (!builtinAbc || !libraryAbc) {
        return;
      }
    }
    assert (builtinAbc);
    avm2.systemDomain.executeAbc(builtinAbc);
    if (libraryAbc) {
      avm2.systemDomain.executeAbc(libraryAbc);
    }
    console.timeEnd("createAVM2");
    next(avm2);
  }
}