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

  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  export class BevelFilter extends flash.filters.BitmapFilter {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = ["clone"];

    constructor (distance: number = 4, angle: number = 45, highlightColor: number /*uint*/ = 16777215, highlightAlpha: number = 1, shadowColor: number /*uint*/ = 0, shadowAlpha: number = 1, blurX: number = 4, blurY: number = 4, strength: number = 1, quality: number /*int*/ = 1, type: string = "inner", knockout: boolean = false) {
      distance = +distance; angle = +angle; highlightColor = highlightColor >>> 0; highlightAlpha = +highlightAlpha; shadowColor = shadowColor >>> 0; shadowAlpha = +shadowAlpha; blurX = +blurX; blurY = +blurY; strength = +strength; quality = quality | 0; type = asCoerceString(type); knockout = !!knockout;
      false && super();
      notImplemented("Dummy Constructor: public flash.filters.BevelFilter");
    }

    _generateFilterBounds(): any {
      if (this.type === BitmapFilterType.INNER) {
        return null;
      } else {
        var bounds: any = { xMin: 0, yMin: 0, xMax: 0, yMax: 0 };
        this._updateBlurBounds(bounds, this.blurX, this.blurY, this.quality);
        if (this._distance !== 0) {
          var a: number = this._angle * Math.PI / 180;
          var dx: number = Math.cos(a) * this._distance;
          var dy: number = Math.sin(a) * this._distance;
          bounds.xMin -= (dx >= 0 ? 0 : Math.floor(dx));
          bounds.xMax += Math.ceil(Math.abs(dx));
          bounds.yMin -= (dy >= 0 ? 0 : Math.floor(dy));
          bounds.yMax += Math.ceil(Math.abs(dy));
        }
        return bounds;
      }
    }

    // JS -> AS Bindings

    clone: () => flash.filters.BitmapFilter;

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
      this._highlightColor = value >>> 0;
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
      this._shadowColor = value >>> 0;
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
      value = "" + value;
      if (isString(value)) {
        if (value === BitmapFilterType.INNER || value === BitmapFilterType.OUTER) {
          this._type = value;
        } else {
          this._type = BitmapFilterType.FULL;
        }
      } else {
        Runtime.throwError("TypeError", Errors.NullPointerError, "type");
      }
    }
  }
}
