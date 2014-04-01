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
// Class: ColorMatrixFilter
module Shumway.AVM2.AS.flash.filters {
  import notImplemented = Shumway.Debug.notImplemented;
  export class ColorMatrixFilter extends flash.filters.BitmapFilter {
    static initializer: any = null;
    constructor (matrix: any [] = null) {
      matrix = matrix;
      false && super();
      notImplemented("Dummy Constructor: public flash.filters.ColorMatrixFilter");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    clone: () => flash.filters.BitmapFilter;
    // Instance AS -> JS Bindings
    get matrix(): any [] {
      notImplemented("public flash.filters.ColorMatrixFilter::get matrix"); return;
    }
    set matrix(value: any []) {
      value = value;
      notImplemented("public flash.filters.ColorMatrixFilter::set matrix"); return;
    }
  }
}
