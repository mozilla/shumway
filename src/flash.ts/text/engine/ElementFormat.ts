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
// Class: ElementFormat
module Shumway.AVM2.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  export class ElementFormat extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["clone"];
    
    constructor (fontDescription: flash.text.engine.FontDescription = null, fontSize: number = 12, color: number /*uint*/ = 0, alpha: number = 1, textRotation: string = "auto", dominantBaseline: string = "roman", alignmentBaseline: string = "useDominantBaseline", baselineShift: number = 0, kerning: string = "on", trackingRight: number = 0, trackingLeft: number = 0, locale: string = "en", breakOpportunity: string = "auto", digitCase: string = "default", digitWidth: string = "default", ligatureLevel: string = "common", typographicCase: string = "default") {
      fontDescription = fontDescription; fontSize = +fontSize; color = color >>> 0; alpha = +alpha; textRotation = "" + textRotation; dominantBaseline = "" + dominantBaseline; alignmentBaseline = "" + alignmentBaseline; baselineShift = +baselineShift; kerning = "" + kerning; trackingRight = +trackingRight; trackingLeft = +trackingLeft; locale = "" + locale; breakOpportunity = "" + breakOpportunity; digitCase = "" + digitCase; digitWidth = "" + digitWidth; ligatureLevel = "" + ligatureLevel; typographicCase = "" + typographicCase;
      false && super();
      notImplemented("Dummy Constructor: public flash.text.engine.ElementFormat");
    }
    
    // JS -> AS Bindings
    
    clone: () => flash.text.engine.ElementFormat;
    
    // AS -> JS Bindings
    
    // _alignmentBaseline: string;
    // _alpha: number;
    // _baselineShift: number;
    // _breakOpportunity: string;
    // _color: number /*uint*/;
    // _dominantBaseline: string;
    // _fontDescription: flash.text.engine.FontDescription;
    // _digitCase: string;
    // _digitWidth: string;
    // _ligatureLevel: string;
    // _fontSize: number;
    // _kerning: string;
    // _locale: string;
    // _textRotation: string;
    // _trackingRight: number;
    // _trackingLeft: number;
    // _typographicCase: string;
    // _locked: boolean;
    get alignmentBaseline(): string {
      notImplemented("public flash.text.engine.ElementFormat::get alignmentBaseline"); return;
      // return this._alignmentBaseline;
    }
    set alignmentBaseline(alignmentBaseline: string) {
      alignmentBaseline = "" + alignmentBaseline;
      notImplemented("public flash.text.engine.ElementFormat::set alignmentBaseline"); return;
      // this._alignmentBaseline = alignmentBaseline;
    }
    get alpha(): number {
      notImplemented("public flash.text.engine.ElementFormat::get alpha"); return;
      // return this._alpha;
    }
    set alpha(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.ElementFormat::set alpha"); return;
      // this._alpha = value;
    }
    get baselineShift(): number {
      notImplemented("public flash.text.engine.ElementFormat::get baselineShift"); return;
      // return this._baselineShift;
    }
    set baselineShift(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.ElementFormat::set baselineShift"); return;
      // this._baselineShift = value;
    }
    get breakOpportunity(): string {
      notImplemented("public flash.text.engine.ElementFormat::get breakOpportunity"); return;
      // return this._breakOpportunity;
    }
    set breakOpportunity(opportunityType: string) {
      opportunityType = "" + opportunityType;
      notImplemented("public flash.text.engine.ElementFormat::set breakOpportunity"); return;
      // this._breakOpportunity = opportunityType;
    }
    get color(): number /*uint*/ {
      notImplemented("public flash.text.engine.ElementFormat::get color"); return;
      // return this._color;
    }
    set color(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.text.engine.ElementFormat::set color"); return;
      // this._color = value;
    }
    get dominantBaseline(): string {
      notImplemented("public flash.text.engine.ElementFormat::get dominantBaseline"); return;
      // return this._dominantBaseline;
    }
    set dominantBaseline(dominantBaseline: string) {
      dominantBaseline = "" + dominantBaseline;
      notImplemented("public flash.text.engine.ElementFormat::set dominantBaseline"); return;
      // this._dominantBaseline = dominantBaseline;
    }
    get fontDescription(): flash.text.engine.FontDescription {
      notImplemented("public flash.text.engine.ElementFormat::get fontDescription"); return;
      // return this._fontDescription;
    }
    set fontDescription(value: flash.text.engine.FontDescription) {
      value = value;
      notImplemented("public flash.text.engine.ElementFormat::set fontDescription"); return;
      // this._fontDescription = value;
    }
    get digitCase(): string {
      notImplemented("public flash.text.engine.ElementFormat::get digitCase"); return;
      // return this._digitCase;
    }
    set digitCase(digitCaseType: string) {
      digitCaseType = "" + digitCaseType;
      notImplemented("public flash.text.engine.ElementFormat::set digitCase"); return;
      // this._digitCase = digitCaseType;
    }
    get digitWidth(): string {
      notImplemented("public flash.text.engine.ElementFormat::get digitWidth"); return;
      // return this._digitWidth;
    }
    set digitWidth(digitWidthType: string) {
      digitWidthType = "" + digitWidthType;
      notImplemented("public flash.text.engine.ElementFormat::set digitWidth"); return;
      // this._digitWidth = digitWidthType;
    }
    get ligatureLevel(): string {
      notImplemented("public flash.text.engine.ElementFormat::get ligatureLevel"); return;
      // return this._ligatureLevel;
    }
    set ligatureLevel(ligatureLevelType: string) {
      ligatureLevelType = "" + ligatureLevelType;
      notImplemented("public flash.text.engine.ElementFormat::set ligatureLevel"); return;
      // this._ligatureLevel = ligatureLevelType;
    }
    get fontSize(): number {
      notImplemented("public flash.text.engine.ElementFormat::get fontSize"); return;
      // return this._fontSize;
    }
    set fontSize(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.ElementFormat::set fontSize"); return;
      // this._fontSize = value;
    }
    get kerning(): string {
      notImplemented("public flash.text.engine.ElementFormat::get kerning"); return;
      // return this._kerning;
    }
    set kerning(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.ElementFormat::set kerning"); return;
      // this._kerning = value;
    }
    get locale(): string {
      notImplemented("public flash.text.engine.ElementFormat::get locale"); return;
      // return this._locale;
    }
    set locale(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.ElementFormat::set locale"); return;
      // this._locale = value;
    }
    get textRotation(): string {
      notImplemented("public flash.text.engine.ElementFormat::get textRotation"); return;
      // return this._textRotation;
    }
    set textRotation(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.ElementFormat::set textRotation"); return;
      // this._textRotation = value;
    }
    get trackingRight(): number {
      notImplemented("public flash.text.engine.ElementFormat::get trackingRight"); return;
      // return this._trackingRight;
    }
    set trackingRight(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.ElementFormat::set trackingRight"); return;
      // this._trackingRight = value;
    }
    get trackingLeft(): number {
      notImplemented("public flash.text.engine.ElementFormat::get trackingLeft"); return;
      // return this._trackingLeft;
    }
    set trackingLeft(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.ElementFormat::set trackingLeft"); return;
      // this._trackingLeft = value;
    }
    get typographicCase(): string {
      notImplemented("public flash.text.engine.ElementFormat::get typographicCase"); return;
      // return this._typographicCase;
    }
    set typographicCase(typographicCaseType: string) {
      typographicCaseType = "" + typographicCaseType;
      notImplemented("public flash.text.engine.ElementFormat::set typographicCase"); return;
      // this._typographicCase = typographicCaseType;
    }
    get locked(): boolean {
      notImplemented("public flash.text.engine.ElementFormat::get locked"); return;
      // return this._locked;
    }
    set locked(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.engine.ElementFormat::set locked"); return;
      // this._locked = value;
    }
    getFontMetrics(): flash.text.engine.FontMetrics {
      notImplemented("public flash.text.engine.ElementFormat::getFontMetrics"); return;
    }
  }
}
