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
// Class: TextBlock
module Shumway.AVMX.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class TextBlock extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["userData", "textJustifier", "textJustifier", "tabStops", "tabStops", "createTextLine", "recreateTextLine"];
    
    constructor (content: flash.text.engine.ContentElement = null, tabStops: ASVector<any /* flash.text.engine.TabStop */> = null, textJustifier: flash.text.engine.TextJustifier = null, lineRotation: string = "rotate0", baselineZero: string = "roman", bidiLevel: number /*int*/ = 0, applyNonLinearFontScaling: boolean = true, baselineFontDescription: flash.text.engine.FontDescription = null, baselineFontSize: number = 12) {
      content = content; tabStops = tabStops; textJustifier = textJustifier; lineRotation = axCoerceString(lineRotation); baselineZero = axCoerceString(baselineZero); bidiLevel = bidiLevel | 0; applyNonLinearFontScaling = !!applyNonLinearFontScaling; baselineFontDescription = baselineFontDescription; baselineFontSize = +baselineFontSize;
      super();
      dummyConstructor("public flash.text.engine.TextBlock");
    }
    
    // JS -> AS Bindings
    
    userData: any;
    textJustifier: flash.text.engine.TextJustifier;
    // tabStops: ASVector<flash.text.engine.TabStop>;
    createTextLine: (previousLine?: TextLine, width?: number, lineOffset?: number,
                     fitSomething?: boolean) => TextLine;
    recreateTextLine: (textLine: TextLine, previousLine?: TextLine, width?: number,
                       lineOffset?: number, fitSomething?: boolean) => TextLine;
    
    // AS -> JS Bindings
    
    // _applyNonLinearFontScaling: boolean;
    // _baselineFontDescription: flash.text.engine.FontDescription;
    // _baselineFontSize: number;
    // _baselineZero: string;
    // _content: flash.text.engine.ContentElement;
    // _bidiLevel: number /*int*/;
    // _firstInvalidLine: flash.text.engine.TextLine;
    // _firstLine: flash.text.engine.TextLine;
    // _lastLine: flash.text.engine.TextLine;
    // _textJustifier: flash.text.engine.TextJustifier;
    // _textLineCreationResult: string;
    // _lineRotation: string;
    // _tabStops: ASVector<flash.text.engine.TabStop>;
    get applyNonLinearFontScaling(): boolean {
      release || notImplemented("public flash.text.engine.TextBlock::get applyNonLinearFontScaling"); return;
      // return this._applyNonLinearFontScaling;
    }
    set applyNonLinearFontScaling(value: boolean) {
      value = !!value;
      release || notImplemented("public flash.text.engine.TextBlock::set applyNonLinearFontScaling"); return;
      // this._applyNonLinearFontScaling = value;
    }
    get baselineFontDescription(): flash.text.engine.FontDescription {
      release || notImplemented("public flash.text.engine.TextBlock::get baselineFontDescription"); return;
      // return this._baselineFontDescription;
    }
    set baselineFontDescription(value: flash.text.engine.FontDescription) {
      value = value;
      release || notImplemented("public flash.text.engine.TextBlock::set baselineFontDescription"); return;
      // this._baselineFontDescription = value;
    }
    get baselineFontSize(): number {
      release || notImplemented("public flash.text.engine.TextBlock::get baselineFontSize"); return;
      // return this._baselineFontSize;
    }
    set baselineFontSize(value: number) {
      value = +value;
      release || notImplemented("public flash.text.engine.TextBlock::set baselineFontSize"); return;
      // this._baselineFontSize = value;
    }
    get baselineZero(): string {
      release || notImplemented("public flash.text.engine.TextBlock::get baselineZero"); return;
      // return this._baselineZero;
    }
    set baselineZero(value: string) {
      value = axCoerceString(value);
      release || notImplemented("public flash.text.engine.TextBlock::set baselineZero"); return;
      // this._baselineZero = value;
    }
    get content(): flash.text.engine.ContentElement {
      release || notImplemented("public flash.text.engine.TextBlock::get content"); return;
      // return this._content;
    }
    set content(value: flash.text.engine.ContentElement) {
      value = value;
      release || notImplemented("public flash.text.engine.TextBlock::set content"); return;
      // this._content = value;
    }
    get bidiLevel(): number /*int*/ {
      release || notImplemented("public flash.text.engine.TextBlock::get bidiLevel"); return;
      // return this._bidiLevel;
    }
    set bidiLevel(value: number /*int*/) {
      value = value | 0;
      release || notImplemented("public flash.text.engine.TextBlock::set bidiLevel"); return;
      // this._bidiLevel = value;
    }
    get firstInvalidLine(): flash.text.engine.TextLine {
      release || notImplemented("public flash.text.engine.TextBlock::get firstInvalidLine"); return;
      // return this._firstInvalidLine;
    }
    get firstLine(): flash.text.engine.TextLine {
      release || notImplemented("public flash.text.engine.TextBlock::get firstLine"); return;
      // return this._firstLine;
    }
    get lastLine(): flash.text.engine.TextLine {
      release || notImplemented("public flash.text.engine.TextBlock::get lastLine"); return;
      // return this._lastLine;
    }
    get textLineCreationResult(): string {
      release || notImplemented("public flash.text.engine.TextBlock::get textLineCreationResult"); return;
      // return this._textLineCreationResult;
    }
    get lineRotation(): string {
      release || notImplemented("public flash.text.engine.TextBlock::get lineRotation"); return;
      // return this._lineRotation;
    }
    set lineRotation(value: string) {
      value = axCoerceString(value);
      release || notImplemented("public flash.text.engine.TextBlock::set lineRotation"); return;
      // this._lineRotation = value;
    }
    findNextAtomBoundary(afterCharIndex: number /*int*/): number /*int*/ {
      afterCharIndex = afterCharIndex | 0;
      release || notImplemented("public flash.text.engine.TextBlock::findNextAtomBoundary"); return;
    }
    findPreviousAtomBoundary(beforeCharIndex: number /*int*/): number /*int*/ {
      beforeCharIndex = beforeCharIndex | 0;
      release || notImplemented("public flash.text.engine.TextBlock::findPreviousAtomBoundary"); return;
    }
    findNextWordBoundary(afterCharIndex: number /*int*/): number /*int*/ {
      afterCharIndex = afterCharIndex | 0;
      release || notImplemented("public flash.text.engine.TextBlock::findNextWordBoundary"); return;
    }
    findPreviousWordBoundary(beforeCharIndex: number /*int*/): number /*int*/ {
      beforeCharIndex = beforeCharIndex | 0;
      release || notImplemented("public flash.text.engine.TextBlock::findPreviousWordBoundary"); return;
    }
    getTextLineAtCharIndex(charIndex: number /*int*/): flash.text.engine.TextLine {
      charIndex = charIndex | 0;
      release || notImplemented("public flash.text.engine.TextBlock::getTextLineAtCharIndex"); return;
    }
    releaseLineCreationData(): void {
      release || notImplemented("public flash.text.engine.TextBlock::releaseLineCreationData"); return;
    }
    releaseLines(firstLine: flash.text.engine.TextLine, lastLine: flash.text.engine.TextLine): void {
      firstLine = firstLine; lastLine = lastLine;
      release || notImplemented("public flash.text.engine.TextBlock::releaseLines"); return;
    }
    dump(): string {
      release || notImplemented("public flash.text.engine.TextBlock::dump"); return;
    }
    DoCreateTextLine(previousLine: flash.text.engine.TextLine, width: number, lineOffset: number = 0, fitSomething: boolean = false, reuseLine: flash.text.engine.TextLine = null): flash.text.engine.TextLine {
      previousLine = previousLine; width = +width; lineOffset = +lineOffset; fitSomething = !!fitSomething; reuseLine = reuseLine;
      release || notImplemented("public flash.text.engine.TextBlock::DoCreateTextLine"); return;
    }
//    getTabStops(): ASVector<flash.text.engine.TabStop> {
//      release || notImplemented("public flash.text.engine.TextBlock::getTabStops"); return;
//    }
//    setTabStops(value: ASVector<flash.text.engine.TabStop>): void {
//      value = value;
//      release || notImplemented("public flash.text.engine.TextBlock::setTabStops"); return;
//    }
    getTextJustifier(): flash.text.engine.TextJustifier {
      release || notImplemented("public flash.text.engine.TextBlock::getTextJustifier"); return;
    }
    setTextJustifier(value: flash.text.engine.TextJustifier): void {
      value = value;
      release || notImplemented("public flash.text.engine.TextBlock::setTextJustifier"); return;
    }
  }
}
