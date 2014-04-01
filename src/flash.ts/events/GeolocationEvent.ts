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
// Class: GeolocationEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class GeolocationEvent extends flash.events.Event {
    static initializer: any = null;
    constructor (type: string, bubbles: boolean = false, cancelable: boolean = false, latitude: number = 0, longitude: number = 0, altitude: number = 0, hAccuracy: number = 0, vAccuracy: number = 0, speed: number = 0, heading: number = 0, timestamp: number = 0) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable; latitude = +latitude; longitude = +longitude; altitude = +altitude; hAccuracy = +hAccuracy; vAccuracy = +vAccuracy; speed = +speed; heading = +heading; timestamp = +timestamp;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.GeolocationEvent");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    m_latitude: number;
    m_longitude: number;
    m_altitude: number;
    m_horizontalAccuracy: number;
    m_verticalAccuracy: number;
    m_speed: number;
    m_heading: number;
    m_timestamp: number;
    clone: () => flash.events.Event;
    latitude: number;
    longitude: number;
    altitude: number;
    horizontalAccuracy: number;
    verticalAccuracy: number;
    speed: number;
    heading: number;
    timestamp: number;
    // Instance AS -> JS Bindings
  }
}
