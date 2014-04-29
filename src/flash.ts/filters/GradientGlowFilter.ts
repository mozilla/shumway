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

  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
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
      somewhatImplemented("public flash.filters.GradientGlowFilter ctor");
      this.distance = +distance;
      this.angle = +angle;
      this.colors = colors;
      this.alphas = alphas;
      this.ratios = ratios;
      this.blurX = +blurX;
      this.blurY = +blurY;
      this.strength = +strength;
      this.quality = quality | 0;
      this.type = asCoerceString(type);
      this.knockout = !!knockout;
      super();
    }

    // JS -> AS Bindings

    // AS -> JS Bindings

    private _angle: number;
    private _alphas: any [];
    private _blurX: number;
    private _blurY: number;
    private _colors: any [];
    private _distance: number;
    private _knockout: boolean;
    private _quality: number /*int*/;
    private _ratios: any [];
    private _strength: number;
    private _type: string;

    get distance(): number {
      return this._distance;
    }
    set distance(value: number) {
      somewhatImplemented("public flash.filters.GradientGlowFilter::set distance");
      this._distance = +value;
    }

    get angle(): number {
      return this._angle;
    }
    set angle(value: number) {
      somewhatImplemented("public flash.filters.GradientGlowFilter::set angle");
      this._angle = +value;
    }

    get colors(): any [] {
      return this._colors;
    }
    set colors(value: any []) {
      somewhatImplemented("public flash.filters.GradientGlowFilter::set colors");
      this._colors = value;
    }

    get alphas(): any [] {
      return this._alphas;
    }
    set alphas(value: any []) {
      somewhatImplemented("public flash.filters.GradientGlowFilter::set alphas");
      this._alphas = value;
    }

    get ratios(): any [] {
      return this._ratios;
    }
    set ratios(value: any []) {
      somewhatImplemented("public flash.filters.GradientGlowFilter::set ratios");
      this._ratios = value;
    }

    get blurX(): number {
      return this._blurX;
    }
    set blurX(value: number) {
      somewhatImplemented("public flash.filters.GradientGlowFilter::set blurX");
      this._blurX = +value;
    }

    get blurY(): number {
      return this._blurY;
    }
    set blurY(value: number) {
      somewhatImplemented("public flash.filters.GradientGlowFilter::set blurY");
      this._blurY = +value;
    }

    get strength(): number {
      return this._strength;
    }
    set strength(value: number) {
      somewhatImplemented("public flash.filters.GradientGlowFilter::set strength");
      this._strength = +value;
    }

    get quality(): number /*int*/ {
      return this._quality;
    }
    set quality(value: number /*int*/) {
      somewhatImplemented("public flash.filters.GradientGlowFilter::set quality");
      this._quality = value | 0;
    }

    get type(): string {
      return this._type;
    }
    set type(value: string) {
      somewhatImplemented("public flash.filters.GradientGlowFilter::set type");
      this._type = asCoerceString(value);
    }

    get knockout(): boolean {
      return this._knockout;
    }
    set knockout(value: boolean) {
      somewhatImplemented("public flash.filters.GradientGlowFilter::set knockout");
      this._knockout = !!value;
    }

    clone(): BitmapFilter {
      return super.clone() || new GradientGlowFilter(
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
