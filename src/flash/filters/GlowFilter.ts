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
// Class: GlowFilter
module Shumway.AVMX.AS.flash.filters {

  import assert = Shumway.Debug.assert;
  import Rectangle = flash.geom.Rectangle;

  export class GlowFilter extends flash.filters.BitmapFilter {

    static axClass: typeof GlowFilter;

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null;

    public static FromUntyped(obj: any) {
      // obj.colors is an array of RGBA colors.
      // Here it contains exactly one color object, which maps to color and alpha.
      release || assert(obj.colors && obj.colors.length === 1, "colors must be Array of length 1");
      var color: number = obj.colors[0] >>> 8;
      var alpha: number = (obj.colors[0] & 0xff) / 0xff;
      return new this.sec.flash.filters.GlowFilter(
        color,
        alpha,
        obj.blurX,
        obj.blurY,
        obj.strength,
        obj.quality,
        obj.inner,
        obj.knockout
      );
    }

    constructor(color: number /*uint*/ = 16711680, alpha: number = 1, blurX: number = 6,
                blurY: number = 6, strength: number = 2, quality: number /*int*/ = 1,
                inner: boolean = false, knockout: boolean = false)
    {
      super();
      this.color = color;
      this.alpha = alpha;
      this.blurX = blurX;
      this.blurY = blurY;
      this.strength = strength;
      this.quality = quality;
      this.inner = inner;
      this.knockout = knockout;
    }

    _updateFilterBounds(bounds: Rectangle) {
      BitmapFilter._updateBlurBounds(bounds, this._blurX, this._blurY, this._quality);
    }

    // JS -> AS Bindings

    // AS -> JS Bindings

    private _color: number /*uint*/;
    private _alpha: number;
    private _blurX: number;
    private _blurY: number;
    private _inner: boolean;
    private _knockout: boolean;
    private _quality: number /*int*/;
    private _strength: number;

    get color(): number /*uint*/ {
      return this._color;
    }
    set color(value: number /*uint*/) {
      this._color = (value >>> 0) & 0xffffff;
    }

    get alpha(): number {
      return this._alpha;
    }
    set alpha(value: number) {
      this._alpha = NumberUtilities.clamp(+value, 0, 1);
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

    get inner(): boolean {
      return this._inner;
    }
    set inner(value: boolean) {
      this._inner = !!value;
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

    clone(): BitmapFilter {
      return new this.sec.flash.filters.GlowFilter(
        this._color,
        this._alpha,
        this._blurX,
        this._blurY,
        this._strength,
        this._quality,
        this._inner,
        this._knockout
      );
    }
  }
}
