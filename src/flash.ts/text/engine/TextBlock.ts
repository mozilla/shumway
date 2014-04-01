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
// Class: TextBlock
module Shumway.AVM2.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  export class TextBlock extends ASNative {
    static initializer: any = null;
    constructor (content: flash.text.engine.ContentElement = null, tabStops: ASVector<flash.text.engine.TabStop> = null, textJustifier: flash.text.engine.TextJustifier = null, lineRotation: string = "rotate0", baselineZero: string = "roman", bidiLevel: number /*int*/ = 0, applyNonLinearFontScaling: boolean = true, baselineFontDescription: flash.text.engine.FontDescription = null, baselineFontSize: number = 12) {
      content = content; tabStops = tabStops; textJustifier = textJustifier; lineRotation = "" + lineRotation; baselineZero = "" + baselineZero; bidiLevel = bidiLevel | 0; applyNonLinearFontScaling = !!applyNonLinearFontScaling; baselineFontDescription = baselineFontDescription; baselineFontSize = +baselineFontSize;
      false && super();
      notImplemented("Dummy Constructor: public flash.text.engine.TextBlock");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    userData: any;
    textJustifier: flash.text.engine.TextJustifier;
    tabStops: ASVector<flash.text.engine.TabStop>;
    createTextLine: (previousLine: flash.text.engine.TextLine = null, width: number = 1000000, lineOffset: number = 0, fitSomething: boolean = false) => flash.text.engine.TextLine;
    recreateTextLine: (textLine: flash.text.engine.TextLine, previousLine: flash.text.engine.TextLine = null, width: number = 1000000, lineOffset: number = 0, fitSomething: boolean = false) => flash.text.engine.TextLine;
    // Instance AS -> JS Bindings
    get applyNonLinearFontScaling(): boolean {
      notImplemented("public flash.text.engine.TextBlock::get applyNonLinearFontScaling"); return;
    }
    set applyNonLinearFontScaling(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.engine.TextBlock::set applyNonLinearFontScaling"); return;
    }
    get baselineFontDescription(): flash.text.engine.FontDescription {
      notImplemented("public flash.text.engine.TextBlock::get baselineFontDescription"); return;
    }
    set baselineFontDescription(value: flash.text.engine.FontDescription) {
      value = value;
      notImplemented("public flash.text.engine.TextBlock::set baselineFontDescription"); return;
    }
    get baselineFontSize(): number {
      notImplemented("public flash.text.engine.TextBlock::get baselineFontSize"); return;
    }
    set baselineFontSize(value: number) {
      value = +value;
      notImplemented("public flash.text.engine.TextBlock::set baselineFontSize"); return;
    }
    get baselineZero(): string {
      notImplemented("public flash.text.engine.TextBlock::get baselineZero"); return;
    }
    set baselineZero(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.TextBlock::set baselineZero"); return;
    }
    get content(): flash.text.engine.ContentElement {
      notImplemented("public flash.text.engine.TextBlock::get content"); return;
    }
    set content(value: flash.text.engine.ContentElement) {
      value = value;
      notImplemented("public flash.text.engine.TextBlock::set content"); return;
    }
    get bidiLevel(): number /*int*/ {
      notImplemented("public flash.text.engine.TextBlock::get bidiLevel"); return;
    }
    set bidiLevel(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.text.engine.TextBlock::set bidiLevel"); return;
    }
    get firstInvalidLine(): flash.text.engine.TextLine {
      notImplemented("public flash.text.engine.TextBlock::get firstInvalidLine"); return;
    }
    get firstLine(): flash.text.engine.TextLine {
      notImplemented("public flash.text.engine.TextBlock::get firstLine"); return;
    }
    get lastLine(): flash.text.engine.TextLine {
      notImplemented("public flash.text.engine.TextBlock::get lastLine"); return;
    }
    getTextJustifier(): flash.text.engine.TextJustifier {
      notImplemented("public flash.text.engine.TextBlock::getTextJustifier"); return;
    }
    setTextJustifier(value: flash.text.engine.TextJustifier): void {
      value = value;
      notImplemented("public flash.text.engine.TextBlock::setTextJustifier"); return;
    }
    get textLineCreationResult(): string {
      notImplemented("public flash.text.engine.TextBlock::get textLineCreationResult"); return;
    }
    get lineRotation(): string {
      notImplemented("public flash.text.engine.TextBlock::get lineRotation"); return;
    }
    set lineRotation(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.TextBlock::set lineRotation"); return;
    }
    getTabStops(): ASVector<flash.text.engine.TabStop> {
      notImplemented("public flash.text.engine.TextBlock::getTabStops"); return;
    }
    setTabStops(value: ASVector<flash.text.engine.TabStop>): void {
      value = value;
      notImplemented("public flash.text.engine.TextBlock::setTabStops"); return;
    }
    findNextAtomBoundary(afterCharIndex: number /*int*/): number /*int*/ {
      afterCharIndex = afterCharIndex | 0;
      notImplemented("public flash.text.engine.TextBlock::findNextAtomBoundary"); return;
    }
    findPreviousAtomBoundary(beforeCharIndex: number /*int*/): number /*int*/ {
      beforeCharIndex = beforeCharIndex | 0;
      notImplemented("public flash.text.engine.TextBlock::findPreviousAtomBoundary"); return;
    }
    findNextWordBoundary(afterCharIndex: number /*int*/): number /*int*/ {
      afterCharIndex = afterCharIndex | 0;
      notImplemented("public flash.text.engine.TextBlock::findNextWordBoundary"); return;
    }
    findPreviousWordBoundary(beforeCharIndex: number /*int*/): number /*int*/ {
      beforeCharIndex = beforeCharIndex | 0;
      notImplemented("public flash.text.engine.TextBlock::findPreviousWordBoundary"); return;
    }
    getTextLineAtCharIndex(charIndex: number /*int*/): flash.text.engine.TextLine {
      charIndex = charIndex | 0;
      notImplemented("public flash.text.engine.TextBlock::getTextLineAtCharIndex"); return;
    }
    DoCreateTextLine(previousLine: flash.text.engine.TextLine, width: number, lineOffset: number = 0, fitSomething: boolean = false, reuseLine: flash.text.engine.TextLine = null): flash.text.engine.TextLine {
      previousLine = previousLine; width = +width; lineOffset = +lineOffset; fitSomething = !!fitSomething; reuseLine = reuseLine;
      notImplemented("public flash.text.engine.TextBlock::DoCreateTextLine"); return;
    }
    releaseLineCreationData(): void {
      notImplemented("public flash.text.engine.TextBlock::releaseLineCreationData"); return;
    }
    releaseLines(firstLine: flash.text.engine.TextLine, lastLine: flash.text.engine.TextLine): void {
      firstLine = firstLine; lastLine = lastLine;
      notImplemented("public flash.text.engine.TextBlock::releaseLines"); return;
    }
    dump(): string {
      notImplemented("public flash.text.engine.TextBlock::dump"); return;
    }
  }
}
