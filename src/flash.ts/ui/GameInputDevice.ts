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
// Class: GameInputDevice
module Shumway.AVM2.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  export class GameInputDevice extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.ui.GameInputDevice");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    getControlAt(i: number /*int*/): flash.ui.GameInputControl {
      i = i | 0;
      notImplemented("public flash.ui.GameInputDevice::getControlAt"); return;
    }
    get numControls(): number /*int*/ {
      notImplemented("public flash.ui.GameInputDevice::get numControls"); return;
    }
    startCachingSamples(numSamples: number /*int*/, controls: ASVector<number /*int*/>): void {
      numSamples = numSamples | 0; controls = controls;
      notImplemented("public flash.ui.GameInputDevice::startCachingSamples"); return;
    }
    get sampleInterval(): number /*int*/ {
      notImplemented("public flash.ui.GameInputDevice::get sampleInterval"); return;
    }
    set sampleInterval(val: number /*int*/) {
      val = val | 0;
      notImplemented("public flash.ui.GameInputDevice::set sampleInterval"); return;
    }
    stopCachingSamples(): void {
      notImplemented("public flash.ui.GameInputDevice::stopCachingSamples"); return;
    }
    getCachedSamples(data: flash.utils.ByteArray, append: boolean = false): number /*int*/ {
      data = data; append = !!append;
      notImplemented("public flash.ui.GameInputDevice::getCachedSamples"); return;
    }
    get enabled(): boolean {
      notImplemented("public flash.ui.GameInputDevice::get enabled"); return;
    }
    set enabled(val: boolean) {
      val = !!val;
      notImplemented("public flash.ui.GameInputDevice::set enabled"); return;
    }
    get id(): string {
      notImplemented("public flash.ui.GameInputDevice::get id"); return;
    }
    get name(): string {
      notImplemented("public flash.ui.GameInputDevice::get name"); return;
    }
  }
}
