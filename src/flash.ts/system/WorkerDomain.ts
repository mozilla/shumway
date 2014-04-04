/**
 * Copyright 2013 Mozilla Foundation
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Class: WorkerDomain
module Shumway.AVM2.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  export class WorkerDomain extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.system.WorkerDomain");
    }
    // Static   JS -> AS Bindings
    static current: flash.system.WorkerDomain;
    static _current: flash.system.WorkerDomain;
    // Static   AS -> JS Bindings
    get isSupported(): boolean {
      notImplemented("public flash.system.WorkerDomain::get isSupported"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    createWorker(swf: flash.utils.ByteArray, giveAppPrivileges: boolean = false): flash.system.Worker {
      swf = swf; giveAppPrivileges = !!giveAppPrivileges;
      notImplemented("public flash.system.WorkerDomain::createWorker"); return;
    }
    listWorkers(): ASVector<flash.system.Worker> {
      notImplemented("public flash.system.WorkerDomain::listWorkers"); return;
    }
  }
}
