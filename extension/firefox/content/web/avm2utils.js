/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
enableVerifier.value = true;
enableC4.value = true;
release = true;

var avm2Root = SHUMWAY_ROOT + "avm2/";
var builtinPath = avm2Root + "generated/builtin/builtin.abc";
var playerGlobalPath = SHUMWAY_ROOT + "flash/playerglobal.abc";
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

var libraryAbcs;
function grabAbc(abcName) {
  var entry = libraryScripts[abcName];
  if (entry) {
    var offset = entry.offset;
    var length = entry.length;
    return new AbcFile(new Uint8Array(libraryAbcs, offset, length), abcName);
  }
  return null;
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

// avm2 must be global.
var avm2;
var libraryScripts = playerGlobalScripts;    // defined in playerglobal.js
var libraryNames = playerGlobalNames;        // ditto

function createAVM2(builtinPath, libraryPath, sysMode, appMode, next) {
  console.time("Load AVM2");
  assert (builtinPath);
  avm2 = new AVM2(sysMode, appMode, findDefiningAbc);
  var builtinAbc, libraryAbc;

  // Batch I/O requests.
  new BinaryFileReader(libraryPath).readAll(null, function (buffer) {
    libraryAbcs = buffer;
    new BinaryFileReader(builtinPath).readAll(null, function (buffer) {
      builtinAbc = new AbcFile(new Uint8Array(buffer), "builtin.abc");
      executeAbc();
    });
  });

  function executeAbc() {
    assert (builtinAbc);
    avm2.builtinsLoaded = false;
    avm2.systemDomain.executeAbc(builtinAbc);
    avm2.builtinsLoaded = true;
    console.info(Counter.toJSON());
    console.timeEnd("Load AVM2");
    next(avm2);
  }
}
