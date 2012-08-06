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

var sysMode = state.chkSysCompiler ? null : ALWAYS_INTERPRET;
var appMode = state.chkAppCompiler ? null : ALWAYS_INTERPRET;

function createAVM2(next) {
  new BinaryFileReader(avm2Root + "generated/builtin/builtin.abc").readAll(null, function (buffer) {
    var vm = new AVM2(new AbcFile(new Uint8Array(buffer), "builtin.abc"), sysMode, appMode);
    vm.onConstruct = function (instance, args) {
      var ci = instance.public$constructor.classInfo;
      print("Creating: " + ci.instanceInfo.name.getQualifiedName() +
            ", with args: [" + args + "]");
    };
    next(vm);
  });
}

var avm2Root = "../../src/avm2/";
var rfile = getQueryVariable("rfile");

/**
 * You can also specify a remote file as a query string parameters, ?rfile=... to load it automatically
 * when the page loads.
 */
if (rfile) {
  if (rfile.endsWith(".abc")) {
    createAVM2(function(avm2) {
      new BinaryFileReader(rfile).readAll(null, function(buffer) {
        avm2.applicationDomain.executeAbc(new AbcFile(new Uint8Array(buffer), rfile));
      });
    });
  } else if (rfile.endsWith(".swf")) {
    createAVM2(function(avm2) {
      new BinaryFileReader(rfile).readAll(null, function(buffer) {
        SWF.embed(buffer, $("#stage")[0], {avm2: avm2});
      });
    });
  }
}
