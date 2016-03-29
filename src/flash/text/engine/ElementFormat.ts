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
// Class: ElementFormat
module Shumway.AVMX.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class ElementFormat extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["clone"];
    
    constructor (fontDescription: flash.text.engine.FontDescription = null, fontSize: number = 12, color: number /*uint*/ = 0, alpha: number = 1, textRotation: string = "auto", dominantBaseline: string = "roman", alignmentBaseline: string = "useDominantBaseline", baselineShift: number = 0, kerning: string = "on", trackingRight: number = 0, trackingLeft: number = 0, locale: string = "en", breakOpportunity: string = "auto", digitCase: string = "default", digitWidth: string = "default", ligatureLevel: string = "common", typographicCase: string = "default") {
      fontDescription = fontDescription; fontSize = +fontSize; color = color >>> 0; alpha = +alpha; textRotation = axCoerceString(textRotation); dominantBaseline = axCoerceString(dominantBaseline); alignmentBaseline = axCoerceString(alignmentBaseline); baselineShift = +baselineShift; kerning = axCoerceString(kerning); trackingRight = +trackingRight; trackingLeft = +trackingLeft; locale = axCoerceString(locale); breakOpportunity = axCoerceString(breakOpportunity); digitCase = axCoerceString(digitCase); digitWidth = axCoerceString(digitWidth); ligatureLevel = axCoerceString(ligatureLevel); typographicCase = axCoerceString(typographicCase);
      super();
      dummyConstructor("public flash.text.engine.ElementFormat");
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
      release || notImplemented("public flash.text.engine.ElementFormat::get alignmentBaseline"); return;
      // return this._alignmentBaseline;
    }
    set alignmentBaseline(alignmentBaseline: string) {
      alignmentBaseline = axCoerceString(alignmentBaseline);
      release || notImplemented("public flash.text.engine.ElementFormat::set alignmentBaseline"); return;
      // this._alignmentBaseline = alignmentBaseline;
    }
    get alpha(): number {
      release || notImplemented("public flash.text.engine.ElementFormat::get alpha"); return;
      // return this._alpha;
    }
    set alpha(value: number) {
      value = +value;
      release || notImplemented("public flash.text.engine.ElementFormat::set alpha"); return;
      // this._alpha = value;
    }
    get baselineShift(): number {
      release || notImplemented("public flash.text.engine.ElementFormat::get baselineShift"); return;
      // return this._baselineShift;
    }
    set baselineShift(value: number) {
      value = +value;
      release || notImplemented("public flash.text.engine.ElementFormat::set baselineShift"); return;
      // this._baselineShift = value;
    }
    get breakOpportunity(): string {
      release || notImplemented("public flash.text.engine.ElementFormat::get breakOpportunity"); return;
      // return this._breakOpportunity;
    }
    set breakOpportunity(opportunityType: string) {
      opportunityType = axCoerceString(opportunityType);
      release || notImplemented("public flash.text.engine.ElementFormat::set breakOpportunity"); return;
      // this._breakOpportunity = opportunityType;
    }
    get color(): number /*uint*/ {
      release || notImplemented("public flash.text.engine.ElementFormat::get color"); return;
      // return this._color;
    }
    set color(value: number /*uint*/) {
      value = value >>> 0;
      release || notImplemented("public flash.text.engine.ElementFormat::set color"); return;
      // this._color = value;
    }
    get dominantBaseline(): string {
      release || notImplemented("public flash.text.engine.ElementFormat::get dominantBaseline"); return;
      // return this._dominantBaseline;
    }
    set dominantBaseline(dominantBaseline: string) {
      dominantBaseline = axCoerceString(dominantBaseline);
      release || notImplemented("public flash.text.engine.ElementFormat::set dominantBaseline"); return;
      // this._dominantBaseline = dominantBaseline;
    }
    get fontDescription(): flash.text.engine.FontDescription {
      release || notImplemented("public flash.text.engine.ElementFormat::get fontDescription"); return;
      // return this._fontDescription;
    }
    set fontDescription(value: flash.text.engine.FontDescription) {
      value = value;
      release || notImplemented("public flash.text.engine.ElementFormat::set fontDescription"); return;
      // this._fontDescription = value;
    }
    get digitCase(): string {
      release || notImplemented("public flash.text.engine.ElementFormat::get digitCase"); return;
      // return this._digitCase;
    }
    set digitCase(digitCaseType: string) {
      digitCaseType = axCoerceString(digitCaseType);
      release || notImplemented("public flash.text.engine.ElementFormat::set digitCase"); return;
      // this._digitCase = digitCaseType;
    }
    get digitWidth(): string {
      release || notImplemented("public flash.text.engine.ElementFormat::get digitWidth"); return;
      // return this._digitWidth;
    }
    set digitWidth(digitWidthType: string) {
      digitWidthType = axCoerceString(digitWidthType);
      release || notImplemented("public flash.text.engine.ElementFormat::set digitWidth"); return;
      // this._digitWidth = digitWidthType;
    }
    get ligatureLevel(): string {
      release || notImplemented("public flash.text.engine.ElementFormat::get ligatureLevel"); return;
      // return this._ligatureLevel;
    }
    set ligatureLevel(ligatureLevelType: string) {
      ligatureLevelType = axCoerceString(ligatureLevelType);
      release || notImplemented("public flash.text.engine.ElementFormat::set ligatureLevel"); return;
      // this._ligatureLevel = ligatureLevelType;
    }
    get fontSize(): number {
      release || notImplemented("public flash.text.engine.ElementFormat::get fontSize"); return;
      // return this._fontSize;
    }
    set fontSize(value: number) {
      value = +value;
      release || notImplemented("public flash.text.engine.ElementFormat::set fontSize"); return;
      // this._fontSize = value;
    }
    get kerning(): string {
      release || notImplemented("public flash.text.engine.ElementFormat::get kerning"); return;
      // return this._kerning;
    }
    set kerning(value: string) {
      value = axCoerceString(value);
      release || notImplemented("public flash.text.engine.ElementFormat::set kerning"); return;
      // this._kerning = value;
    }
    get locale(): string {
      release || notImplemented("public flash.text.engine.ElementFormat::get locale"); return;
      // return this._locale;
    }
    set locale(value: string) {
      value = axCoerceString(value);
      release || notImplemented("public flash.text.engine.ElementFormat::set locale"); return;
      // this._locale = value;
    }
    get textRotation(): string {
      release || notImplemented("public flash.text.engine.ElementFormat::get textRotation"); return;
      // return this._textRotation;
    }
    set textRotation(value: string) {
      value = axCoerceString(value);
      release || notImplemented("public flash.text.engine.ElementFormat::set textRotation"); return;
      // this._textRotation = value;
    }
    get trackingRight(): number {
      release || notImplemented("public flash.text.engine.ElementFormat::get trackingRight"); return;
      // return this._trackingRight;
    }
    set trackingRight(value: number) {
      value = +value;
      release || notImplemented("public flash.text.engine.ElementFormat::set trackingRight"); return;
      // this._trackingRight = value;
    }
    get trackingLeft(): number {
      release || notImplemented("public flash.text.engine.ElementFormat::get trackingLeft"); return;
      // return this._trackingLeft;
    }
    set trackingLeft(value: number) {
      value = +value;
      release || notImplemented("public flash.text.engine.ElementFormat::set trackingLeft"); return;
      // this._trackingLeft = value;
    }
    get typographicCase(): string {
      release || notImplemented("public flash.text.engine.ElementFormat::get typographicCase"); return;
      // return this._typographicCase;
    }
    set typographicCase(typographicCaseType: string) {
      typographicCaseType = axCoerceString(typographicCaseType);
      release || notImplemented("public flash.text.engine.ElementFormat::set typographicCase"); return;
      // this._typographicCase = typographicCaseType;
    }
    get locked(): boolean {
      release || notImplemented("public flash.text.engine.ElementFormat::get locked"); return;
      // return this._locked;
    }
    set locked(value: boolean) {
      value = !!value;
      release || notImplemented("public flash.text.engine.ElementFormat::set locked"); return;
      // this._locked = value;
    }
    getFontMetrics(): flash.text.engine.FontMetrics {
      release || notImplemented("public flash.text.engine.ElementFormat::getFontMetrics"); return;
    }
  }
}
