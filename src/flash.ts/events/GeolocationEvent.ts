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
// Class: GeolocationEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class GeolocationEvent extends flash.events.Event {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["_latitude", "_longitude", "_altitude", "_hAccuracy", "_vAccuracy", "_speed", "_heading", "_timestamp", "latitude", "latitude", "longitude", "longitude", "altitude", "altitude", "hAccuracy", "hAccuracy", "vAccuracy", "vAccuracy", "speed", "speed", "heading", "heading", "timestamp", "timestamp", "clone", "toString"];
    
    constructor (type: string, bubbles: boolean = false, cancelable: boolean = false, latitude: number = 0, longitude: number = 0, altitude: number = 0, hAccuracy: number = 0, vAccuracy: number = 0, speed: number = 0, heading: number = 0, timestamp: number = 0) {
      type = asCoerceString(type); bubbles = !!bubbles; cancelable = !!cancelable; latitude = +latitude; longitude = +longitude; altitude = +altitude; hAccuracy = +hAccuracy; vAccuracy = +vAccuracy; speed = +speed; heading = +heading; timestamp = +timestamp;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.GeolocationEvent");
    }
    
    // JS -> AS Bindings
    static UPDATE: string = "update";
    
    _latitude: number;
    _longitude: number;
    _altitude: number;
    _hAccuracy: number;
    _vAccuracy: number;
    _speed: number;
    _heading: number;
    _timestamp: number;
    latitude: number;
    longitude: number;
    altitude: number;
    hAccuracy: number;
    vAccuracy: number;
    speed: number;
    heading: number;
    timestamp: number;
    clone: () => flash.events.Event;
    
    // AS -> JS Bindings
    
    // _latitude: number;
    // _longitude: number;
    // _altitude: number;
    // _hAccuracy: number;
    // _vAccuracy: number;
    // _speed: number;
    // _heading: number;
    // _timestamp: number;
  }
}
