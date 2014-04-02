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
// Class: DropShadowFilter
module Shumway.AVM2.AS.flash.filters {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DropShadowFilter extends flash.filters.BitmapFilter {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["clone"];
    
    constructor (distance: number = 4, angle: number = 45, color: number /*uint*/ = 0, alpha: number = 1, blurX: number = 4, blurY: number = 4, strength: number = 1, quality: number /*int*/ = 1, inner: boolean = false, knockout: boolean = false, hideObject: boolean = false) {
      distance = +distance; angle = +angle; color = color >>> 0; alpha = +alpha; blurX = +blurX; blurY = +blurY; strength = +strength; quality = quality | 0; inner = !!inner; knockout = !!knockout; hideObject = !!hideObject;
      false && super();
      notImplemented("Dummy Constructor: public flash.filters.DropShadowFilter");
    }
    
    // JS -> AS Bindings
    
    clone: () => flash.filters.BitmapFilter;
    
    // AS -> JS Bindings
    
    // _distance: number;
    // _angle: number;
    // _color: number /*uint*/;
    // _alpha: number;
    // _blurX: number;
    // _blurY: number;
    // _hideObject: boolean;
    // _inner: boolean;
    // _knockout: boolean;
    // _quality: number /*int*/;
    // _strength: number;
    get distance(): number {
      notImplemented("public flash.filters.DropShadowFilter::get distance"); return;
      // return this._distance;
    }
    set distance(value: number) {
      value = +value;
      notImplemented("public flash.filters.DropShadowFilter::set distance"); return;
      // this._distance = value;
    }
    get angle(): number {
      notImplemented("public flash.filters.DropShadowFilter::get angle"); return;
      // return this._angle;
    }
    set angle(value: number) {
      value = +value;
      notImplemented("public flash.filters.DropShadowFilter::set angle"); return;
      // this._angle = value;
    }
    get color(): number /*uint*/ {
      notImplemented("public flash.filters.DropShadowFilter::get color"); return;
      // return this._color;
    }
    set color(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.filters.DropShadowFilter::set color"); return;
      // this._color = value;
    }
    get alpha(): number {
      notImplemented("public flash.filters.DropShadowFilter::get alpha"); return;
      // return this._alpha;
    }
    set alpha(value: number) {
      value = +value;
      notImplemented("public flash.filters.DropShadowFilter::set alpha"); return;
      // this._alpha = value;
    }
    get blurX(): number {
      notImplemented("public flash.filters.DropShadowFilter::get blurX"); return;
      // return this._blurX;
    }
    set blurX(value: number) {
      value = +value;
      notImplemented("public flash.filters.DropShadowFilter::set blurX"); return;
      // this._blurX = value;
    }
    get blurY(): number {
      notImplemented("public flash.filters.DropShadowFilter::get blurY"); return;
      // return this._blurY;
    }
    set blurY(value: number) {
      value = +value;
      notImplemented("public flash.filters.DropShadowFilter::set blurY"); return;
      // this._blurY = value;
    }
    get hideObject(): boolean {
      notImplemented("public flash.filters.DropShadowFilter::get hideObject"); return;
      // return this._hideObject;
    }
    set hideObject(value: boolean) {
      value = !!value;
      notImplemented("public flash.filters.DropShadowFilter::set hideObject"); return;
      // this._hideObject = value;
    }
    get inner(): boolean {
      notImplemented("public flash.filters.DropShadowFilter::get inner"); return;
      // return this._inner;
    }
    set inner(value: boolean) {
      value = !!value;
      notImplemented("public flash.filters.DropShadowFilter::set inner"); return;
      // this._inner = value;
    }
    get knockout(): boolean {
      notImplemented("public flash.filters.DropShadowFilter::get knockout"); return;
      // return this._knockout;
    }
    set knockout(value: boolean) {
      value = !!value;
      notImplemented("public flash.filters.DropShadowFilter::set knockout"); return;
      // this._knockout = value;
    }
    get quality(): number /*int*/ {
      notImplemented("public flash.filters.DropShadowFilter::get quality"); return;
      // return this._quality;
    }
    set quality(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.filters.DropShadowFilter::set quality"); return;
      // this._quality = value;
    }
    get strength(): number {
      notImplemented("public flash.filters.DropShadowFilter::get strength"); return;
      // return this._strength;
    }
    set strength(value: number) {
      value = +value;
      notImplemented("public flash.filters.DropShadowFilter::set strength"); return;
      // this._strength = value;
    }
  }
}
