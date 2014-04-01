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
// Class: GameInput
module Shumway.AVM2.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  export class GameInput extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor () {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.ui.GameInput");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    static getDeviceAt(index: number /*int*/): flash.ui.GameInputDevice {
      index = index | 0;
      notImplemented("public flash.ui.GameInput::static getDeviceAt"); return;
    }
    get numDevices(): number /*int*/ {
      notImplemented("public flash.ui.GameInput::get numDevices"); return;
    }
    get isSupported(): boolean {
      notImplemented("public flash.ui.GameInput::get isSupported"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
  }
}
