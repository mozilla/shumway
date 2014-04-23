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

    private expandArray(a: number [], newLen: number /*uint*/) {
      var i: number = a.length;
      while (i < newLen) {
        a[i++] = 0;
      }
    }

    // JS -> AS Bindings

    clone: () => flash.filters.BitmapFilter;

    // AS -> JS Bindings

    private _matrix: number [];
    private _matrixX: number;
    private _matrixY: number;
    private _divisor: number;
    private _bias: number;
    private _preserveAlpha: boolean;
    private _clamp: boolean;
    private _color: number /*uint*/;
    private _alpha: number;

    get matrix(): any [] {
      return this._matrix;
    }
    set matrix(value: any []) {
      if (!isNullOrUndefined(value)) {
        var actualLen = this._matrixX * this._matrixY;
        var minLen = Math.min(value.length, actualLen);
        var matrix = Array(minLen);
        for (var i = 0; i < minLen; i++) {
          matrix[i] = toNumber(value[i]);
        }
        this.expandArray(matrix, actualLen);
        this._matrix = matrix;
      } else {
        Runtime.throwError("TypeError", Errors.NullPointerError, "matrix");
      }
    }

    get matrixX(): number {
      return this._matrixX;
    }
    set matrixX(value: number) {
      var mx: number = NumberUtilities.clamp(+value, 0, 15);
      if (this._matrixX !== mx) {
        this._matrixX = mx;
        this.expandArray(this._matrix, mx * this._matrixY);
      }
    }

    get matrixY(): number {
      return this._matrixY;
    }
    set matrixY(value: number) {
      var my: number = NumberUtilities.clamp(+value, 0, 15);
      if (this._matrixY !== my) {
        this._matrixY = my;
        this.expandArray(this._matrix, my * this._matrixX);
      }
    }
    get divisor(): number {
      return this._divisor;
    }
    set divisor(value: number) {
      Debug.somewhatImplemented("public flash.filters.ConvolutionFilter::set divisor");
      this._divisor = +value;
    }

    get bias(): number {
      return this._bias;
    }
    set bias(value: number) {
      Debug.somewhatImplemented("public flash.filters.ConvolutionFilter::set bias");
      this._bias = +value;
    }

    get preserveAlpha(): boolean {
      return this._preserveAlpha;
    }
    set preserveAlpha(value: boolean) {
      Debug.somewhatImplemented("public flash.filters.ConvolutionFilter::set preserveAlpha");
      this._preserveAlpha = !!value;
    }

    get clamp(): boolean {
      return this._clamp;
    }
    set clamp(value: boolean) {
      Debug.somewhatImplemented("public flash.filters.ConvolutionFilter::set clamp");
      this._clamp = !!value;
    }

    get color(): number /*uint*/ {
      return this._color;
    }
    set color(value: number /*uint*/) {
      Debug.somewhatImplemented("public flash.filters.ConvolutionFilter::set color");
      this._color = value >>> 0;
    }

    get alpha(): number {
      return this._alpha;
    }
    set alpha(value: number) {
      Debug.somewhatImplemented("public flash.filters.ConvolutionFilter::set alpha");
      this._alpha = NumberUtilities.clamp(+value, 0, 1);
    }
  }
}
