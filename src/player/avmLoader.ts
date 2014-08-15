/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2014 Mozilla Foundation
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

module Shumway {
  import BinaryFileReader = Shumway.BinaryFileReader;
  import AbcFile = Shumway.AVM2.ABC.AbcFile;
  import AVM2 = Shumway.AVM2.Runtime.AVM2;
  import assert = Shumway.Debug.assert;
  import ExecutionMode = Shumway.AVM2.Runtime.ExecutionMode;

  export interface LibraryPathInfo {
    abcs: string;
    catalog: string;
  }

  export function createAVM2(builtinPath: string,
                             libraryPath: any, /* LibraryPathInfo | string */
                             avm1Path: string,
                             sysMode: ExecutionMode, appMode: ExecutionMode,
                             next: (avm2: AVM2) => void) {
    function loadAVM1(next) {
      new BinaryFileReader(avm1Path).readAll(null, function (buffer) {
        avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), avm1Path));
        next();
      });
    }

    var avm2;
    release || assert (builtinPath);
    new BinaryFileReader(builtinPath).readAll(null, function (buffer) {
      AVM2.initialize(sysMode, appMode, avm1Path ? loadAVM1 : null);
      avm2 = AVM2.instance;
      Shumway.AVM2.AS.linkNatives(avm2);
      console.time("Execute builtin.abc");
      // Avoid loading more Abcs while the builtins are loaded
      avm2.builtinsLoaded = false;
      // avm2.systemDomain.onMessage.register('classCreated', Stubs.onClassCreated);
      avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "builtin.abc"));
      avm2.builtinsLoaded = true;
      console.timeEnd("Execute builtin.abc");

      // If library is shell.abc, then just go ahead and run it now since
      // it's not worth doing it lazily given that it is so small.
      if (typeof libraryPath === 'string') {
        new BinaryFileReader(libraryPath).readAll(null, function (buffer) {
          avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), <string>libraryPath));
          next(avm2);
        });
        return;
      }

      var libraryPathInfo: LibraryPathInfo = libraryPath;
      if (!AVM2.isPlayerglobalLoaded()) {
        AVM2.loadPlayerglobal(libraryPathInfo.abcs, libraryPathInfo.catalog).then(function () {
          next(avm2);
        });
      }
    });
  }
}
