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
// Class: GameInputEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class GameInputEvent extends flash.events.Event {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["_device", "device"];
    
    constructor (type: string, bubbles: boolean = false, cancelable: boolean = false, device: flash.ui.GameInputDevice = null) {
      type = asCoerceString(type); bubbles = !!bubbles; cancelable = !!cancelable; device = device;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.GameInputEvent");
    }
    
    // JS -> AS Bindings
    static DEVICE_ADDED: string = "deviceAdded";
    static DEVICE_REMOVED: string = "deviceRemoved";
    
    _device: flash.ui.GameInputDevice;
    device: flash.ui.GameInputDevice;
    
    // AS -> JS Bindings
    
    // _device: flash.ui.GameInputDevice;
  }
}
