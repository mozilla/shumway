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

var AVM2 = (function () {
  var playerglobalLoadedPromise;
  var playerglobal;

  function grabAbc(abcName) {
    var entry = playerglobal.scripts[abcName];
    if (!entry) {
      return null;
    }
    var offset = entry.offset;
    var length = entry.length;
    return new AbcFile(new Uint8Array(playerglobal.abcs, offset, length), abcName);
  }

  function findDefiningAbc(mn) {
    if (!playerglobal) {
      return null;
    }
    for (var i = 0; i < mn.namespaces.length; i++) {
      var name = mn.namespaces[i].originalURI + ":" + mn.name;
      var abcName = playerglobal.map[name];
      if (abcName) {
        break;
      }
    }
    if (abcName) {
      return grabAbc(abcName);
    }
    return null;
  }

  function promiseFile(path, responseType) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', path);
      xhr.responseType = responseType;
      xhr.onload = function () {
        if (xhr.response) {
          resolve(xhr.response);
        } else {
          reject('Unable to load ' + path + ': ' + xhr.statusText);
        }
      };
      xhr.send();
    });
  }

  function avm2Ctor(sysMode, appMode, loadAVM1) {
    // TODO: this will change when we implement security domains.
    this.systemDomain = new ApplicationDomain(this, null, sysMode, true);
    this.applicationDomain = new ApplicationDomain(this, this.systemDomain, appMode, false);
    this.findDefiningAbc = findDefiningAbc;
    this.loadAVM1 = loadAVM1;
    this.isAVM1Loaded = false;

    /**
     * All runtime exceptions are boxed in this object to tag them as having
     * originated from within the VM.
     */
    this.exception = { value: undefined };
    this.exceptions = [];
  }

  // We sometimes need to know where we came from, such as in
  // |ApplicationDomain.currentDomain|.

  avm2Ctor.currentAbc = function () {
    var caller = arguments.callee;
    var maxDepth = 20;
    var abc = null;
    for (var i = 0; i < maxDepth && caller; i++) {
      var mi = caller.methodInfo;
      if (mi) {
        abc = mi.abc;
        break;
      }
      caller = caller.caller;
    }
    return abc;
  };

  avm2Ctor.currentDomain = function () {
    var abc = this.currentAbc();
    assert (abc && abc.applicationDomain,
            "No domain environment was found on the stack, increase STACK_DEPTH or " +
            "make sure that a compiled / interpreted function is on the call stack.");
    return abc.applicationDomain;
  };

  avm2Ctor.isPlayerglobalLoaded = function () {
    return !!playerglobal;
  };
  avm2Ctor.loadPlayerglobal = function (abcsPath, catalogPath) {
    if (playerglobalLoadedPromise) {
      return Promise.reject('Playerglobal is already loaded');
    }
    playerglobalLoadedPromise = Promise.all([
        promiseFile(abcsPath, 'arraybuffer'), promiseFile(catalogPath, 'json')]).
      then(function (result) {
        playerglobal = {
          abcs: result[0],
          map: Object.create(null),
          scripts: Object.create(null)
        };
        var catalog = result[1];
        for (var i = 0; i < catalog.length; i++) {
          var abc = catalog[i];
          playerglobal.scripts[abc.name] = abc;
          if (typeof abc.defs === 'string') {
            playerglobal.map[abc.defs] = abc.name;
          } else {
            for (var j = 0; j < abc.defs.length; j++) {
              var def = abc.defs[j];
              playerglobal.map[def] = abc.name;
            }
          }
        }
      }, function (e) {
        console.error(e);
      });
    return playerglobalLoadedPromise;
  };

  avm2Ctor.prototype = {
    notifyConstruct: function notifyConstruct (instanceConstructor, args) {
      // REMOVEME
    }
  };

  return avm2Ctor;

})();
