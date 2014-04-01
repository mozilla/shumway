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
// Class: FontMetrics
module Shumway.AVM2.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  export class FontMetrics extends ASNative {
    static initializer: any = null;
    constructor (emBox: flash.geom.Rectangle, strikethroughOffset: number, strikethroughThickness: number, underlineOffset: number, underlineThickness: number, subscriptOffset: number, subscriptScale: number, superscriptOffset: number, superscriptScale: number, lineGap: number = 0) {
      emBox = emBox; strikethroughOffset = +strikethroughOffset; strikethroughThickness = +strikethroughThickness; underlineOffset = +underlineOffset; underlineThickness = +underlineThickness; subscriptOffset = +subscriptOffset; subscriptScale = +subscriptScale; superscriptOffset = +superscriptOffset; superscriptScale = +superscriptScale; lineGap = +lineGap;
      false && super();
      notImplemented("Dummy Constructor: public flash.text.engine.FontMetrics");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    emBox: flash.geom.Rectangle;
    strikethroughOffset: number;
    strikethroughThickness: number;
    underlineOffset: number;
    underlineThickness: number;
    subscriptOffset: number;
    subscriptScale: number;
    superscriptOffset: number;
    superscriptScale: number;
    lineGap: number;
    // Instance AS -> JS Bindings
  }
}
