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
