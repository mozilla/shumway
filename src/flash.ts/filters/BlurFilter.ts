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
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["clone"];
    
    constructor (blurX: number = 4, blurY: number = 4, quality: number /*int*/ = 1) {
      blurX = +blurX; blurY = +blurY; quality = quality | 0;
      false && super();
      notImplemented("Dummy Constructor: public flash.filters.BlurFilter");
    }
    
    // JS -> AS Bindings
    
    clone: () => flash.filters.BitmapFilter;
    
    // AS -> JS Bindings
    
    // _blurX: number;
    // _blurY: number;
    // _quality: number /*int*/;
    get blurX(): number {
      notImplemented("public flash.filters.BlurFilter::get blurX"); return;
      // return this._blurX;
    }
    set blurX(value: number) {
      value = +value;
      notImplemented("public flash.filters.BlurFilter::set blurX"); return;
      // this._blurX = value;
    }
    get blurY(): number {
      notImplemented("public flash.filters.BlurFilter::get blurY"); return;
      // return this._blurY;
    }
    set blurY(value: number) {
      value = +value;
      notImplemented("public flash.filters.BlurFilter::set blurY"); return;
      // this._blurY = value;
    }
    get quality(): number /*int*/ {
      notImplemented("public flash.filters.BlurFilter::get quality"); return;
      // return this._quality;
    }
    set quality(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.filters.BlurFilter::set quality"); return;
      // this._quality = value;
    }
  }
}
