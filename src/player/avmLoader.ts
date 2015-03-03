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

  export enum AVM2LoadLibrariesFlags {
    Builtin = 1,
    Playerglobal = 2,
    Shell = 4
  }

  export function createAVM2(libraries: AVM2LoadLibrariesFlags,
                             sysMode: ExecutionMode,
                             appMode: ExecutionMode): Promise<AVM2> {
    var avm2;
    var result = new PromiseWrapper<AVM2>();
    release || assert (!!(libraries & AVM2LoadLibrariesFlags.Builtin));
    SWF.enterTimeline('Load builton.abc file');
    SystemResourcesLoadingService.instance.load(SystemResourceId.BuiltinAbc).then(function (buffer) {
      SWF.leaveTimeline();
      AVM2.initialize(sysMode, appMode);
      avm2 = AVM2.instance;
      Shumway.AVM2.AS.linkNatives(avm2);
      console.time("Execute builtin.abc");
      // Avoid loading more Abcs while the builtins are loaded
      avm2.builtinsLoaded = false;
      avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "builtin.abc"));
      avm2.builtinsLoaded = true;
      console.timeEnd("Execute builtin.abc");

      // If library is shell.abc, then just go ahead and run it now since
      // it's not worth doing it lazily given that it is so small.
      if (!!(libraries & AVM2LoadLibrariesFlags.Shell)) {
        SystemResourcesLoadingService.instance.load(SystemResourceId.ShellAbc).then(function (buffer) {
          avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "shell.abc"));
          result.resolve(avm2);
        }, result.reject);
        return;
      }

      if (!!(libraries & AVM2LoadLibrariesFlags.Playerglobal) &&
          !AVM2.isPlayerglobalLoaded()) {
        AVM2.loadPlayerglobal().then(function () {
          result.resolve(avm2);
        }, result.reject);
        return;
      }

      result.resolve(avm2);
    }, result.reject);
    return result.promise;
  }
}
