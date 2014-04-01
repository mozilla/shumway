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
// Class: GradientGlowFilter
module Shumway.AVM2.AS.flash.filters {
  import notImplemented = Shumway.Debug.notImplemented;
  export class GradientGlowFilter extends flash.filters.BitmapFilter {
    static initializer: any = null;
    constructor (distance: number = 4, angle: number = 45, colors: any [] = null, alphas: any [] = null, ratios: any [] = null, blurX: number = 4, blurY: number = 4, strength: number = 1, quality: number /*int*/ = 1, type: string = "inner", knockout: boolean = false) {
      distance = +distance; angle = +angle; colors = colors; alphas = alphas; ratios = ratios; blurX = +blurX; blurY = +blurY; strength = +strength; quality = quality | 0; type = "" + type; knockout = !!knockout;
      false && super();
      notImplemented("Dummy Constructor: public flash.filters.GradientGlowFilter");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    clone: () => flash.filters.BitmapFilter;
    // Instance AS -> JS Bindings
    get angle(): number {
      notImplemented("public flash.filters.GradientGlowFilter::get angle"); return;
    }
    set angle(value: number) {
      value = +value;
      notImplemented("public flash.filters.GradientGlowFilter::set angle"); return;
    }
    get alphas(): any [] {
      notImplemented("public flash.filters.GradientGlowFilter::get alphas"); return;
    }
    set alphas(value: any []) {
      value = value;
      notImplemented("public flash.filters.GradientGlowFilter::set alphas"); return;
    }
    get blurX(): number {
      notImplemented("public flash.filters.GradientGlowFilter::get blurX"); return;
    }
    set blurX(value: number) {
      value = +value;
      notImplemented("public flash.filters.GradientGlowFilter::set blurX"); return;
    }
    get blurY(): number {
      notImplemented("public flash.filters.GradientGlowFilter::get blurY"); return;
    }
    set blurY(value: number) {
      value = +value;
      notImplemented("public flash.filters.GradientGlowFilter::set blurY"); return;
    }
    get colors(): any [] {
      notImplemented("public flash.filters.GradientGlowFilter::get colors"); return;
    }
    set colors(value: any []) {
      value = value;
      notImplemented("public flash.filters.GradientGlowFilter::set colors"); return;
    }
    get distance(): number {
      notImplemented("public flash.filters.GradientGlowFilter::get distance"); return;
    }
    set distance(value: number) {
      value = +value;
      notImplemented("public flash.filters.GradientGlowFilter::set distance"); return;
    }
    get knockout(): boolean {
      notImplemented("public flash.filters.GradientGlowFilter::get knockout"); return;
    }
    set knockout(value: boolean) {
      value = !!value;
      notImplemented("public flash.filters.GradientGlowFilter::set knockout"); return;
    }
    get quality(): number /*int*/ {
      notImplemented("public flash.filters.GradientGlowFilter::get quality"); return;
    }
    set quality(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.filters.GradientGlowFilter::set quality"); return;
    }
    get ratios(): any [] {
      notImplemented("public flash.filters.GradientGlowFilter::get ratios"); return;
    }
    set ratios(value: any []) {
      value = value;
      notImplemented("public flash.filters.GradientGlowFilter::set ratios"); return;
    }
    get strength(): number {
      notImplemented("public flash.filters.GradientGlowFilter::get strength"); return;
    }
    set strength(value: number) {
      value = +value;
      notImplemented("public flash.filters.GradientGlowFilter::set strength"); return;
    }
    get type(): string {
      notImplemented("public flash.filters.GradientGlowFilter::get type"); return;
    }
    set type(value: string) {
      value = "" + value;
      notImplemented("public flash.filters.GradientGlowFilter::set type"); return;
    }
  }
}
