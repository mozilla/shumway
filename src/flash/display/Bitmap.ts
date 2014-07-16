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
// Class: Bitmap
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import throwError = Shumway.AVM2.Runtime.throwError;
  export class Bitmap extends flash.display.DisplayObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = function (symbol: Shumway.Timeline.BitmapSymbol) {
      var self: Bitmap = this;

      self._bitmapData = null;
      self._pixelSnapping = null;
      self._smoothing = null;

      if (symbol) {
        var symbolClass = symbol.symbolClass;
        // If the symbol class inherits from Bitmap, we are already within its initializer.
        // Make sure to create a BitmapData instance here to avoid recursively calling the
        // initializer again.
        if (symbolClass.isSubtypeOf(flash.display.Bitmap)) {
          symbolClass = flash.display.BitmapData;
        }
        // TODO: I don't think BitmapData symbol objects can change, so they don't need back
        // references to this Bitmap.
        self._bitmapData = symbolClass.initializeFrom(symbol);
        self._setFillAndLineBoundsFromWidthAndHeight(symbol.width * 20|0, symbol.height * 20|0);
      }
    };
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor (bitmapData: flash.display.BitmapData = null, pixelSnapping: string = "auto", smoothing: boolean = false) {
      false && super();
      DisplayObject.instanceConstructorNoInitialize.call(this);
      if (this._symbol) {
        this._bitmapData.class.instanceConstructorNoInitialize.call(this._bitmapData);
      } else {
        this.bitmapData = bitmapData;
      }
      this._pixelSnapping = asCoerceString(pixelSnapping);
      this._smoothing = !!smoothing;
    }

    _pixelSnapping: string;
    _smoothing: boolean;
    _bitmapData: flash.display.BitmapData;

    get pixelSnapping(): string {
      return this._pixelSnapping;
    }

    set pixelSnapping(value: string) {
      if (PixelSnapping.toNumber(value) < 0) {
        throwError("ArgumentError", Errors.InvalidEnumError, "pixelSnapping");
      }
      this._pixelSnapping = asCoerceString(value);
    }

    get smoothing(): boolean {
      return this._smoothing;
    }

    set smoothing(value: boolean) {
      this._smoothing = !!value;
    }

    get bitmapData(): flash.display.BitmapData {
      return this._bitmapData;
    }

    set bitmapData(value: flash.display.BitmapData) {
      if (this._bitmapData !== value) {
        if (this._bitmapData) {
          this._bitmapData._removeBitmapReferrer(this);
        }
        if (value) {
          value._addBitmapReferrer(this);
        }
      }
      this._bitmapData = value;
      if (value) {
        this._setFillAndLineBoundsFromWidthAndHeight(value.width * 20|0, value.height * 20|0);
      }
      this._invalidateParentFillAndLineBounds();
      this._setDirtyFlags(DisplayObjectFlags.DirtyGraphics);
    }

    _getContentBounds(includeStrokes: boolean = true): Bounds {
      if (this._bitmapData) {
        return this._bitmapData._getContentBounds();
      }
      return new Bounds(0, 0, 0, 0);
    }
  }
}
