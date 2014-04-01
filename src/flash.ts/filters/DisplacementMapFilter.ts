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
// Class: DisplacementMapFilter
module Shumway.AVM2.AS.flash.filters {
  import notImplemented = Shumway.Debug.notImplemented;
  export class DisplacementMapFilter extends flash.filters.BitmapFilter {
    static initializer: any = null;
    constructor (mapBitmap: flash.display.BitmapData = null, mapPoint: flash.geom.Point = null, componentX: number /*uint*/ = 0, componentY: number /*uint*/ = 0, scaleX: number = 0, scaleY: number = 0, mode: string = "wrap", color: number /*uint*/ = 0, alpha: number = 0) {
      mapBitmap = mapBitmap; mapPoint = mapPoint; componentX = componentX >>> 0; componentY = componentY >>> 0; scaleX = +scaleX; scaleY = +scaleY; mode = "" + mode; color = color >>> 0; alpha = +alpha;
      false && super();
      notImplemented("Dummy Constructor: public flash.filters.DisplacementMapFilter");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    clone: () => flash.filters.BitmapFilter;
    // Instance AS -> JS Bindings
    get mapBitmap(): flash.display.BitmapData {
      notImplemented("public flash.filters.DisplacementMapFilter::get mapBitmap"); return;
    }
    set mapBitmap(value: flash.display.BitmapData) {
      value = value;
      notImplemented("public flash.filters.DisplacementMapFilter::set mapBitmap"); return;
    }
    get mapPoint(): flash.geom.Point {
      notImplemented("public flash.filters.DisplacementMapFilter::get mapPoint"); return;
    }
    set mapPoint(value: flash.geom.Point) {
      value = value;
      notImplemented("public flash.filters.DisplacementMapFilter::set mapPoint"); return;
    }
    get componentX(): number /*uint*/ {
      notImplemented("public flash.filters.DisplacementMapFilter::get componentX"); return;
    }
    set componentX(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.filters.DisplacementMapFilter::set componentX"); return;
    }
    get componentY(): number /*uint*/ {
      notImplemented("public flash.filters.DisplacementMapFilter::get componentY"); return;
    }
    set componentY(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.filters.DisplacementMapFilter::set componentY"); return;
    }
    get scaleX(): number {
      notImplemented("public flash.filters.DisplacementMapFilter::get scaleX"); return;
    }
    set scaleX(value: number) {
      value = +value;
      notImplemented("public flash.filters.DisplacementMapFilter::set scaleX"); return;
    }
    get scaleY(): number {
      notImplemented("public flash.filters.DisplacementMapFilter::get scaleY"); return;
    }
    set scaleY(value: number) {
      value = +value;
      notImplemented("public flash.filters.DisplacementMapFilter::set scaleY"); return;
    }
    get mode(): string {
      notImplemented("public flash.filters.DisplacementMapFilter::get mode"); return;
    }
    set mode(value: string) {
      value = "" + value;
      notImplemented("public flash.filters.DisplacementMapFilter::set mode"); return;
    }
    get color(): number /*uint*/ {
      notImplemented("public flash.filters.DisplacementMapFilter::get color"); return;
    }
    set color(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.filters.DisplacementMapFilter::set color"); return;
    }
    get alpha(): number {
      notImplemented("public flash.filters.DisplacementMapFilter::get alpha"); return;
    }
    set alpha(value: number) {
      value = +value;
      notImplemented("public flash.filters.DisplacementMapFilter::set alpha"); return;
    }
  }
}
