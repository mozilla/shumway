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
// Class: ColorTransform
module Shumway.AVM2.AS.flash.geom {
  import notImplemented = Shumway.Debug.notImplemented;
  export class ColorTransform extends ASNative {
    static initializer: any = null;
    constructor (redMultiplier: number = 1, greenMultiplier: number = 1, blueMultiplier: number = 1, alphaMultiplier: number = 1, redOffset: number = 0, greenOffset: number = 0, blueOffset: number = 0, alphaOffset: number = 0) {
      redMultiplier = +redMultiplier; greenMultiplier = +greenMultiplier; blueMultiplier = +blueMultiplier; alphaMultiplier = +alphaMultiplier; redOffset = +redOffset; greenOffset = +greenOffset; blueOffset = +blueOffset; alphaOffset = +alphaOffset;
      false && super();
      notImplemented("Dummy Constructor: public flash.geom.ColorTransform");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    redMultiplier: number;
    greenMultiplier: number;
    blueMultiplier: number;
    alphaMultiplier: number;
    redOffset: number;
    greenOffset: number;
    blueOffset: number;
    alphaOffset: number;
    color: number /*uint*/;
    concat: (second: flash.geom.ColorTransform) => void;
    // Instance AS -> JS Bindings
  }
}
