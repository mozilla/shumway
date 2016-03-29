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
// Class: DisplacementMapFilter
module Shumway.AVMX.AS.flash.filters {

  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;

  export class DisplacementMapFilter extends flash.filters.BitmapFilter {

    static axClass: typeof DisplacementMapFilter;

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null;

    public static FromUntyped(obj: any) {
      return new this.sec.flash.filters.DisplacementMapFilter(
        obj.mapBitmap,
        obj.mapPoint,
        obj.componentX,
        obj.componentY,
        obj.scaleX,
        obj.scaleY,
        obj.mode,
        obj.color,
        obj.alpha
      );
    }

    constructor (mapBitmap: flash.display.BitmapData = null, mapPoint: flash.geom.Point = null, componentX: number /*uint*/ = 0, componentY: number /*uint*/ = 0, scaleX: number = 0, scaleY: number = 0, mode: string = "wrap", color: number /*uint*/ = 0, alpha: number = 0) {
      super();
      this.mapBitmap = mapBitmap;
      this.mapPoint = mapPoint;
      this.componentX = componentX;
      this.componentY = componentY;
      this.scaleX = scaleX;
      this.scaleY = scaleY;
      this.mode = mode;
      this.color = color;
      this.alpha = alpha;
    }

    // JS -> AS Bindings

    // AS -> JS Bindings

    private _mapBitmap: flash.display.BitmapData;
    private _mapPoint: flash.geom.Point;
    private _componentX: number /*uint*/;
    private _componentY: number /*uint*/;
    private _scaleX: number;
    private _scaleY: number;
    private _mode: string;
    private _color: number /*uint*/;
    private _alpha: number;

    get mapBitmap(): flash.display.BitmapData {
      release || somewhatImplemented("public flash.filters.DisplacementMapFilter::get mapBitmap");
      return this._mapBitmap;
    }
    set mapBitmap(value: flash.display.BitmapData) {
      release || somewhatImplemented("public flash.filters.DisplacementMapFilter::set mapBitmap");
      this._mapBitmap = value;
    }

    get mapPoint(): flash.geom.Point {
      release || somewhatImplemented("public flash.filters.DisplacementMapFilter::get mapPoint");
      return this._mapPoint;
    }
    set mapPoint(value: flash.geom.Point) {
      release || somewhatImplemented("public flash.filters.DisplacementMapFilter::set mapPoint");
      this._mapPoint = value;
    }

    get componentX(): number /*uint*/ {
      return this._componentX;
    }
    set componentX(value: number /*uint*/) {
      release || somewhatImplemented("public flash.filters.DisplacementMapFilter::set componentX");
      this._componentX = value >>> 0;
    }

    get componentY(): number /*uint*/ {
      return this._componentY;
    }
    set componentY(value: number /*uint*/) {
      release || somewhatImplemented("public flash.filters.DisplacementMapFilter::set componentY");
      this._componentY = value >>> 0;
    }

    get scaleX(): number {
      return this._scaleX;
    }
    set scaleX(value: number) {
      release || somewhatImplemented("public flash.filters.DisplacementMapFilter::set scaleX");
      this._scaleX = +value;
    }

    get scaleY(): number {
      return this._scaleY;
    }
    set scaleY(value: number) {
      release || somewhatImplemented("public flash.filters.DisplacementMapFilter::set scaleY");
      this._scaleY = +value;
    }

    get mode(): string {
      return this._mode;
    }
    set mode(value: string) {
      release || somewhatImplemented("public flash.filters.DisplacementMapFilter::set mode");
      this._mode = axCoerceString(value);
    }

    get color(): number /*uint*/ {
      return this._color;
    }
    set color(value: number /*uint*/) {
      release || somewhatImplemented("public flash.filters.DisplacementMapFilter::set color");
      this._color = (value >>> 0) & 0xffffff;
    }

    get alpha(): number {
      return this._alpha;
    }
    set alpha(value: number) {
      release || somewhatImplemented("public flash.filters.DisplacementMapFilter::set alpha");
      this._alpha = +value;
    }

    clone(): BitmapFilter {
      return new this.sec.flash.filters.DisplacementMapFilter(
        this._mapBitmap,
        this._mapPoint,
        this._componentX,
        this._componentY,
        this._scaleX,
        this._scaleY,
        this._mode,
        this._color,
        this._alpha
      );
    }
  }
}
