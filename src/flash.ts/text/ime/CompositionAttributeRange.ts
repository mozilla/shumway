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
// Class: CompositionAttributeRange
module Shumway.AVM2.AS.flash.text.ime {
  import notImplemented = Shumway.Debug.notImplemented;
  export class CompositionAttributeRange extends ASNative {
    static initializer: any = null;
    constructor (relativeStart: number /*int*/, relativeEnd: number /*int*/, selected: boolean, converted: boolean) {
      relativeStart = relativeStart | 0; relativeEnd = relativeEnd | 0; selected = !!selected; converted = !!converted;
      false && super();
      notImplemented("Dummy Constructor: public flash.text.ime.CompositionAttributeRange");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    relativeStart: number /*int*/;
    relativeEnd: number /*int*/;
    selected: boolean;
    converted: boolean;
    // Instance AS -> JS Bindings
  }
}
