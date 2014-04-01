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
 * limitations undxr the License.
 */
// Class: SystemUpdater
module Shumway.AVM2.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  export class SystemUpdater extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.system.SystemUpdater");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    _pm: adobe.utils.ProductManager;
    update: (type: string) => void;
    cancel: () => void;
    onProductManagerEvent: (e: flash.events.Event) => void;
    // Instance AS -> JS Bindings
    _update(type: string, pm: adobe.utils.ProductManager): boolean {
      type = "" + type; pm = pm;
      notImplemented("public flash.system.SystemUpdater::_update"); return;
    }
    _cancel(viaAPI: boolean, pm: adobe.utils.ProductManager): void {
      viaAPI = !!viaAPI; pm = pm;
      notImplemented("public flash.system.SystemUpdater::_cancel"); return;
    }
  }
}
