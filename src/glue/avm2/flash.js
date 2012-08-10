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

/**
 * Creates an AVM2 instance.
 * @param {string} builtinPath Path to the builtin.abc file.
 * @param {string} libraryPath Path to the second .abc file to be executed.
 * @param {EXECUTION_MODE} sysMode Execution mode for code in the system domain.
 * @param {EXECUTION_MODE} appMode Execution mode for code in the application domain.
 * @param {Function} next Callback called after the VM is created.
 */
function createAVM2(builtinPath, libraryPath, sysMode, appMode, next) {
  assert (builtinPath);
  new BinaryFileReader(builtinPath).readAll(null, function (buffer) {
    var vm = new AVM2(new AbcFile(new Uint8Array(buffer), "builtin.abc"), sysMode, appMode);
    if (libraryPath) {
      new BinaryFileReader(libraryPath).readAll(null, function (buffer) {
        vm.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), libraryPath));
        next(vm);
      });
    } else {
      next(vm);
    }
  });
}