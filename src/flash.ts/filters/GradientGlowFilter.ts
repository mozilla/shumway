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
// Class: GradientGlowFilter
module Shumway.AVM2.AS.flash.filters {

  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  export class GradientGlowFilter extends flash.filters.BitmapFilter {

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
      GradientArrays.sanitize(colors, alphas, ratios);
      this._colors = GradientArrays.colors;
      this._alphas = GradientArrays.alphas;
      this._ratios = GradientArrays.ratios;
      this.blurX = blurX;
      this.blurY = blurY;
      this.strength = strength;
      this.quality = quality;
      this.type = type;
      this.knockout = knockout;
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
        this._colors = GradientArrays.sanitizeColors(value);
        var len: number = this._colors.length;
        this._alphas = GradientArrays.sanitizeAlphas(this._alphas, len, len);
        this._ratios = GradientArrays.sanitizeRatios(this._ratios, len, len);
      } else {
        Runtime.throwError("TypeError", Errors.NullPointerError, "colors");
      }
    }

    get alphas(): any [] {
      return this._alphas.concat();
    }
    set alphas(value: any []) {
      if (!isNullOrUndefined(value)) {
        GradientArrays.sanitize(this._colors, value, this._ratios);
        this._colors = GradientArrays.colors;
        this._alphas = GradientArrays.alphas;
        this._ratios = GradientArrays.ratios;
      } else {
        Runtime.throwError("TypeError", Errors.NullPointerError, "alphas");
      }
    }

    get ratios(): any [] {
      return this._ratios.concat();
    }
    set ratios(value: any []) {
      if (!isNullOrUndefined(value)) {
        GradientArrays.sanitize(this._colors, this._alphas, value);
        this._colors = GradientArrays.colors;
        this._alphas = GradientArrays.alphas;
        this._ratios = GradientArrays.ratios;
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
      return new GradientGlowFilter(
        this._distance,
        this._angle,
        this._colors,
        this._alphas,
        this._ratios,
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
