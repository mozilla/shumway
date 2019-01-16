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
  import assert = Shumway.Debug.assert;
  import AXSecurityDomain = Shumway.AVMX.AXSecurityDomain;

  export enum AVM2LoadLibrariesFlags {
    Builtin = 1,
    Playerglobal = 2,
    Shell = 4
  }

  export function createSecurityDomain(libraries: AVM2LoadLibrariesFlags): Promise<AXSecurityDomain> {
    var result = new PromiseWrapper<AXSecurityDomain>();
    release || assert (!!(libraries & AVM2LoadLibrariesFlags.Builtin));
    SWF.enterTimeline('Load builtin.abc file');
    SystemResourcesLoadingService.instance.load(SystemResourceId.BuiltinAbc).then(function (buffer) {
      var sec = new Shumway.AVMX.AXSecurityDomain();
      var env = {url: 'builtin.abc', app: sec.system};
      var builtinABC = new Shumway.AVMX.ABCFile(env, new Uint8Array(buffer));
      sec.system.loadABC(builtinABC);
      sec.initialize();
      sec.system.executeABC(builtinABC);
      SWF.leaveTimeline();


      //// If library is shell.abc, then just go ahead and run it now since
      //// it's not worth doing it lazily given that it is so small.
      //if (!!(libraries & AVM2LoadLibrariesFlags.Shell)) {
      //  var shellABC = new Shumway.AVMX.ABCFile(new Uint8Array(buffer));
      //  sec.system.loadAndExecuteABC(shellABC);
      //  result.resolve(sec);
      //  SystemResourcesLoadingService.instance.load(SystemResourceId.ShellAbc).then(function (buffer) {
      //    var shellABC = new Shumway.AVMX.ABCFile(new Uint8Array(buffer));
      //    sec.system.loadAndExecuteABC(shellABC);
      //    result.resolve(sec);
      //  }, result.reject);
      //  return;
      //}

      if (!!(libraries & AVM2LoadLibrariesFlags.Playerglobal)) {
        SWF.enterTimeline('Load playerglobal files');
        return Promise.all([
          SystemResourcesLoadingService.instance.load(SystemResourceId.PlayerglobalAbcs),
          SystemResourcesLoadingService.instance.load(SystemResourceId.PlayerglobalManifest)]).
          then(function (results) {
            var catalog = new Shumway.AVMX.ABCCatalog(sec.system, new Uint8Array(results[0]),
                                                      results[1]);
            sec.addCatalog(catalog);
            SWF.leaveTimeline();
            result.resolve(sec);
          }, result.reject);
      }

      result.resolve(sec);
    }, result.reject);
    return result.promise;
  }
}
