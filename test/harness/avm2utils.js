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
var avm1Path = avm2Root + "generated/avm1lib/avm1lib.abc";

var playerglobalInfo = {
  abcs: WEB_ROOT + "../build/playerglobal/playerglobal.abcs",
  catalog: WEB_ROOT + "../build/playerglobal/playerglobal.json"
};

// avm2 must be global.
var avm2;
var sanityTests = [];

function createAVM2(builtinPath, libraryPath, avm1Path, sysMode, appMode, next) {
  assert (builtinPath);
  avm2 = new AVM2(sysMode, appMode, loadAVM1);
  var builtinAbc, avm1Abc;

  AVM2.loadPlayerglobal(libraryPath.abcs, libraryPath.catalog).then(function () {
    new BinaryFileReader(builtinPath).readAll(null, function (buffer) {
      builtinAbc = new AbcFile(new Uint8Array(buffer), "builtin.abc");
      executeAbc();
    });
  });

  function loadAVM1(next) {
    new BinaryFileReader(avm1Path).readAll(null, function (buffer) {
      avm1Abc = new AbcFile(new Uint8Array(buffer), "avm1.abc");;
      avm2.systemDomain.executeAbc(avm1Abc);
      next();
    });
  }
  function executeAbc() {
    assert (builtinAbc);
    avm2.builtinsLoaded = false;
    avm2.systemDomain.onMessage.register('classCreated', Stubs.onClassCreated);
    avm2.systemDomain.executeAbc(builtinAbc);
    avm2.builtinsLoaded = true;
    next(avm2);
  }
}
