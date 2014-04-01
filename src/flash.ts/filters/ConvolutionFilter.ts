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
// Class: ConvolutionFilter
module Shumway.AVM2.AS.flash.filters {
  import notImplemented = Shumway.Debug.notImplemented;
  export class ConvolutionFilter extends flash.filters.BitmapFilter {
    static initializer: any = null;
    constructor (matrixX: number = 0, matrixY: number = 0, matrix: any [] = null, divisor: number = 1, bias: number = 0, preserveAlpha: boolean = true, clamp: boolean = true, color: number /*uint*/ = 0, alpha: number = 0) {
      matrixX = +matrixX; matrixY = +matrixY; matrix = matrix; divisor = +divisor; bias = +bias; preserveAlpha = !!preserveAlpha; clamp = !!clamp; color = color >>> 0; alpha = +alpha;
      false && super();
      notImplemented("Dummy Constructor: public flash.filters.ConvolutionFilter");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    clone: () => flash.filters.BitmapFilter;
    // Instance AS -> JS Bindings
    get matrix(): any [] {
      notImplemented("public flash.filters.ConvolutionFilter::get matrix"); return;
    }
    set matrix(value: any []) {
      value = value;
      notImplemented("public flash.filters.ConvolutionFilter::set matrix"); return;
    }
    get matrixX(): number {
      notImplemented("public flash.filters.ConvolutionFilter::get matrixX"); return;
    }
    set matrixX(value: number) {
      value = +value;
      notImplemented("public flash.filters.ConvolutionFilter::set matrixX"); return;
    }
    get matrixY(): number {
      notImplemented("public flash.filters.ConvolutionFilter::get matrixY"); return;
    }
    set matrixY(value: number) {
      value = +value;
      notImplemented("public flash.filters.ConvolutionFilter::set matrixY"); return;
    }
    get divisor(): number {
      notImplemented("public flash.filters.ConvolutionFilter::get divisor"); return;
    }
    set divisor(value: number) {
      value = +value;
      notImplemented("public flash.filters.ConvolutionFilter::set divisor"); return;
    }
    get bias(): number {
      notImplemented("public flash.filters.ConvolutionFilter::get bias"); return;
    }
    set bias(value: number) {
      value = +value;
      notImplemented("public flash.filters.ConvolutionFilter::set bias"); return;
    }
    get preserveAlpha(): boolean {
      notImplemented("public flash.filters.ConvolutionFilter::get preserveAlpha"); return;
    }
    set preserveAlpha(value: boolean) {
      value = !!value;
      notImplemented("public flash.filters.ConvolutionFilter::set preserveAlpha"); return;
    }
    get clamp(): boolean {
      notImplemented("public flash.filters.ConvolutionFilter::get clamp"); return;
    }
    set clamp(value: boolean) {
      value = !!value;
      notImplemented("public flash.filters.ConvolutionFilter::set clamp"); return;
    }
    get color(): number /*uint*/ {
      notImplemented("public flash.filters.ConvolutionFilter::get color"); return;
    }
    set color(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.filters.ConvolutionFilter::set color"); return;
    }
    get alpha(): number {
      notImplemented("public flash.filters.ConvolutionFilter::get alpha"); return;
    }
    set alpha(value: number) {
      value = +value;
      notImplemented("public flash.filters.ConvolutionFilter::set alpha"); return;
    }
  }
}
