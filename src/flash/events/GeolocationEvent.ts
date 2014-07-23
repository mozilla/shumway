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
// Class: GeolocationEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class GeolocationEvent extends flash.events.Event {

    static classInitializer: any = null;
    static initializer: any = null;

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor(type: string, bubbles: boolean = false, cancelable: boolean = false,
                latitude: number = 0, longitude: number = 0, altitude: number = 0,
                hAccuracy: number = 0, vAccuracy: number = 0, speed: number = 0,
                heading: number = 0, timestamp: number = 0) {
      super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.GeolocationEvent");
    }

    // JS -> AS Bindings
    static UPDATE: string = "update";
  }
}
