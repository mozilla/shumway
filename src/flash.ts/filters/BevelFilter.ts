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
// Class: BevelFilter
module Shumway.AVM2.AS.flash.filters {
  import notImplemented = Shumway.Debug.notImplemented;
  export class BevelFilter extends flash.filters.BitmapFilter {
    static initializer: any = null;
    constructor (distance: number = 4, angle: number = 45, highlightColor: number /*uint*/ = 16777215, highlightAlpha: number = 1, shadowColor: number /*uint*/ = 0, shadowAlpha: number = 1, blurX: number = 4, blurY: number = 4, strength: number = 1, quality: number /*int*/ = 1, type: string = "inner", knockout: boolean = false) {
      distance = +distance; angle = +angle; highlightColor = highlightColor >>> 0; highlightAlpha = +highlightAlpha; shadowColor = shadowColor >>> 0; shadowAlpha = +shadowAlpha; blurX = +blurX; blurY = +blurY; strength = +strength; quality = quality | 0; type = "" + type; knockout = !!knockout;
      false && super();
      notImplemented("Dummy Constructor: public flash.filters.BevelFilter");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    clone: () => flash.filters.BitmapFilter;
    // Instance AS -> JS Bindings
    get distance(): number {
      notImplemented("public flash.filters.BevelFilter::get distance"); return;
    }
    set distance(value: number) {
      value = +value;
      notImplemented("public flash.filters.BevelFilter::set distance"); return;
    }
    get angle(): number {
      notImplemented("public flash.filters.BevelFilter::get angle"); return;
    }
    set angle(value: number) {
      value = +value;
      notImplemented("public flash.filters.BevelFilter::set angle"); return;
    }
    get highlightColor(): number /*uint*/ {
      notImplemented("public flash.filters.BevelFilter::get highlightColor"); return;
    }
    set highlightColor(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.filters.BevelFilter::set highlightColor"); return;
    }
    get highlightAlpha(): number {
      notImplemented("public flash.filters.BevelFilter::get highlightAlpha"); return;
    }
    set highlightAlpha(value: number) {
      value = +value;
      notImplemented("public flash.filters.BevelFilter::set highlightAlpha"); return;
    }
    get shadowColor(): number /*uint*/ {
      notImplemented("public flash.filters.BevelFilter::get shadowColor"); return;
    }
    set shadowColor(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.filters.BevelFilter::set shadowColor"); return;
    }
    get shadowAlpha(): number {
      notImplemented("public flash.filters.BevelFilter::get shadowAlpha"); return;
    }
    set shadowAlpha(value: number) {
      value = +value;
      notImplemented("public flash.filters.BevelFilter::set shadowAlpha"); return;
    }
    get blurX(): number {
      notImplemented("public flash.filters.BevelFilter::get blurX"); return;
    }
    set blurX(value: number) {
      value = +value;
      notImplemented("public flash.filters.BevelFilter::set blurX"); return;
    }
    get blurY(): number {
      notImplemented("public flash.filters.BevelFilter::get blurY"); return;
    }
    set blurY(value: number) {
      value = +value;
      notImplemented("public flash.filters.BevelFilter::set blurY"); return;
    }
    get knockout(): boolean {
      notImplemented("public flash.filters.BevelFilter::get knockout"); return;
    }
    set knockout(value: boolean) {
      value = !!value;
      notImplemented("public flash.filters.BevelFilter::set knockout"); return;
    }
    get quality(): number /*int*/ {
      notImplemented("public flash.filters.BevelFilter::get quality"); return;
    }
    set quality(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.filters.BevelFilter::set quality"); return;
    }
    get strength(): number {
      notImplemented("public flash.filters.BevelFilter::get strength"); return;
    }
    set strength(value: number) {
      value = +value;
      notImplemented("public flash.filters.BevelFilter::set strength"); return;
    }
    get type(): string {
      notImplemented("public flash.filters.BevelFilter::get type"); return;
    }
    set type(value: string) {
      value = "" + value;
      notImplemented("public flash.filters.BevelFilter::set type"); return;
    }
  }
}
