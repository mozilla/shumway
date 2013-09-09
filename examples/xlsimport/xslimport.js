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

function displaySheet(sheet) {
  var tableElement = document.createElement('table');
  tableElement.setAttribute('border', '1');
  var rows = sheet.asGetPublicProperty('rows'), cols = sheet.asGetPublicProperty('cols');
  for (var i = 0; i < rows; i++) {
    var trElement = document.createElement('tr');
    var row = sheet.asGetPublicProperty('values')[i];
    for (var j = 0; j < cols; j++) {
      var cell = row[j];
      var tdElement = document.createElement('td');
      tdElement.textContent = cell.asGetPublicProperty('value');
      trElement.appendChild(tdElement);
    }
    tableElement.appendChild(trElement);
  }
  document.body.appendChild(tableElement);
}

function main(avm2) {
  loadBinary('./HelloWorld.xls', function (buffer) {
    console.profile("XLS file parsing");
    var ExcelFileClass = avm2.applicationDomain.getClass('com.as3xls.xls.ExcelFile');
    var ByteArrayClass = avm2.applicationDomain.getClass('flash.utils.ByteArray');

    var xlsFile = new ByteArrayClass.instanceConstructor(new Uint8Array(buffer));
    var excel = new ExcelFileClass.instanceConstructor();
    excel.asGetPublicProperty('loadFromByteArray').call(excel, xlsFile);
    var sheet = excel.asGetPublicProperty('sheets')[0];
    console.profileEnd("XLS file parsing");

    displaySheet(sheet);
  })
}

var BUILTIN_PATH = SHUMWAY_ROOT + 'avm2/generated/builtin/builtin.abc';
var PLAYERGLOBAL_PATH = SHUMWAY_ROOT + 'flash/playerglobal.abc';
var AS3XLS_PATH = './as3xls-lib.swc';

function loadBinary(path, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', path, true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function (e) {
    callback(xhr.response);
  };
  xhr.onerror = function (e) {
    console.error('Unable to load SWC: ' + path);
  }
  xhr.send(null);
}

function createAVM2(builtinPath, playerGlobalPath, libraryPath, next) {
  var sysMode = EXECUTION_MODE.COMPILE;
  var appMode = EXECUTION_MODE.COMPILE;
  enableC4.value = true;
  enableVerifier.value = true;

  var library, playerglobal;

  function findDefiningAbc(mn) {
    var name, abcEntry;
    for (var i = 0; i < mn.namespaces.length; i++) {
      name = mn.namespaces[i].originalURI + ":" + mn.name;
      abcEntry = library[name] || playerglobal[name];
      if (abcEntry) {
        break;
      }
    }
    if (abcEntry) {
      return new AbcFile(abcEntry.abc, abcEntry.name);
    }
    return null;
  }

  function loadBuiltin() {
    loadBinary(builtinPath, function (buffer) {
      avm2 = new AVM2(sysMode, appMode, findDefiningAbc);
      console.time("Execute builtin.abc");
      avm2.loadedAbcs = {};
      avm2.systemDomain.onMessage.register('classCreated', Stubs.onClassCreated);
      avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "builtin.abc"));
      console.timeEnd("Execute builtin.abc");

      next(avm2);
    });
  }
  function loadLibrary() {
    loadSWC(libraryPath, function (library_) {
      library = library_;
      loadBuiltin();
    });
  }
  function loadPlayerglobals() {
    if (!playerGlobalPath) {
      loadLibrary();
      return;
    }

    loadBinary(playerGlobalPath, function (buffer) {
      playerglobal = Object.create(null);
      for (var className in playerGlobalNames) {
        var script = playerGlobalScripts[playerGlobalNames[className]];
        playerglobal[className] = {
          name: playerGlobalNames[className],
          abc: new Uint8Array(buffer, script.offset, script.length)
        };
      }
      loadLibrary();
    });
  }
  loadPlayerglobals();
}

createAVM2(BUILTIN_PATH, PLAYERGLOBAL_PATH, AS3XLS_PATH, main);