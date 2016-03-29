/**
 * Copyright 2014 Mozilla Foundation
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
// Class: GameInputDevice
module Shumway.AVMX.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class GameInputDevice extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      super();
    }
    
    static MAX_BUFFER_SIZE: number /*int*/ = 4800;

    // _numControls: number /*int*/;
    // _sampleInterval: number /*int*/;
    // _enabled: boolean;
    // _id: string;
    // _name: string;
    get numControls(): number /*int*/ {
      release || notImplemented("public flash.ui.GameInputDevice::get numControls"); return;
      // return this._numControls;
    }
    get sampleInterval(): number /*int*/ {
      release || notImplemented("public flash.ui.GameInputDevice::get sampleInterval"); return;
      // return this._sampleInterval;
    }
    set sampleInterval(val: number /*int*/) {
      val = val | 0;
      release || notImplemented("public flash.ui.GameInputDevice::set sampleInterval"); return;
      // this._sampleInterval = val;
    }
    get enabled(): boolean {
      release || notImplemented("public flash.ui.GameInputDevice::get enabled"); return;
      // return this._enabled;
    }
    set enabled(val: boolean) {
      val = !!val;
      release || notImplemented("public flash.ui.GameInputDevice::set enabled"); return;
      // this._enabled = val;
    }
    get id(): string {
      release || notImplemented("public flash.ui.GameInputDevice::get id"); return;
      // return this._id;
    }
    get name(): string {
      release || notImplemented("public flash.ui.GameInputDevice::get name"); return;
      // return this._name;
    }
    getControlAt(i: number /*int*/): flash.ui.GameInputControl {
      i = i | 0;
      release || notImplemented("public flash.ui.GameInputDevice::getControlAt"); return;
    }
    startCachingSamples(numSamples: number /*int*/, controls: GenericVector): void {
      numSamples = numSamples | 0; controls = controls;
      release || notImplemented("public flash.ui.GameInputDevice::startCachingSamples"); return;
    }
    stopCachingSamples(): void {
      release || notImplemented("public flash.ui.GameInputDevice::stopCachingSamples"); return;
    }
    getCachedSamples(data: flash.utils.ByteArray, append: boolean = false): number /*int*/ {
      data = data; append = !!append;
      release || notImplemented("public flash.ui.GameInputDevice::getCachedSamples"); return;
    }
  }
}
