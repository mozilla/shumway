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
// Class: BlurFilter
module Shumway.AVM2.AS.flash.filters {
  import notImplemented = Shumway.Debug.notImplemented;
  export class BlurFilter extends flash.filters.BitmapFilter {
    static initializer: any = null;
    constructor (blurX: number = 4, blurY: number = 4, quality: number /*int*/ = 1) {
      blurX = +blurX; blurY = +blurY; quality = quality | 0;
      false && super();
      notImplemented("Dummy Constructor: public flash.filters.BlurFilter");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    clone: () => flash.filters.BitmapFilter;
    // Instance AS -> JS Bindings
    get blurX(): number {
      notImplemented("public flash.filters.BlurFilter::get blurX"); return;
    }
    set blurX(value: number) {
      value = +value;
      notImplemented("public flash.filters.BlurFilter::set blurX"); return;
    }
    get blurY(): number {
      notImplemented("public flash.filters.BlurFilter::get blurY"); return;
    }
    set blurY(value: number) {
      value = +value;
      notImplemented("public flash.filters.BlurFilter::set blurY"); return;
    }
    get quality(): number /*int*/ {
      notImplemented("public flash.filters.BlurFilter::get quality"); return;
    }
    set quality(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.filters.BlurFilter::set quality"); return;
    }
  }
}
