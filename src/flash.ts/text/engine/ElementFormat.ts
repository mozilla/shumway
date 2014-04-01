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
 * limitations undxr the License.
 */
// Class: ElementFormat
module Shumway.AVM2.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  export class ElementFormat extends ASNative {
    static initializer: any = null;
    constructor (fontDescription: flash.text.engine.FontDescription = null, fontSize: number = 12, color: number /*uint*/ = 0, alpha: number = 1, textRotation: string = "auto", dominantBaseline: string = "roman", alignmentBaseline: string = "useDominantBaseline", baselineShift: number = 0, kerning: string = "on", trackingRight: number = 0, trackingLeft: number = 0, locale: string = "en", breakOpportunity: string = "auto", digitCase: string = "default", digitWidth: string = "default", ligatureLevel: string = "common", typographicCase: string = "default") {
      fontDescription = fontDescription; fontSize = +fontSize; color = color >>> 0; alpha = +alpha; textRotation = "" + textRotation; dominantBaseline = "" + dominantBaseline; alignmentBaseline = "" + alignmentBaseline; baselineShift = +baselineShift; kerning = "" + kerning; trackingRight = +trackingRight; trackingLeft = +trackingLeft; locale = "" + locale; breakOpportunity = "" + breakOpportunity; digitCase = "" + digitCase; digitWidth = "" + digitWidth; ligatureLevel = "" + ligatureLevel; typographicCase = "" + typographicCase;
      false && super();
      notImplemented("Dummy Constructor: public flash.text.engine.ElementFormat");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    clone: () => flash.text.engine.ElementFormat;
    // Instance AS -> JS Bindings
    get alignmentBaseline(): string {
      notImplemented("public flash.text.engine.ElementFormat::get alignmentBaseline"); return;
    }
    set alignmentBaseline(alignmentBaseline: string) {
      alignmentBaseline = "" + alignmentBaseline;
      notImplemented("public flash.text.engine.ElementFormat::set alignmentBaseline"); return;
    }
    get alpha(): number {
      notImplemented("public flash.text.engine.ElementFormat::get alpha"); return;
    }
    set alpha(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.ElementFormat::set alpha"); return;
    }
    get baselineShift(): number {
      notImplemented("public flash.text.engine.ElementFormat::get baselineShift"); return;
    }
    set baselineShift(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.ElementFormat::set baselineShift"); return;
    }
    get breakOpportunity(): string {
      notImplemented("public flash.text.engine.ElementFormat::get breakOpportunity"); return;
    }
    set breakOpportunity(opportunityType: string) {
      opportunityType = "" + opportunityType;
      notImplemented("public flash.text.engine.ElementFormat::set breakOpportunity"); return;
    }
    get color(): number /*uint*/ {
      notImplemented("public flash.text.engine.ElementFormat::get color"); return;
    }
    set color(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.text.engine.ElementFormat::set color"); return;
    }
    get dominantBaseline(): string {
      notImplemented("public flash.text.engine.ElementFormat::get dominantBaseline"); return;
    }
    set dominantBaseline(dominantBaseline: string) {
      dominantBaseline = "" + dominantBaseline;
      notImplemented("public flash.text.engine.ElementFormat::set dominantBaseline"); return;
    }
    get fontDescription(): flash.text.engine.FontDescription {
      notImplemented("public flash.text.engine.ElementFormat::get fontDescription"); return;
    }
    set fontDescription(value: flash.text.engine.FontDescription) {
      value = value;
      notImplemented("public flash.text.engine.ElementFormat::set fontDescription"); return;
    }
    get digitCase(): string {
      notImplemented("public flash.text.engine.ElementFormat::get digitCase"); return;
    }
    set digitCase(digitCaseType: string) {
      digitCaseType = "" + digitCaseType;
      notImplemented("public flash.text.engine.ElementFormat::set digitCase"); return;
    }
    get digitWidth(): string {
      notImplemented("public flash.text.engine.ElementFormat::get digitWidth"); return;
    }
    set digitWidth(digitWidthType: string) {
      digitWidthType = "" + digitWidthType;
      notImplemented("public flash.text.engine.ElementFormat::set digitWidth"); return;
    }
    get ligatureLevel(): string {
      notImplemented("public flash.text.engine.ElementFormat::get ligatureLevel"); return;
    }
    set ligatureLevel(ligatureLevelType: string) {
      ligatureLevelType = "" + ligatureLevelType;
      notImplemented("public flash.text.engine.ElementFormat::set ligatureLevel"); return;
    }
    get fontSize(): number {
      notImplemented("public flash.text.engine.ElementFormat::get fontSize"); return;
    }
    set fontSize(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.ElementFormat::set fontSize"); return;
    }
    get kerning(): string {
      notImplemented("public flash.text.engine.ElementFormat::get kerning"); return;
    }
    set kerning(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.ElementFormat::set kerning"); return;
    }
    get locale(): string {
      notImplemented("public flash.text.engine.ElementFormat::get locale"); return;
    }
    set locale(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.ElementFormat::set locale"); return;
    }
    get textRotation(): string {
      notImplemented("public flash.text.engine.ElementFormat::get textRotation"); return;
    }
    set textRotation(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.ElementFormat::set textRotation"); return;
    }
    get trackingRight(): number {
      notImplemented("public flash.text.engine.ElementFormat::get trackingRight"); return;
    }
    set trackingRight(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.ElementFormat::set trackingRight"); return;
    }
    get trackingLeft(): number {
      notImplemented("public flash.text.engine.ElementFormat::get trackingLeft"); return;
    }
    set trackingLeft(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.ElementFormat::set trackingLeft"); return;
    }
    get typographicCase(): string {
      notImplemented("public flash.text.engine.ElementFormat::get typographicCase"); return;
    }
    set typographicCase(typographicCaseType: string) {
      typographicCaseType = "" + typographicCaseType;
      notImplemented("public flash.text.engine.ElementFormat::set typographicCase"); return;
    }
    get locked(): boolean {
      notImplemented("public flash.text.engine.ElementFormat::get locked"); return;
    }
    set locked(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.engine.ElementFormat::set locked"); return;
    }
    getFontMetrics(): flash.text.engine.FontMetrics {
      notImplemented("public flash.text.engine.ElementFormat::getFontMetrics"); return;
    }
  }
}
