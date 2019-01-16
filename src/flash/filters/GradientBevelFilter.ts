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
module Shumway.AVMX.AS.flash.filters {

  import Rectangle = flash.geom.Rectangle;
  import axCoerceString = Shumway.AVMX.axCoerceString;

  export class GradientBevelFilter extends flash.filters.BitmapFilter {

    static axClass: typeof GradientBevelFilter;

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null;

    public static FromUntyped(obj: any) {
      // obj.colors is an array of RGBA colors.
      // The RGB and alpha parts must be separated into colors and alphas arrays.
      var colors: number[] = [];
      var alphas: number[] = [];
      for (var i = 0; i < obj.colors.length; i++) {
        var color = obj.colors[i];
        colors.push(color >>> 8);
        alphas.push((color & 0xff) / 0xff);
      }
      // type is derived from obj.onTop and obj.innerShadow
      // obj.onTop true: type is FULL
      // obj.inner true: type is INNER
      // neither true: type is OUTER
      var type: string = flash.filters.BitmapFilterType.OUTER;
      if (!!obj.onTop) {
        type = flash.filters.BitmapFilterType.FULL;
      } else if (!!obj.inner) {
        type = flash.filters.BitmapFilterType.INNER;
      }
      // obj.angle is represented in radians, the api needs degrees
      var angle: number = obj.angle * 180 / Math.PI;
      return new this.sec.flash.filters.GradientBevelFilter(
        obj.distance,
        angle,
        // Boxing these is obviously not ideal, but everything else is just annoying.
        this.sec.createArrayUnsafe(colors),
        this.sec.createArrayUnsafe(alphas),
        this.sec.createArrayUnsafe(obj.ratios),
        obj.blurX,
        obj.blurY,
        obj.strength,
        obj.quality,
        type,
        obj.knockout
      );
    }

    constructor(distance: number = 4, angle: number = 45, colors: ASArray = null,
                alphas: ASArray = null, ratios: ASArray = null, blurX: number = 4, blurY: number = 4,
                strength: number = 1, quality: number /*int*/ = 1, type: string = "inner",
                knockout: boolean = false)
    {
      super();
      this.distance = distance;
      this.angle = angle;
      GradientArrays.sanitize(colors ? colors.value : null, alphas ? alphas.value : null,
                              ratios ? ratios.value : null);
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

    _updateFilterBounds(bounds: Rectangle) {
      if (this.type !== BitmapFilterType.INNER) {
        BitmapFilter._updateBlurBounds(bounds, this._blurX, this._blurY, this._quality);
        if (this._distance !== 0) {
          var a: number = this._angle * Math.PI / 180;
          bounds.x += Math.floor(Math.cos(a) * this._distance);
          bounds.y += Math.floor(Math.sin(a) * this._distance);
          if (bounds.left > 0) { bounds.left = 0; }
          if (bounds.top > 0) { bounds.top = 0; }
        }
      }
    }

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

    get colors(): ASArray {
      return this.sec.createArrayUnsafe(this._colors.concat());
    }
    set colors(value: ASArray) {
      if (isNullOrUndefined(value)) {
        this.sec.throwError("TypeError", Errors.NullPointerError, "colors");
      }
      this._colors = GradientArrays.sanitizeColors(value.value);
      var len: number = this._colors.length;
      this._alphas = GradientArrays.sanitizeAlphas(this._alphas, len, len);
      this._ratios = GradientArrays.sanitizeRatios(this._ratios, len, len);
    }

    get alphas(): ASArray {
      return this.sec.createArrayUnsafe(this._alphas.concat());
    }
    set alphas(value: ASArray) {
      if (isNullOrUndefined(value)) {
        this.sec.throwError("TypeError", Errors.NullPointerError, "alphas");
      }
      GradientArrays.sanitize(this._colors, value.value, this._ratios);
      this._colors = GradientArrays.colors;
      this._alphas = GradientArrays.alphas;
      this._ratios = GradientArrays.ratios;
    }

    get ratios(): ASArray {
      return this.sec.createArrayUnsafe(this._ratios.concat());
    }
    set ratios(value_: ASArray) {
      if (isNullOrUndefined(value_)) {
        this.sec.throwError("TypeError", Errors.NullPointerError, "ratios");
      }
      GradientArrays.sanitize(this._colors, this._alphas, value_.value);
      this._colors = GradientArrays.colors;
      this._alphas = GradientArrays.alphas;
      this._ratios = GradientArrays.ratios;
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
      value = axCoerceString(value);
      if (value === null) {
        this.sec.throwError("TypeError", Errors.NullPointerError, "type");
      } else {
        if (value === BitmapFilterType.INNER || value === BitmapFilterType.OUTER) {
          this._type = value;
        } else {
          this._type = BitmapFilterType.FULL;
        }
      }
    }

    clone(): BitmapFilter {
      return new this.sec.flash.filters.GradientBevelFilter(
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
      );
    }
  }
}
