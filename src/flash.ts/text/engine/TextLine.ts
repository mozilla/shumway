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
// Class: TextLine
module Shumway.AVM2.AS.flash.text.engine {
  import notImplemented = Shumway.Debug.notImplemented;
  export class TextLine extends flash.display.DisplayObjectContainer {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.text.engine.TextLine");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    focusRect: ASObject;
    tabChildren: boolean;
    tabEnabled: boolean;
    tabIndex: number /*int*/;
    userData: any;
    getMirrorRegion: (mirror: flash.events.EventDispatcher) => flash.text.engine.TextLineMirrorRegion;
    flushAtomData: () => void;
    contextMenu: flash.ui.ContextMenu;
    // Instance AS -> JS Bindings
    get textBlock(): flash.text.engine.TextBlock {
      notImplemented("public flash.text.engine.TextLine::get textBlock"); return;
    }
    get hasGraphicElement(): boolean {
      notImplemented("public flash.text.engine.TextLine::get hasGraphicElement"); return;
    }
    get hasTabs(): boolean {
      notImplemented("public flash.text.engine.TextLine::get hasTabs"); return;
    }
    get nextLine(): flash.text.engine.TextLine {
      notImplemented("public flash.text.engine.TextLine::get nextLine"); return;
    }
    get previousLine(): flash.text.engine.TextLine {
      notImplemented("public flash.text.engine.TextLine::get previousLine"); return;
    }
    get ascent(): number {
      notImplemented("public flash.text.engine.TextLine::get ascent"); return;
    }
    get descent(): number {
      notImplemented("public flash.text.engine.TextLine::get descent"); return;
    }
    get textHeight(): number {
      notImplemented("public flash.text.engine.TextLine::get textHeight"); return;
    }
    get textWidth(): number {
      notImplemented("public flash.text.engine.TextLine::get textWidth"); return;
    }
    get totalAscent(): number {
      notImplemented("public flash.text.engine.TextLine::get totalAscent"); return;
    }
    get totalDescent(): number {
      notImplemented("public flash.text.engine.TextLine::get totalDescent"); return;
    }
    get totalHeight(): number {
      notImplemented("public flash.text.engine.TextLine::get totalHeight"); return;
    }
    get textBlockBeginIndex(): number /*int*/ {
      notImplemented("public flash.text.engine.TextLine::get textBlockBeginIndex"); return;
    }
    get rawTextLength(): number /*int*/ {
      notImplemented("public flash.text.engine.TextLine::get rawTextLength"); return;
    }
    get specifiedWidth(): number {
      notImplemented("public flash.text.engine.TextLine::get specifiedWidth"); return;
    }
    get unjustifiedTextWidth(): number {
      notImplemented("public flash.text.engine.TextLine::get unjustifiedTextWidth"); return;
    }
    get validity(): string {
      notImplemented("public flash.text.engine.TextLine::get validity"); return;
    }
    set validity(value: string) {
      value = "" + value;
      notImplemented("public flash.text.engine.TextLine::set validity"); return;
    }
    get atomCount(): number /*int*/ {
      notImplemented("public flash.text.engine.TextLine::get atomCount"); return;
    }
    get mirrorRegions(): ASVector<flash.text.engine.TextLineMirrorRegion> {
      notImplemented("public flash.text.engine.TextLine::get mirrorRegions"); return;
    }
    getAtomIndexAtPoint(stageX: number, stageY: number): number /*int*/ {
      stageX = +stageX; stageY = +stageY;
      notImplemented("public flash.text.engine.TextLine::getAtomIndexAtPoint"); return;
    }
    getAtomIndexAtCharIndex(charIndex: number /*int*/): number /*int*/ {
      charIndex = charIndex | 0;
      notImplemented("public flash.text.engine.TextLine::getAtomIndexAtCharIndex"); return;
    }
    getAtomBounds(atomIndex: number /*int*/): flash.geom.Rectangle {
      atomIndex = atomIndex | 0;
      notImplemented("public flash.text.engine.TextLine::getAtomBounds"); return;
    }
    getAtomBidiLevel(atomIndex: number /*int*/): number /*int*/ {
      atomIndex = atomIndex | 0;
      notImplemented("public flash.text.engine.TextLine::getAtomBidiLevel"); return;
    }
    getAtomTextRotation(atomIndex: number /*int*/): string {
      atomIndex = atomIndex | 0;
      notImplemented("public flash.text.engine.TextLine::getAtomTextRotation"); return;
    }
    getAtomTextBlockBeginIndex(atomIndex: number /*int*/): number /*int*/ {
      atomIndex = atomIndex | 0;
      notImplemented("public flash.text.engine.TextLine::getAtomTextBlockBeginIndex"); return;
    }
    getAtomTextBlockEndIndex(atomIndex: number /*int*/): number /*int*/ {
      atomIndex = atomIndex | 0;
      notImplemented("public flash.text.engine.TextLine::getAtomTextBlockEndIndex"); return;
    }
    getAtomCenter(atomIndex: number /*int*/): number {
      atomIndex = atomIndex | 0;
      notImplemented("public flash.text.engine.TextLine::getAtomCenter"); return;
    }
    getAtomWordBoundaryOnLeft(atomIndex: number /*int*/): boolean {
      atomIndex = atomIndex | 0;
      notImplemented("public flash.text.engine.TextLine::getAtomWordBoundaryOnLeft"); return;
    }
    getAtomGraphic(atomIndex: number /*int*/): flash.display.DisplayObject {
      atomIndex = atomIndex | 0;
      notImplemented("public flash.text.engine.TextLine::getAtomGraphic"); return;
    }
    getBaselinePosition(baseline: string): number {
      baseline = "" + baseline;
      notImplemented("public flash.text.engine.TextLine::getBaselinePosition"); return;
    }
    dump(): string {
      notImplemented("public flash.text.engine.TextLine::dump"); return;
    }
  }
}
