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
// Class: BevelFilter
module Shumway.AVM2.AS.flash.filters {

  import Rectangle = flash.geom.Rectangle;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  export class BevelFilter extends flash.filters.BitmapFilter {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null;

    public static fromAny(obj: any) {
      // obj.highlightColor is an object with separate color components
      var highlightColor: number = ColorUtilities.componentsToRgb(obj.highlightColor);
      var highlightAlpha: number = (obj.highlightColor.alpha & 0xff) / 255;
      // obj.colors is an array of objects with separate color components
      // here it contains exactly one color object, which maps to shadowColor and shadowAlpha
      assert(obj.colors && obj.colors.length === 1, "colors must be Array of length 1");
      var shadowColor: number = ColorUtilities.componentsToRgb(obj.colors[0]);
      var shadowAlpha: number = (obj.colors[0].alpha & 0xff) / 255;
      // type is derived from obj.onTop and obj.innerShadow
      // obj.onTop true: type is FULL
      // obj.innerShadow true: type is INNER
      // neither true: type is OUTER
      var type: string = flash.filters.BitmapFilterType.OUTER;
      if (!!obj.onTop) {
        type = flash.filters.BitmapFilterType.FULL;
      } else if (!!obj.innerShadow) {
        type = flash.filters.BitmapFilterType.INNER;
      }
      // obj.angle is represented in radians, the api needs degrees
      var angle: number = obj.angle * 180 / Math.PI;
      return new BevelFilter(
        obj.distance,
        angle,
        highlightColor,
        highlightAlpha,
        shadowColor,
        shadowAlpha,
        obj.blurX,
        obj.blurY,
        obj.strength,
        obj.quality,
        type,
        obj.knockout
      );
    }

    constructor (distance: number = 4, angle: number = 45, highlightColor: number /*uint*/ = 16777215, highlightAlpha: number = 1, shadowColor: number /*uint*/ = 0, shadowAlpha: number = 1, blurX: number = 4, blurY: number = 4, strength: number = 1, quality: number /*int*/ = 1, type: string = "inner", knockout: boolean = false) {
      false && super();
      this.distance = distance;
      this.angle = angle;
      this.highlightColor = highlightColor;
      this.highlightAlpha = highlightAlpha;
      this.shadowColor = shadowColor;
      this.shadowAlpha = shadowAlpha;
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

    // JS -> AS Bindings

    // AS -> JS Bindings

    private _distance: number;
    private _angle: number;
    private _highlightColor: number /*uint*/;
    private _highlightAlpha: number;
    private _shadowColor: number /*uint*/;
    private _shadowAlpha: number;
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

    get highlightColor(): number /*uint*/ {
      return this._highlightColor;
    }
    set highlightColor(value: number /*uint*/) {
      this._highlightColor = (value >>> 0) & 0xffffff;
    }

    get highlightAlpha(): number {
      return this._highlightAlpha;
    }
    set highlightAlpha(value: number) {
      this._highlightAlpha = NumberUtilities.clamp(+value, 0, 1);
    }

    get shadowColor(): number /*uint*/ {
      return this._shadowColor;
    }
    set shadowColor(value: number /*uint*/) {
      this._shadowColor = (value >>> 0) & 0xffffff;
    }

    get shadowAlpha(): number {
      return this._shadowAlpha;
    }
    set shadowAlpha(value: number) {
      this._shadowAlpha = NumberUtilities.clamp(+value, 0, 1);
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
      return new BevelFilter(
        this._distance,
        this._angle,
        this._highlightColor,
        this._highlightAlpha,
        this._shadowColor,
        this._shadowAlpha,
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
