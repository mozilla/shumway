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
// Class: DomainMemoryWithStage3D
module Shumway.AVM2.AS.flash.system {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DomainMemoryWithStage3D extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: packageInternal flash.system.DomainMemoryWithStage3D");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    _domain_ldr: flash.system.AuthorizedFeaturesLoader;
    _global_ldr: flash.system.AuthorizedFeaturesLoader;
    onDomainCompleteHandler: (evt: flash.events.Event) => void;
    onGlobalCompleteHandler: (evt: flash.events.Event) => void;
    onErrorHandler: (evt: flash.events.Event) => void;
    // Instance AS -> JS Bindings
    forceSoftwareRenderMode(): void {
      notImplemented("packageInternal flash.system.DomainMemoryWithStage3D::forceSoftwareRenderMode"); return;
    }
    showWatermark(): void {
      notImplemented("packageInternal flash.system.DomainMemoryWithStage3D::showWatermark"); return;
    }
  }
}
