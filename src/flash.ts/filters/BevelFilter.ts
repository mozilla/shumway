/**
 * Copyright 2014 Mozilla Foundation
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
// Class: BevelFilter
module Shumway.AVM2.AS.flash.filters {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class BevelFilter extends flash.filters.BitmapFilter {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["clone"];
    
    constructor (distance: number = 4, angle: number = 45, highlightColor: number /*uint*/ = 16777215, highlightAlpha: number = 1, shadowColor: number /*uint*/ = 0, shadowAlpha: number = 1, blurX: number = 4, blurY: number = 4, strength: number = 1, quality: number /*int*/ = 1, type: string = "inner", knockout: boolean = false) {
      distance = +distance; angle = +angle; highlightColor = highlightColor >>> 0; highlightAlpha = +highlightAlpha; shadowColor = shadowColor >>> 0; shadowAlpha = +shadowAlpha; blurX = +blurX; blurY = +blurY; strength = +strength; quality = quality | 0; type = asCoerceString(type); knockout = !!knockout;
      false && super();
      notImplemented("Dummy Constructor: public flash.filters.BevelFilter");
    }
    
    // JS -> AS Bindings
    
    clone: () => flash.filters.BitmapFilter;
    
    // AS -> JS Bindings
    
    // _distance: number;
    // _angle: number;
    // _highlightColor: number /*uint*/;
    // _highlightAlpha: number;
    // _shadowColor: number /*uint*/;
    // _shadowAlpha: number;
    // _blurX: number;
    // _blurY: number;
    // _knockout: boolean;
    // _quality: number /*int*/;
    // _strength: number;
    // _type: string;
    get distance(): number {
      notImplemented("public flash.filters.BevelFilter::get distance"); return;
      // return this._distance;
    }
    set distance(value: number) {
      value = +value;
      notImplemented("public flash.filters.BevelFilter::set distance"); return;
      // this._distance = value;
    }
    get angle(): number {
      notImplemented("public flash.filters.BevelFilter::get angle"); return;
      // return this._angle;
    }
    set angle(value: number) {
      value = +value;
      notImplemented("public flash.filters.BevelFilter::set angle"); return;
      // this._angle = value;
    }
    get highlightColor(): number /*uint*/ {
      notImplemented("public flash.filters.BevelFilter::get highlightColor"); return;
      // return this._highlightColor;
    }
    set highlightColor(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.filters.BevelFilter::set highlightColor"); return;
      // this._highlightColor = value;
    }
    get highlightAlpha(): number {
      notImplemented("public flash.filters.BevelFilter::get highlightAlpha"); return;
      // return this._highlightAlpha;
    }
    set highlightAlpha(value: number) {
      value = +value;
      notImplemented("public flash.filters.BevelFilter::set highlightAlpha"); return;
      // this._highlightAlpha = value;
    }
    get shadowColor(): number /*uint*/ {
      notImplemented("public flash.filters.BevelFilter::get shadowColor"); return;
      // return this._shadowColor;
    }
    set shadowColor(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.filters.BevelFilter::set shadowColor"); return;
      // this._shadowColor = value;
    }
    get shadowAlpha(): number {
      notImplemented("public flash.filters.BevelFilter::get shadowAlpha"); return;
      // return this._shadowAlpha;
    }
    set shadowAlpha(value: number) {
      value = +value;
      notImplemented("public flash.filters.BevelFilter::set shadowAlpha"); return;
      // this._shadowAlpha = value;
    }
    get blurX(): number {
      notImplemented("public flash.filters.BevelFilter::get blurX"); return;
      // return this._blurX;
    }
    set blurX(value: number) {
      value = +value;
      notImplemented("public flash.filters.BevelFilter::set blurX"); return;
      // this._blurX = value;
    }
    get blurY(): number {
      notImplemented("public flash.filters.BevelFilter::get blurY"); return;
      // return this._blurY;
    }
    set blurY(value: number) {
      value = +value;
      notImplemented("public flash.filters.BevelFilter::set blurY"); return;
      // this._blurY = value;
    }
    get knockout(): boolean {
      notImplemented("public flash.filters.BevelFilter::get knockout"); return;
      // return this._knockout;
    }
    set knockout(value: boolean) {
      value = !!value;
      notImplemented("public flash.filters.BevelFilter::set knockout"); return;
      // this._knockout = value;
    }
    get quality(): number /*int*/ {
      notImplemented("public flash.filters.BevelFilter::get quality"); return;
      // return this._quality;
    }
    set quality(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.filters.BevelFilter::set quality"); return;
      // this._quality = value;
    }
    get strength(): number {
      notImplemented("public flash.filters.BevelFilter::get strength"); return;
      // return this._strength;
    }
    set strength(value: number) {
      value = +value;
      notImplemented("public flash.filters.BevelFilter::set strength"); return;
      // this._strength = value;
    }
    get type(): string {
      notImplemented("public flash.filters.BevelFilter::get type"); return;
      // return this._type;
    }
    set type(value: string) {
      value = asCoerceString(value);
      notImplemented("public flash.filters.BevelFilter::set type"); return;
      // this._type = value;
    }
  }
}
