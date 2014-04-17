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
// Class: DisplacementMapFilter
module Shumway.AVM2.AS.flash.filters {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class DisplacementMapFilter extends flash.filters.BitmapFilter {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["clone"];
    
    constructor (mapBitmap: flash.display.BitmapData = null, mapPoint: flash.geom.Point = null, componentX: number /*uint*/ = 0, componentY: number /*uint*/ = 0, scaleX: number = 0, scaleY: number = 0, mode: string = "wrap", color: number /*uint*/ = 0, alpha: number = 0) {
      mapBitmap = mapBitmap; mapPoint = mapPoint; componentX = componentX >>> 0; componentY = componentY >>> 0; scaleX = +scaleX; scaleY = +scaleY; mode = asCoerceString(mode); color = color >>> 0; alpha = +alpha;
      false && super();
      notImplemented("Dummy Constructor: public flash.filters.DisplacementMapFilter");
    }
    
    // JS -> AS Bindings
    
    clone: () => flash.filters.BitmapFilter;
    
    // AS -> JS Bindings
    
    // _mapBitmap: flash.display.BitmapData;
    // _mapPoint: flash.geom.Point;
    // _componentX: number /*uint*/;
    // _componentY: number /*uint*/;
    // _scaleX: number;
    // _scaleY: number;
    // _mode: string;
    // _color: number /*uint*/;
    // _alpha: number;
    get mapBitmap(): flash.display.BitmapData {
      notImplemented("public flash.filters.DisplacementMapFilter::get mapBitmap"); return;
      // return this._mapBitmap;
    }
    set mapBitmap(value: flash.display.BitmapData) {
      value = value;
      notImplemented("public flash.filters.DisplacementMapFilter::set mapBitmap"); return;
      // this._mapBitmap = value;
    }
    get mapPoint(): flash.geom.Point {
      notImplemented("public flash.filters.DisplacementMapFilter::get mapPoint"); return;
      // return this._mapPoint;
    }
    set mapPoint(value: flash.geom.Point) {
      value = value;
      notImplemented("public flash.filters.DisplacementMapFilter::set mapPoint"); return;
      // this._mapPoint = value;
    }
    get componentX(): number /*uint*/ {
      notImplemented("public flash.filters.DisplacementMapFilter::get componentX"); return;
      // return this._componentX;
    }
    set componentX(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.filters.DisplacementMapFilter::set componentX"); return;
      // this._componentX = value;
    }
    get componentY(): number /*uint*/ {
      notImplemented("public flash.filters.DisplacementMapFilter::get componentY"); return;
      // return this._componentY;
    }
    set componentY(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.filters.DisplacementMapFilter::set componentY"); return;
      // this._componentY = value;
    }
    get scaleX(): number {
      notImplemented("public flash.filters.DisplacementMapFilter::get scaleX"); return;
      // return this._scaleX;
    }
    set scaleX(value: number) {
      value = +value;
      notImplemented("public flash.filters.DisplacementMapFilter::set scaleX"); return;
      // this._scaleX = value;
    }
    get scaleY(): number {
      notImplemented("public flash.filters.DisplacementMapFilter::get scaleY"); return;
      // return this._scaleY;
    }
    set scaleY(value: number) {
      value = +value;
      notImplemented("public flash.filters.DisplacementMapFilter::set scaleY"); return;
      // this._scaleY = value;
    }
    get mode(): string {
      notImplemented("public flash.filters.DisplacementMapFilter::get mode"); return;
      // return this._mode;
    }
    set mode(value: string) {
      value = asCoerceString(value);
      notImplemented("public flash.filters.DisplacementMapFilter::set mode"); return;
      // this._mode = value;
    }
    get color(): number /*uint*/ {
      notImplemented("public flash.filters.DisplacementMapFilter::get color"); return;
      // return this._color;
    }
    set color(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.filters.DisplacementMapFilter::set color"); return;
      // this._color = value;
    }
    get alpha(): number {
      notImplemented("public flash.filters.DisplacementMapFilter::get alpha"); return;
      // return this._alpha;
    }
    set alpha(value: number) {
      value = +value;
      notImplemented("public flash.filters.DisplacementMapFilter::set alpha"); return;
      // this._alpha = value;
    }
  }
}
