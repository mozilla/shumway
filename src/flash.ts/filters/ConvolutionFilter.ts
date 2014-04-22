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
// Class: ConvolutionFilter
module Shumway.AVM2.AS.flash.filters {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class ConvolutionFilter extends flash.filters.BitmapFilter {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["clone"];
    
    constructor (matrixX: number = 0, matrixY: number = 0, matrix: any [] = null, divisor: number = 1, bias: number = 0, preserveAlpha: boolean = true, clamp: boolean = true, color: number /*uint*/ = 0, alpha: number = 0) {
      matrixX = +matrixX; matrixY = +matrixY; matrix = matrix; divisor = +divisor; bias = +bias; preserveAlpha = !!preserveAlpha; clamp = !!clamp; color = color >>> 0; alpha = +alpha;
      false && super();
      notImplemented("Dummy Constructor: public flash.filters.ConvolutionFilter");
    }
    
    // JS -> AS Bindings
    
    clone: () => flash.filters.BitmapFilter;
    
    // AS -> JS Bindings
    
    // _matrix: any [];
    // _matrixX: number;
    // _matrixY: number;
    // _divisor: number;
    // _bias: number;
    // _preserveAlpha: boolean;
    // _clamp: boolean;
    // _color: number /*uint*/;
    // _alpha: number;
    get matrix(): any [] {
      notImplemented("public flash.filters.ConvolutionFilter::get matrix"); return;
      // return this._matrix;
    }
    set matrix(value: any []) {
      value = value;
      notImplemented("public flash.filters.ConvolutionFilter::set matrix"); return;
      // this._matrix = value;
    }
    get matrixX(): number {
      notImplemented("public flash.filters.ConvolutionFilter::get matrixX"); return;
      // return this._matrixX;
    }
    set matrixX(value: number) {
      value = +value;
      notImplemented("public flash.filters.ConvolutionFilter::set matrixX"); return;
      // this._matrixX = value;
    }
    get matrixY(): number {
      notImplemented("public flash.filters.ConvolutionFilter::get matrixY"); return;
      // return this._matrixY;
    }
    set matrixY(value: number) {
      value = +value;
      notImplemented("public flash.filters.ConvolutionFilter::set matrixY"); return;
      // this._matrixY = value;
    }
    get divisor(): number {
      notImplemented("public flash.filters.ConvolutionFilter::get divisor"); return;
      // return this._divisor;
    }
    set divisor(value: number) {
      value = +value;
      notImplemented("public flash.filters.ConvolutionFilter::set divisor"); return;
      // this._divisor = value;
    }
    get bias(): number {
      notImplemented("public flash.filters.ConvolutionFilter::get bias"); return;
      // return this._bias;
    }
    set bias(value: number) {
      value = +value;
      notImplemented("public flash.filters.ConvolutionFilter::set bias"); return;
      // this._bias = value;
    }
    get preserveAlpha(): boolean {
      notImplemented("public flash.filters.ConvolutionFilter::get preserveAlpha"); return;
      // return this._preserveAlpha;
    }
    set preserveAlpha(value: boolean) {
      value = !!value;
      notImplemented("public flash.filters.ConvolutionFilter::set preserveAlpha"); return;
      // this._preserveAlpha = value;
    }
    get clamp(): boolean {
      notImplemented("public flash.filters.ConvolutionFilter::get clamp"); return;
      // return this._clamp;
    }
    set clamp(value: boolean) {
      value = !!value;
      notImplemented("public flash.filters.ConvolutionFilter::set clamp"); return;
      // this._clamp = value;
    }
    get color(): number /*uint*/ {
      notImplemented("public flash.filters.ConvolutionFilter::get color"); return;
      // return this._color;
    }
    set color(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.filters.ConvolutionFilter::set color"); return;
      // this._color = value;
    }
    get alpha(): number {
      notImplemented("public flash.filters.ConvolutionFilter::get alpha"); return;
      // return this._alpha;
    }
    set alpha(value: number) {
      value = +value;
      notImplemented("public flash.filters.ConvolutionFilter::set alpha"); return;
      // this._alpha = value;
    }
  }
}
