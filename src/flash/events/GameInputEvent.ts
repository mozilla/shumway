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
module Shumway.AVMX.AS.flash.events {
  export class GameInputEvent extends flash.events.Event {

    static classInitializer: any = null;

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;
    device: flash.ui.GameInputDevice;

    constructor(type: string, bubbles: boolean = false, cancelable: boolean = false,
                device: flash.ui.GameInputDevice = null) {
      super(type, bubbles, cancelable);
      // TODO: coerce
      this.device = device;
    }

    // JS -> AS Bindings
    static DEVICE_ADDED: string = "deviceAdded";
    static DEVICE_REMOVED: string = "deviceRemoved";
  }
}
