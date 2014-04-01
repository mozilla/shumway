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
// Class: AccelerometerEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class AccelerometerEvent extends flash.events.Event {
    static initializer: any = null;
    constructor (type: string, bubbles: boolean = false, cancelable: boolean = false, timestamp: number = 0, accelerationX: number = 0, accelerationY: number = 0, accelerationZ: number = 0) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable; timestamp = +timestamp; accelerationX = +accelerationX; accelerationY = +accelerationY; accelerationZ = +accelerationZ;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.AccelerometerEvent");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    m_accelerationX: number;
    m_accelerationY: number;
    m_accelerationZ: number;
    m_timestamp: number;
    clone: () => flash.events.Event;
    accelerationX: number;
    accelerationY: number;
    accelerationZ: number;
    timestamp: number;
    // Instance AS -> JS Bindings
  }
}
