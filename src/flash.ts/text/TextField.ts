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
// Class: TextField
module Shumway.AVM2.AS.flash.text {
  import notImplemented = Shumway.Debug.notImplemented;
  export class TextField extends flash.display.InteractiveObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["selectedText", "appendText", "getXMLText", "insertXMLText", "copyRichText", "pasteRichText"];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.text.TextField");
    }
    
    // JS -> AS Bindings
    
    selectedText: string;
    appendText: (newText: string) => void;
    getXMLText: (beginIndex: number /*int*/ = 0, endIndex: number /*int*/ = 2147483647) => string;
    insertXMLText: (beginIndex: number /*int*/, endIndex: number /*int*/, richText: string, pasting: boolean = false) => void;
    copyRichText: () => string;
    pasteRichText: (richText: string) => boolean;
    
    // AS -> JS Bindings
    static isFontCompatible(fontName: string, fontStyle: string): boolean {
      fontName = "" + fontName; fontStyle = "" + fontStyle;
      notImplemented("public flash.text.TextField::static isFontCompatible"); return;
    }
    
    // _alwaysShowSelection: boolean;
    // _antiAliasType: string;
    // _autoSize: string;
    // _background: boolean;
    // _backgroundColor: number /*uint*/;
    // _border: boolean;
    // _borderColor: number /*uint*/;
    // _bottomScrollV: number /*int*/;
    // _caretIndex: number /*int*/;
    // _condenseWhite: boolean;
    // _defaultTextFormat: flash.text.TextFormat;
    // _embedFonts: boolean;
    // _gridFitType: string;
    // _htmlText: string;
    // _length: number /*int*/;
    // _textInteractionMode: string;
    // _maxChars: number /*int*/;
    // _maxScrollH: number /*int*/;
    // _maxScrollV: number /*int*/;
    // _mouseWheelEnabled: boolean;
    _multiline: boolean;
    // _numLines: number /*int*/;
    // _displayAsPassword: boolean;
    // _restrict: string;
    // _scrollH: number /*int*/;
    // _scrollV: number /*int*/;
    // _selectable: boolean;
    // _selectedText: string;
    // _selectionBeginIndex: number /*int*/;
    // _selectionEndIndex: number /*int*/;
    // _sharpness: number;
    // _styleSheet: flash.text.StyleSheet;
    // _text: string;
    // _textColor: number /*uint*/;
    _textHeight: number;
    _textWidth: number;
    // _thickness: number;
    // _type: string;
    _wordWrap: boolean;
    // _useRichTextClipboard: boolean;
    get alwaysShowSelection(): boolean {
      notImplemented("public flash.text.TextField::get alwaysShowSelection"); return;
      // return this._alwaysShowSelection;
    }
    set alwaysShowSelection(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set alwaysShowSelection"); return;
      // this._alwaysShowSelection = value;
    }
    get antiAliasType(): string {
      notImplemented("public flash.text.TextField::get antiAliasType"); return;
      // return this._antiAliasType;
    }
    set antiAliasType(antiAliasType: string) {
      antiAliasType = "" + antiAliasType;
      notImplemented("public flash.text.TextField::set antiAliasType"); return;
      // this._antiAliasType = antiAliasType;
    }
    get autoSize(): string {
      notImplemented("public flash.text.TextField::get autoSize"); return;
      // return this._autoSize;
    }
    set autoSize(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextField::set autoSize"); return;
      // this._autoSize = value;
    }
    get background(): boolean {
      notImplemented("public flash.text.TextField::get background"); return;
      // return this._background;
    }
    set background(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set background"); return;
      // this._background = value;
    }
    get backgroundColor(): number /*uint*/ {
      notImplemented("public flash.text.TextField::get backgroundColor"); return;
      // return this._backgroundColor;
    }
    set backgroundColor(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.text.TextField::set backgroundColor"); return;
      // this._backgroundColor = value;
    }
    get border(): boolean {
      notImplemented("public flash.text.TextField::get border"); return;
      // return this._border;
    }
    set border(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set border"); return;
      // this._border = value;
    }
    get borderColor(): number /*uint*/ {
      notImplemented("public flash.text.TextField::get borderColor"); return;
      // return this._borderColor;
    }
    set borderColor(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.text.TextField::set borderColor"); return;
      // this._borderColor = value;
    }
    get bottomScrollV(): number /*int*/ {
      notImplemented("public flash.text.TextField::get bottomScrollV"); return;
      // return this._bottomScrollV;
    }
    get caretIndex(): number /*int*/ {
      notImplemented("public flash.text.TextField::get caretIndex"); return;
      // return this._caretIndex;
    }
    get condenseWhite(): boolean {
      notImplemented("public flash.text.TextField::get condenseWhite"); return;
      // return this._condenseWhite;
    }
    set condenseWhite(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set condenseWhite"); return;
      // this._condenseWhite = value;
    }
    get defaultTextFormat(): flash.text.TextFormat {
      notImplemented("public flash.text.TextField::get defaultTextFormat"); return;
      // return this._defaultTextFormat;
    }
    set defaultTextFormat(format: flash.text.TextFormat) {
      format = format;
      notImplemented("public flash.text.TextField::set defaultTextFormat"); return;
      // this._defaultTextFormat = format;
    }
    get embedFonts(): boolean {
      notImplemented("public flash.text.TextField::get embedFonts"); return;
      // return this._embedFonts;
    }
    set embedFonts(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set embedFonts"); return;
      // this._embedFonts = value;
    }
    get gridFitType(): string {
      notImplemented("public flash.text.TextField::get gridFitType"); return;
      // return this._gridFitType;
    }
    set gridFitType(gridFitType: string) {
      gridFitType = "" + gridFitType;
      notImplemented("public flash.text.TextField::set gridFitType"); return;
      // this._gridFitType = gridFitType;
    }
    get htmlText(): string {
      notImplemented("public flash.text.TextField::get htmlText"); return;
      // return this._htmlText;
    }
    set htmlText(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextField::set htmlText"); return;
      // this._htmlText = value;
    }
    get length(): number /*int*/ {
      notImplemented("public flash.text.TextField::get length"); return;
      // return this._length;
    }
    get textInteractionMode(): string {
      notImplemented("public flash.text.TextField::get textInteractionMode"); return;
      // return this._textInteractionMode;
    }
    get maxChars(): number /*int*/ {
      notImplemented("public flash.text.TextField::get maxChars"); return;
      // return this._maxChars;
    }
    set maxChars(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.text.TextField::set maxChars"); return;
      // this._maxChars = value;
    }
    get maxScrollH(): number /*int*/ {
      notImplemented("public flash.text.TextField::get maxScrollH"); return;
      // return this._maxScrollH;
    }
    get maxScrollV(): number /*int*/ {
      notImplemented("public flash.text.TextField::get maxScrollV"); return;
      // return this._maxScrollV;
    }
    get mouseWheelEnabled(): boolean {
      notImplemented("public flash.text.TextField::get mouseWheelEnabled"); return;
      // return this._mouseWheelEnabled;
    }
    set mouseWheelEnabled(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set mouseWheelEnabled"); return;
      // this._mouseWheelEnabled = value;
    }
    get multiline(): boolean {
      notImplemented("public flash.text.TextField::get multiline"); return;
      // return this._multiline;
    }
    set multiline(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set multiline"); return;
      // this._multiline = value;
    }
    get numLines(): number /*int*/ {
      notImplemented("public flash.text.TextField::get numLines"); return;
      // return this._numLines;
    }
    get displayAsPassword(): boolean {
      notImplemented("public flash.text.TextField::get displayAsPassword"); return;
      // return this._displayAsPassword;
    }
    set displayAsPassword(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set displayAsPassword"); return;
      // this._displayAsPassword = value;
    }
    get restrict(): string {
      notImplemented("public flash.text.TextField::get restrict"); return;
      // return this._restrict;
    }
    set restrict(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextField::set restrict"); return;
      // this._restrict = value;
    }
    get scrollH(): number /*int*/ {
      notImplemented("public flash.text.TextField::get scrollH"); return;
      // return this._scrollH;
    }
    set scrollH(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.text.TextField::set scrollH"); return;
      // this._scrollH = value;
    }
    get scrollV(): number /*int*/ {
      notImplemented("public flash.text.TextField::get scrollV"); return;
      // return this._scrollV;
    }
    set scrollV(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.text.TextField::set scrollV"); return;
      // this._scrollV = value;
    }
    get selectable(): boolean {
      notImplemented("public flash.text.TextField::get selectable"); return;
      // return this._selectable;
    }
    set selectable(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set selectable"); return;
      // this._selectable = value;
    }
    get selectionBeginIndex(): number /*int*/ {
      notImplemented("public flash.text.TextField::get selectionBeginIndex"); return;
      // return this._selectionBeginIndex;
    }
    get selectionEndIndex(): number /*int*/ {
      notImplemented("public flash.text.TextField::get selectionEndIndex"); return;
      // return this._selectionEndIndex;
    }
    get sharpness(): number {
      notImplemented("public flash.text.TextField::get sharpness"); return;
      // return this._sharpness;
    }
    set sharpness(value: number) {
      value = +value;
      notImplemented("public flash.text.TextField::set sharpness"); return;
      // this._sharpness = value;
    }
    get styleSheet(): flash.text.StyleSheet {
      notImplemented("public flash.text.TextField::get styleSheet"); return;
      // return this._styleSheet;
    }
    set styleSheet(value: flash.text.StyleSheet) {
      value = value;
      notImplemented("public flash.text.TextField::set styleSheet"); return;
      // this._styleSheet = value;
    }
    get text(): string {
      notImplemented("public flash.text.TextField::get text"); return;
      // return this._text;
    }
    set text(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextField::set text"); return;
      // this._text = value;
    }
    get textColor(): number /*uint*/ {
      notImplemented("public flash.text.TextField::get textColor"); return;
      // return this._textColor;
    }
    set textColor(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.text.TextField::set textColor"); return;
      // this._textColor = value;
    }
    get textHeight(): number {
      notImplemented("public flash.text.TextField::get textHeight"); return;
      // return this._textHeight;
    }
    get textWidth(): number {
      notImplemented("public flash.text.TextField::get textWidth"); return;
      // return this._textWidth;
    }
    get thickness(): number {
      notImplemented("public flash.text.TextField::get thickness"); return;
      // return this._thickness;
    }
    set thickness(value: number) {
      value = +value;
      notImplemented("public flash.text.TextField::set thickness"); return;
      // this._thickness = value;
    }
    get type(): string {
      notImplemented("public flash.text.TextField::get type"); return;
      // return this._type;
    }
    set type(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextField::set type"); return;
      // this._type = value;
    }
    get wordWrap(): boolean {
      notImplemented("public flash.text.TextField::get wordWrap"); return;
      // return this._wordWrap;
    }
    set wordWrap(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set wordWrap"); return;
      // this._wordWrap = value;
    }
    get useRichTextClipboard(): boolean {
      notImplemented("public flash.text.TextField::get useRichTextClipboard"); return;
      // return this._useRichTextClipboard;
    }
    set useRichTextClipboard(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set useRichTextClipboard"); return;
      // this._useRichTextClipboard = value;
    }
    getCharBoundaries(charIndex: number /*int*/): flash.geom.Rectangle {
      charIndex = charIndex | 0;
      notImplemented("public flash.text.TextField::getCharBoundaries"); return;
    }
    getCharIndexAtPoint(x: number, y: number): number /*int*/ {
      x = +x; y = +y;
      notImplemented("public flash.text.TextField::getCharIndexAtPoint"); return;
    }
    getFirstCharInParagraph(charIndex: number /*int*/): number /*int*/ {
      charIndex = charIndex | 0;
      notImplemented("public flash.text.TextField::getFirstCharInParagraph"); return;
    }
    getLineIndexAtPoint(x: number, y: number): number /*int*/ {
      x = +x; y = +y;
      notImplemented("public flash.text.TextField::getLineIndexAtPoint"); return;
    }
    getLineIndexOfChar(charIndex: number /*int*/): number /*int*/ {
      charIndex = charIndex | 0;
      notImplemented("public flash.text.TextField::getLineIndexOfChar"); return;
    }
    getLineLength(lineIndex: number /*int*/): number /*int*/ {
      lineIndex = lineIndex | 0;
      notImplemented("public flash.text.TextField::getLineLength"); return;
    }
    getLineMetrics(lineIndex: number /*int*/): flash.text.TextLineMetrics {
      lineIndex = lineIndex | 0;
      notImplemented("public flash.text.TextField::getLineMetrics"); return;
    }
    getLineOffset(lineIndex: number /*int*/): number /*int*/ {
      lineIndex = lineIndex | 0;
      notImplemented("public flash.text.TextField::getLineOffset"); return;
    }
    getLineText(lineIndex: number /*int*/): string {
      lineIndex = lineIndex | 0;
      notImplemented("public flash.text.TextField::getLineText"); return;
    }
    getParagraphLength(charIndex: number /*int*/): number /*int*/ {
      charIndex = charIndex | 0;
      notImplemented("public flash.text.TextField::getParagraphLength"); return;
    }
    getTextFormat(beginIndex: number /*int*/ = -1, endIndex: number /*int*/ = -1): flash.text.TextFormat {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      notImplemented("public flash.text.TextField::getTextFormat"); return;
    }
    getTextRuns(beginIndex: number /*int*/ = 0, endIndex: number /*int*/ = 2147483647): any [] {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      notImplemented("public flash.text.TextField::getTextRuns"); return;
    }
    getRawText(): string {
      notImplemented("public flash.text.TextField::getRawText"); return;
    }
    replaceSelectedText(value: string): void {
      value = "" + value;
      notImplemented("public flash.text.TextField::replaceSelectedText"); return;
    }
    replaceText(beginIndex: number /*int*/, endIndex: number /*int*/, newText: string): void {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0; newText = "" + newText;
      notImplemented("public flash.text.TextField::replaceText"); return;
    }
    setSelection(beginIndex: number /*int*/, endIndex: number /*int*/): void {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      notImplemented("public flash.text.TextField::setSelection"); return;
    }
    setTextFormat(format: flash.text.TextFormat, beginIndex: number /*int*/ = -1, endIndex: number /*int*/ = -1): void {
      format = format; beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      notImplemented("public flash.text.TextField::setTextFormat"); return;
    }
    getImageReference(id: string): flash.display.DisplayObject {
      id = "" + id;
      notImplemented("public flash.text.TextField::getImageReference"); return;
    }
  }
}
