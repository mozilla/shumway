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
// Class: ShaderEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class ShaderEvent extends flash.events.Event {
    static initializer: any = null;
    constructor (type: string, bubbles: boolean = false, cancelable: boolean = false, bitmap: flash.display.BitmapData = null, array: flash.utils.ByteArray = null, vector: ASVector<number> = null) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable; bitmap = bitmap; array = array; vector = vector;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.ShaderEvent");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    clone: () => flash.events.Event;
    bitmapData: flash.display.BitmapData;
    byteArray: flash.utils.ByteArray;
    vector: ASVector<number>;
    m_bitmapData: flash.display.BitmapData;
    m_byteArray: flash.utils.ByteArray;
    m_vector: ASVector<number>;
    // Instance AS -> JS Bindings
  }
}
