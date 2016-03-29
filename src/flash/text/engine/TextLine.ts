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
// Class: TextLine
module Shumway.AVMX.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  export class TextLine extends flash.display.DisplayObjectContainer {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["userData", "focusRect", "tabChildren", "tabEnabled", "tabIndex", "contextMenu", "getMirrorRegion", "flushAtomData"];
    
    constructor () {
      super();
      dummyConstructor("public flash.text.engine.TextLine");
    }
    
    // JS -> AS Bindings
    static MAX_LINE_WIDTH: number /*int*/ = 1000000;
    
    userData: any;
    focusRect: ASObject;
    tabChildren: boolean;
    tabEnabled: boolean;
    tabIndex: number /*int*/;
    contextMenu: flash.ui.ContextMenu;
    getMirrorRegion: (mirror: flash.events.EventDispatcher) => any /* flash.text.engine.TextLineMirrorRegion */;
    flushAtomData: () => void;
    
    // AS -> JS Bindings
    
    // _focusRect: ASObject;
    // _tabChildren: boolean;
    // _tabEnabled: boolean;
    // _tabIndex: number /*int*/;
    // _contextMenu: flash.ui.ContextMenu;
    // _textBlock: flash.text.engine.TextBlock;
    // _hasGraphicElement: boolean;
    // _hasTabs: boolean;
    // _nextLine: flash.text.engine.TextLine;
    // _previousLine: flash.text.engine.TextLine;
    // _ascent: number;
    // _descent: number;
    // _textHeight: number;
    // _textWidth: number;
    // _totalAscent: number;
    // _totalDescent: number;
    // _totalHeight: number;
    // _textBlockBeginIndex: number /*int*/;
    // _rawTextLength: number /*int*/;
    // _specifiedWidth: number;
    // _unjustifiedTextWidth: number;
    // _validity: string;
    // _atomCount: number /*int*/;
    // _mirrorRegions: ASVector<flash.text.engine.TextLineMirrorRegion>;
    get textBlock(): flash.text.engine.TextBlock {
      release || notImplemented("public flash.text.engine.TextLine::get textBlock"); return;
      // return this._textBlock;
    }
    get hasGraphicElement(): boolean {
      release || notImplemented("public flash.text.engine.TextLine::get hasGraphicElement"); return;
      // return this._hasGraphicElement;
    }
    get hasTabs(): boolean {
      release || notImplemented("public flash.text.engine.TextLine::get hasTabs"); return;
      // return this._hasTabs;
    }
    get nextLine(): flash.text.engine.TextLine {
      release || notImplemented("public flash.text.engine.TextLine::get nextLine"); return;
      // return this._nextLine;
    }
    get previousLine(): flash.text.engine.TextLine {
      release || notImplemented("public flash.text.engine.TextLine::get previousLine"); return;
      // return this._previousLine;
    }
    get ascent(): number {
      release || notImplemented("public flash.text.engine.TextLine::get ascent"); return;
      // return this._ascent;
    }
    get descent(): number {
      release || notImplemented("public flash.text.engine.TextLine::get descent"); return;
      // return this._descent;
    }
    get textHeight(): number {
      release || notImplemented("public flash.text.engine.TextLine::get textHeight"); return;
      // return this._textHeight;
    }
    get textWidth(): number {
      release || notImplemented("public flash.text.engine.TextLine::get textWidth"); return;
      // return this._textWidth;
    }
    get totalAscent(): number {
      release || notImplemented("public flash.text.engine.TextLine::get totalAscent"); return;
      // return this._totalAscent;
    }
    get totalDescent(): number {
      release || notImplemented("public flash.text.engine.TextLine::get totalDescent"); return;
      // return this._totalDescent;
    }
    get totalHeight(): number {
      release || notImplemented("public flash.text.engine.TextLine::get totalHeight"); return;
      // return this._totalHeight;
    }
    get textBlockBeginIndex(): number /*int*/ {
      release || notImplemented("public flash.text.engine.TextLine::get textBlockBeginIndex"); return;
      // return this._textBlockBeginIndex;
    }
    get rawTextLength(): number /*int*/ {
      release || notImplemented("public flash.text.engine.TextLine::get rawTextLength"); return;
      // return this._rawTextLength;
    }
    get specifiedWidth(): number {
      release || notImplemented("public flash.text.engine.TextLine::get specifiedWidth"); return;
      // return this._specifiedWidth;
    }
    get unjustifiedTextWidth(): number {
      release || notImplemented("public flash.text.engine.TextLine::get unjustifiedTextWidth"); return;
      // return this._unjustifiedTextWidth;
    }
    get validity(): string {
      release || notImplemented("public flash.text.engine.TextLine::get validity"); return;
      // return this._validity;
    }
    set validity(value: string) {
      value = axCoerceString(value);
      release || notImplemented("public flash.text.engine.TextLine::set validity"); return;
      // this._validity = value;
    }
    get atomCount(): number /*int*/ {
      release || notImplemented("public flash.text.engine.TextLine::get atomCount"); return;
      // return this._atomCount;
    }
    get mirrorRegions(): ASVector<any /* flash.text.engine.TextLineMirrorRegion */> {
      release || notImplemented("public flash.text.engine.TextLine::get mirrorRegions"); return;
      // return this._mirrorRegions;
    }
    getAtomIndexAtPoint(stageX: number, stageY: number): number /*int*/ {
      stageX = +stageX; stageY = +stageY;
      release || notImplemented("public flash.text.engine.TextLine::getAtomIndexAtPoint"); return;
    }
    getAtomIndexAtCharIndex(charIndex: number /*int*/): number /*int*/ {
      charIndex = charIndex | 0;
      release || notImplemented("public flash.text.engine.TextLine::getAtomIndexAtCharIndex"); return;
    }
    getAtomBounds(atomIndex: number /*int*/): flash.geom.Rectangle {
      atomIndex = atomIndex | 0;
      release || notImplemented("public flash.text.engine.TextLine::getAtomBounds"); return;
    }
    getAtomBidiLevel(atomIndex: number /*int*/): number /*int*/ {
      atomIndex = atomIndex | 0;
      release || notImplemented("public flash.text.engine.TextLine::getAtomBidiLevel"); return;
    }
    getAtomTextRotation(atomIndex: number /*int*/): string {
      atomIndex = atomIndex | 0;
      release || notImplemented("public flash.text.engine.TextLine::getAtomTextRotation"); return;
    }
    getAtomTextBlockBeginIndex(atomIndex: number /*int*/): number /*int*/ {
      atomIndex = atomIndex | 0;
      release || notImplemented("public flash.text.engine.TextLine::getAtomTextBlockBeginIndex"); return;
    }
    getAtomTextBlockEndIndex(atomIndex: number /*int*/): number /*int*/ {
      atomIndex = atomIndex | 0;
      release || notImplemented("public flash.text.engine.TextLine::getAtomTextBlockEndIndex"); return;
    }
    getAtomCenter(atomIndex: number /*int*/): number {
      atomIndex = atomIndex | 0;
      release || notImplemented("public flash.text.engine.TextLine::getAtomCenter"); return;
    }
    getAtomWordBoundaryOnLeft(atomIndex: number /*int*/): boolean {
      atomIndex = atomIndex | 0;
      release || notImplemented("public flash.text.engine.TextLine::getAtomWordBoundaryOnLeft"); return;
    }
    getAtomGraphic(atomIndex: number /*int*/): flash.display.DisplayObject {
      atomIndex = atomIndex | 0;
      release || notImplemented("public flash.text.engine.TextLine::getAtomGraphic"); return;
    }
    getBaselinePosition(baseline: string): number {
      baseline = axCoerceString(baseline);
      release || notImplemented("public flash.text.engine.TextLine::getBaselinePosition"); return;
    }
    dump(): string {
      release || notImplemented("public flash.text.engine.TextLine::dump"); return;
    }
  }
}
