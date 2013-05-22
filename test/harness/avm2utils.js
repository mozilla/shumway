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
        } else if (xhr.readyState === 1 && onopen) {
          onopen();
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
var sanityTests = [];
var libraryScripts = playerGlobalScripts;    // defined in playerglobal.js
var libraryNames = playerGlobalNames;        // ditto

function createAVM2(builtinPath, libraryPath, sysMode, appMode, next) {
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
    avm2.systemDomain.onClassCreated.register(Stubs.onClassCreated);
    avm2.systemDomain.executeAbc(builtinAbc);
    avm2.builtinsLoaded = true;
    next(avm2);
  }
}
