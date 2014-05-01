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
// Class: GradientBevelFilter
module Shumway.AVM2.AS.flash.filters {

  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  export class GradientBevelFilter extends flash.filters.BitmapFilter {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null;

    constructor (distance: number = 4, angle: number = 45, colors: any [] = null, alphas: any [] = null, ratios: any [] = null, blurX: number = 4, blurY: number = 4, strength: number = 1, quality: number /*int*/ = 1, type: string = "inner", knockout: boolean = false) {
      false && super();
      this.distance = distance;
      this.angle = angle;
      this._applyArrays(colors, alphas, ratios);
      this.blurX = blurX;
      this.blurY = blurY;
      this.strength = strength;
      this.quality = quality;
      this.type = type;
      this.knockout = knockout;
    }

    // colors null or empty - all empty
    // ratios empty - all empty
    // ratios null and alphas null - length: colors, alphas set to 0, ratios set to 0
    // ratios null and alphas != null - length: colors, alphas filled with 1, ratios set to 0
    // ratios not empty and alphas null - length: min(colors,ratios), alphas set to 0
    // ratios not empty and alphas != null - length: min(colors,ratios), alphas filled with 1
    private _applyArrays(colors: any [], alphas: any [], ratios: any []) {
      var len;
      if (isNullOrUndefined(colors) || colors.length == 0) {
        this._colors = [];
        this._alphas = [];
        this._ratios = [];
      } else {
        if (isNullOrUndefined(ratios)) {
          len = colors.length;
          this._colors = this._sanitizeColors(colors);
          this._ratios = this._expandArray([], len, 0);
          if (isNullOrUndefined(alphas)) {
            this._alphas = this._expandArray([], len, 0);
          } else {
            this._alphas = this._sanitizeAlphas(this._expandArray(alphas.slice(0, len), len, 1));
          }
        } else {
          if (ratios.length == 0) {
            this._colors = [];
            this._alphas = [];
            this._ratios = [];
          } else {
            len = Math.min(colors.length, ratios.length);
            if (isNullOrUndefined(alphas)) {
              this._colors = this._sanitizeColors(colors.slice(0, len));
              this._ratios = this._sanitizeRatios(ratios.slice(0, len));
              this._alphas = this._expandArray([], len, 0);
            } else {
              this._colors = this._sanitizeColors(colors.slice(0, len));
              this._ratios = this._sanitizeRatios(ratios.slice(0, len));
              this._alphas = this._sanitizeAlphas(this._expandArray(alphas.slice(0, len), len, 1));
            }
          }
        }
      }
    }

    private _sanitizeColors(colors: any []): number [] {
      var arr: number [] = [];
      for (var i = 0, n = Math.min(colors.length, 16); i < n; i++) {
        arr[i] = (colors[i] >>> 0) & 0xffffff;
      }
      return arr;
    }

    private _sanitizeAlphas(alphas: any []): number [] {
      var arr: number [] = [];
      for (var i = 0, n = Math.min(alphas.length, 16); i < n; i++) {
        arr[i] = NumberUtilities.clamp(+alphas[i], 0, 1);
      }
      return arr;
    }

    private _sanitizeRatios(ratios: any []): number [] {
      var arr: number [] = [];
      for (var i = 0, n = Math.min(ratios.length, 16); i < n; i++) {
        arr[i] = NumberUtilities.clamp(+ratios[i], 0, 255);
      }
      return arr;
    }

    private _expandArray(a: number [], newLen: number /*uint*/, value: number = 0): number [] {
      if (a) {
        var i: number = a.length;
        while (i < newLen) {
          a[i++] = value;
        }
      }
      return a;
    }

    // JS -> AS Bindings

    // AS -> JS Bindings

    private _distance: number;
    private _angle: number;
    private _colors: any [];
    private _alphas: any [];
    private _ratios: any [];
    private _blurX: number;
    private _blurY: number;
    private _knockout: boolean;
    private _quality: number /*int*/;
    private _strength: number;
    private _type: string;

    get distance(): number {
      return this._distance;
    }
    set distance(value: number) {
      this._distance = +value;
    }

    get angle(): number {
      return this._angle;
    }
    set angle(value: number) {
      this._angle = +value % 360;
    }

    get colors(): any [] {
      return this._colors.concat();
    }
    set colors(value: any []) {
      if (!isNullOrUndefined(value)) {
        this._colors = this._sanitizeColors(value);
        var len: number = this._colors.length;
        this._alphas = this._expandArray(this._alphas.slice(0, len), len, 0);
        this._ratios = this._expandArray(this._ratios.slice(0, len), len, 0);
      } else {
        Runtime.throwError("TypeError", Errors.NullPointerError, "colors");
      }
    }

    get alphas(): any [] {
      return this._alphas.concat();
    }
    set alphas(value: any []) {
      if (!isNullOrUndefined(value)) {
        this._applyArrays(this._colors, value, this._ratios);
      } else {
        Runtime.throwError("TypeError", Errors.NullPointerError, "alphas");
      }
    }

    get ratios(): any [] {
      return this._ratios.concat();
    }
    set ratios(value: any []) {
      if (!isNullOrUndefined(value)) {
        this._applyArrays(this._colors, this._alphas, value);
      } else {
        Runtime.throwError("TypeError", Errors.NullPointerError, "ratios");
      }
    }

    get blurX(): number {
      return this._blurX;
    }
    set blurX(value: number) {
      this._blurX = NumberUtilities.clamp(+value, 0, 255);
    }

    get blurY(): number {
      return this._blurY;
    }
    set blurY(value: number) {
      this._blurY = NumberUtilities.clamp(+value, 0, 255);
    }

    get knockout(): boolean {
      return this._knockout;
    }
    set knockout(value: boolean) {
      this._knockout = !!value;
    }

    get quality(): number /*int*/ {
      return this._quality;
    }
    set quality(value: number /*int*/) {
      this._quality = NumberUtilities.clamp(value | 0, 0, 15);
    }

    get strength(): number {
      return this._strength;
    }
    set strength(value: number) {
      this._strength = NumberUtilities.clamp(+value, 0, 255);
    }

    get type(): string {
      return this._type;
    }
    set type(value: string) {
      value = asCoerceString(value);
      if (value === null) {
        Runtime.throwError("TypeError", Errors.NullPointerError, "type");
      } else {
        if (value === BitmapFilterType.INNER || value === BitmapFilterType.OUTER) {
          this._type = value;
        } else {
          this._type = BitmapFilterType.FULL;
        }
      }
    }

    clone(): BitmapFilter {
      return new GradientBevelFilter(
        this._distance,
        this._angle,
        this.colors,
        this.alphas,
        this.ratios,
        this._blurX,
        this._blurY,
        this._strength,
        this._quality,
        this._type,
        this._knockout
      )
    }
  }
}
