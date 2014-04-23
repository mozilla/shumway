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
// Class: BlurFilter
module Shumway.AVM2.AS.flash.filters {

  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  export class BlurFilter extends flash.filters.BitmapFilter {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["clone"];

    constructor (blurX: number = 4, blurY: number = 4, quality: number /*int*/ = 1) {
      blurX = +blurX; blurY = +blurY; quality = quality | 0;
      false && super();
      notImplemented("Dummy Constructor: public flash.filters.BlurFilter");
    }

    _generateFilterBounds(): any {
      var bounds: any = { xMin: 0, yMin: 0, xMax: 0, yMax: 0 };
      this._updateBlurBounds(bounds, this.blurX, this.blurY, this.quality, true);
      return bounds;
    }

    _updateFilterBounds(bounds: any) {
      var b: any = this._generateFilterBounds();
      if (b) {
        bounds.xMin += b.xMin * 20;
        bounds.xMax += b.xMax * 20;
        bounds.yMin += b.yMin * 20;
        bounds.yMax += b.yMax * 20;
      }
    }

    _serialize(message: any) {
      message.ensureAdditionalCapacity(16);
      message.writeIntUnsafe(1);
      message.writeFloatUnsafe(this._blurX);
      message.writeFloatUnsafe(this._blurY);
      message.writeIntUnsafe(this._quality);
    }

    // JS -> AS Bindings

    clone: () => flash.filters.BitmapFilter;

    // AS -> JS Bindings

    private _blurX: number;
    private _blurY: number;
    private _quality: number /*int*/;

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

    get quality(): number /*int*/ {
      return this._quality;
    }
    set quality(value: number /*int*/) {
      this._quality = NumberUtilities.clamp(value | 0, 0, 15);
    }
  }
}
