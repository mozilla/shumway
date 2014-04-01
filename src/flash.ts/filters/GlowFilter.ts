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
// Class: GlowFilter
module Shumway.AVM2.AS.flash.filters {
  import notImplemented = Shumway.Debug.notImplemented;
  export class GlowFilter extends flash.filters.BitmapFilter {
    static initializer: any = null;
    constructor (color: number /*uint*/ = 16711680, alpha: number = 1, blurX: number = 6, blurY: number = 6, strength: number = 2, quality: number /*int*/ = 1, inner: boolean = false, knockout: boolean = false) {
      color = color >>> 0; alpha = +alpha; blurX = +blurX; blurY = +blurY; strength = +strength; quality = quality | 0; inner = !!inner; knockout = !!knockout;
      false && super();
      notImplemented("Dummy Constructor: public flash.filters.GlowFilter");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    clone: () => flash.filters.BitmapFilter;
    // Instance AS -> JS Bindings
    get color(): number /*uint*/ {
      notImplemented("public flash.filters.GlowFilter::get color"); return;
    }
    set color(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.filters.GlowFilter::set color"); return;
    }
    get alpha(): number {
      notImplemented("public flash.filters.GlowFilter::get alpha"); return;
    }
    set alpha(value: number) {
      value = +value;
      notImplemented("public flash.filters.GlowFilter::set alpha"); return;
    }
    get blurX(): number {
      notImplemented("public flash.filters.GlowFilter::get blurX"); return;
    }
    set blurX(value: number) {
      value = +value;
      notImplemented("public flash.filters.GlowFilter::set blurX"); return;
    }
    get blurY(): number {
      notImplemented("public flash.filters.GlowFilter::get blurY"); return;
    }
    set blurY(value: number) {
      value = +value;
      notImplemented("public flash.filters.GlowFilter::set blurY"); return;
    }
    get inner(): boolean {
      notImplemented("public flash.filters.GlowFilter::get inner"); return;
    }
    set inner(value: boolean) {
      value = !!value;
      notImplemented("public flash.filters.GlowFilter::set inner"); return;
    }
    get knockout(): boolean {
      notImplemented("public flash.filters.GlowFilter::get knockout"); return;
    }
    set knockout(value: boolean) {
      value = !!value;
      notImplemented("public flash.filters.GlowFilter::set knockout"); return;
    }
    get quality(): number /*int*/ {
      notImplemented("public flash.filters.GlowFilter::get quality"); return;
    }
    set quality(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.filters.GlowFilter::set quality"); return;
    }
    get strength(): number {
      notImplemented("public flash.filters.GlowFilter::get strength"); return;
    }
    set strength(value: number) {
      value = +value;
      notImplemented("public flash.filters.GlowFilter::set strength"); return;
    }
  }
}
