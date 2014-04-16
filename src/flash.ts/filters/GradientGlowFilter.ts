/**
 * Copyright 2013 Mozilla Foundation
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
  export class GradientGlowFilter extends flash.filters.BitmapFilter {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["clone"];
    
    constructor (distance: number = 4, angle: number = 45, colors: any [] = null, alphas: any [] = null, ratios: any [] = null, blurX: number = 4, blurY: number = 4, strength: number = 1, quality: number /*int*/ = 1, type: string = "inner", knockout: boolean = false) {
      distance = +distance; angle = +angle; colors = colors; alphas = alphas; ratios = ratios; blurX = +blurX; blurY = +blurY; strength = +strength; quality = quality | 0; type = "" + type; knockout = !!knockout;
      false && super();
      notImplemented("Dummy Constructor: public flash.filters.GradientGlowFilter");
    }
    
    // JS -> AS Bindings
    
    clone: () => flash.filters.BitmapFilter;
    
    // AS -> JS Bindings
    
    // _angle: number;
    // _alphas: any [];
    // _blurX: number;
    // _blurY: number;
    // _colors: any [];
    // _distance: number;
    // _knockout: boolean;
    // _quality: number /*int*/;
    // _ratios: any [];
    // _strength: number;
    // _type: string;
    get angle(): number {
      notImplemented("public flash.filters.GradientGlowFilter::get angle"); return;
      // return this._angle;
    }
    set angle(value: number) {
      value = +value;
      notImplemented("public flash.filters.GradientGlowFilter::set angle"); return;
      // this._angle = value;
    }
    get alphas(): any [] {
      notImplemented("public flash.filters.GradientGlowFilter::get alphas"); return;
      // return this._alphas;
    }
    set alphas(value: any []) {
      value = value;
      notImplemented("public flash.filters.GradientGlowFilter::set alphas"); return;
      // this._alphas = value;
    }
    get blurX(): number {
      notImplemented("public flash.filters.GradientGlowFilter::get blurX"); return;
      // return this._blurX;
    }
    set blurX(value: number) {
      value = +value;
      notImplemented("public flash.filters.GradientGlowFilter::set blurX"); return;
      // this._blurX = value;
    }
    get blurY(): number {
      notImplemented("public flash.filters.GradientGlowFilter::get blurY"); return;
      // return this._blurY;
    }
    set blurY(value: number) {
      value = +value;
      notImplemented("public flash.filters.GradientGlowFilter::set blurY"); return;
      // this._blurY = value;
    }
    get colors(): any [] {
      notImplemented("public flash.filters.GradientGlowFilter::get colors"); return;
      // return this._colors;
    }
    set colors(value: any []) {
      value = value;
      notImplemented("public flash.filters.GradientGlowFilter::set colors"); return;
      // this._colors = value;
    }
    get distance(): number {
      notImplemented("public flash.filters.GradientGlowFilter::get distance"); return;
      // return this._distance;
    }
    set distance(value: number) {
      value = +value;
      notImplemented("public flash.filters.GradientGlowFilter::set distance"); return;
      // this._distance = value;
    }
    get knockout(): boolean {
      notImplemented("public flash.filters.GradientGlowFilter::get knockout"); return;
      // return this._knockout;
    }
    set knockout(value: boolean) {
      value = !!value;
      notImplemented("public flash.filters.GradientGlowFilter::set knockout"); return;
      // this._knockout = value;
    }
    get quality(): number /*int*/ {
      notImplemented("public flash.filters.GradientGlowFilter::get quality"); return;
      // return this._quality;
    }
    set quality(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.filters.GradientGlowFilter::set quality"); return;
      // this._quality = value;
    }
    get ratios(): any [] {
      notImplemented("public flash.filters.GradientGlowFilter::get ratios"); return;
      // return this._ratios;
    }
    set ratios(value: any []) {
      value = value;
      notImplemented("public flash.filters.GradientGlowFilter::set ratios"); return;
      // this._ratios = value;
    }
    get strength(): number {
      notImplemented("public flash.filters.GradientGlowFilter::get strength"); return;
      // return this._strength;
    }
    set strength(value: number) {
      value = +value;
      notImplemented("public flash.filters.GradientGlowFilter::set strength"); return;
      // this._strength = value;
    }
    get type(): string {
      notImplemented("public flash.filters.GradientGlowFilter::get type"); return;
      // return this._type;
    }
    set type(value: string) {
      value = "" + value;
      notImplemented("public flash.filters.GradientGlowFilter::set type"); return;
      // this._type = value;
    }
  }
}
