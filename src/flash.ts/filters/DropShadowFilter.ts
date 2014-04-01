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
    static initializer: any = null;
    constructor (distance: number = 4, angle: number = 45, color: number /*uint*/ = 0, alpha: number = 1, blurX: number = 4, blurY: number = 4, strength: number = 1, quality: number /*int*/ = 1, inner: boolean = false, knockout: boolean = false, hideObject: boolean = false) {
      distance = +distance; angle = +angle; color = color >>> 0; alpha = +alpha; blurX = +blurX; blurY = +blurY; strength = +strength; quality = quality | 0; inner = !!inner; knockout = !!knockout; hideObject = !!hideObject;
      false && super();
      notImplemented("Dummy Constructor: public flash.filters.DropShadowFilter");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    clone: () => flash.filters.BitmapFilter;
    // Instance AS -> JS Bindings
    get distance(): number {
      notImplemented("public flash.filters.DropShadowFilter::get distance"); return;
    }
    set distance(value: number) {
      value = +value;
      notImplemented("public flash.filters.DropShadowFilter::set distance"); return;
    }
    get angle(): number {
      notImplemented("public flash.filters.DropShadowFilter::get angle"); return;
    }
    set angle(value: number) {
      value = +value;
      notImplemented("public flash.filters.DropShadowFilter::set angle"); return;
    }
    get color(): number /*uint*/ {
      notImplemented("public flash.filters.DropShadowFilter::get color"); return;
    }
    set color(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.filters.DropShadowFilter::set color"); return;
    }
    get alpha(): number {
      notImplemented("public flash.filters.DropShadowFilter::get alpha"); return;
    }
    set alpha(value: number) {
      value = +value;
      notImplemented("public flash.filters.DropShadowFilter::set alpha"); return;
    }
    get blurX(): number {
      notImplemented("public flash.filters.DropShadowFilter::get blurX"); return;
    }
    set blurX(value: number) {
      value = +value;
      notImplemented("public flash.filters.DropShadowFilter::set blurX"); return;
    }
    get blurY(): number {
      notImplemented("public flash.filters.DropShadowFilter::get blurY"); return;
    }
    set blurY(value: number) {
      value = +value;
      notImplemented("public flash.filters.DropShadowFilter::set blurY"); return;
    }
    get hideObject(): boolean {
      notImplemented("public flash.filters.DropShadowFilter::get hideObject"); return;
    }
    set hideObject(value: boolean) {
      value = !!value;
      notImplemented("public flash.filters.DropShadowFilter::set hideObject"); return;
    }
    get inner(): boolean {
      notImplemented("public flash.filters.DropShadowFilter::get inner"); return;
    }
    set inner(value: boolean) {
      value = !!value;
      notImplemented("public flash.filters.DropShadowFilter::set inner"); return;
    }
    get knockout(): boolean {
      notImplemented("public flash.filters.DropShadowFilter::get knockout"); return;
    }
    set knockout(value: boolean) {
      value = !!value;
      notImplemented("public flash.filters.DropShadowFilter::set knockout"); return;
    }
    get quality(): number /*int*/ {
      notImplemented("public flash.filters.DropShadowFilter::get quality"); return;
    }
    set quality(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.filters.DropShadowFilter::set quality"); return;
    }
    get strength(): number {
      notImplemented("public flash.filters.DropShadowFilter::get strength"); return;
    }
    set strength(value: number) {
      value = +value;
      notImplemented("public flash.filters.DropShadowFilter::set strength"); return;
    }
  }
}
