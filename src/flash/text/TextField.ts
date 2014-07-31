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
// Class: TextField
module Shumway.AVM2.AS.flash.text {
  import notImplemented = Shumway.Debug.notImplemented;
  import assert = Shumway.Debug.assert;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import clamp = Shumway.NumberUtilities.clamp;

  import DisplayObjectFlags = flash.display.DisplayObjectFlags;

  export class TextField extends flash.display.InteractiveObject {

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    static classInitializer: any = null;

    static initializer: any = function (symbol: Shumway.Timeline.TextSymbol) {
      var self: TextField = this;

      self._alwaysShowSelection = false;
      self._antiAliasType = AntiAliasType.NORMAL;
      self._autoSize = TextFieldAutoSize.NONE;
      self._background = false;
      self._backgroundColor = 0xffffffff;
      self._border = false;
      self._borderColor = 0x000000ff;
      self._bottomScrollV = 1;
      self._caretIndex = 0;
      self._condenseWhite = false;
      self._defaultTextFormat = new flash.text.TextFormat(
        'Times Roman',
        12,
        0,
        false,
        false,
        false,
        '',
        '',
        TextFormatAlign.LEFT
      );

      self._embedFonts = false;
      self._gridFitType = GridFitType.PIXEL;
      self._htmlText = '';
      self._length = 0;
      self._textInteractionMode = TextInteractionMode.NORMAL;
      self._maxChars = 0;
      self._maxScrollH = 0;
      self._maxScrollV = 1;
      self._mouseWheelEnabled = false;
      self._multiline = false;
      self._numLines = 1;
      self._displayAsPassword = false;
      self._restrict = null;
      self._scrollH = 0;
      self._scrollV = 1;
      self._selectable = true;
      self._selectedText = '';
      self._selectionBeginIndex = 0;
      self._selectionEndIndex = 0;
      self._sharpness = 0;
      self._styleSheet = null;
      self._textColor = -1;
      self._textHeight = 0;
      self._textWidth = 0;
      self._thickness = 0;
      self._type = TextFieldType.DYNAMIC;
      self._useRichTextClipboard = false;

      self._textContent = new Shumway.TextContent(self._defaultTextFormat);
      self._lineMetricsData = null;

      if (symbol) {
        self._setFillAndLineBoundsFromSymbol(symbol);
        self._textContent.bounds = this._lineBounds;

        self._defaultTextFormat.color = symbol.color;
        self._defaultTextFormat.size = (symbol.size / 20) | 0;
        self._defaultTextFormat.font = symbol.font;
        self._defaultTextFormat.align = symbol.align;
        self._defaultTextFormat.leftMargin = (symbol.leftMargin / 20) | 0;
        self._defaultTextFormat.rightMargin = (symbol.rightMargin / 20) | 0;
        self._defaultTextFormat.indent = (symbol.indent / 20) | 0;
        self._defaultTextFormat.leading = (symbol.leading / 20) | 0;

        self._multiline = symbol.multiline;
        self._embedFonts = symbol.embedFonts;
        self._selectable = symbol.selectable;
        self._displayAsPassword = symbol.displayAsPassword;
        self._type = symbol.type;
        self._maxChars = symbol.maxChars;

        if (symbol.border) {
          self.background = true;
          self.border = true;
        }
        if (symbol.html) {
          self.htmlText = symbol.initialText;
        } else {
          self.text = symbol.initialText;
        }
        self.wordWrap = symbol.wordWrap;
        self.autoSize = symbol.autoSize;
      } else {
        self._setFillAndLineBoundsFromWidthAndHeight(100 * 20, 100 * 20);
      }
    };

    constructor() {
      super();
      notImplemented("Dummy Constructor: public flash.text.TextField");
    }

    _setFillAndLineBoundsFromWidthAndHeight(width: number, height: number) {
      super._setFillAndLineBoundsFromWidthAndHeight(width, height);
      this._textContent.bounds = this._lineBounds;
      this._invalidateContent();
    }

    _canHaveTextContent(): boolean {
      return true;
    }

    _getTextContent(): Shumway.TextContent {
      return this._textContent;
    }

    _getContentBounds(includeStrokes: boolean = true): Bounds {
      this._ensureLineMetrics();
      return super._getContentBounds(includeStrokes);
    }

    private _invalidateContent() {
      if (this._textContent.flags & Shumway.TextContentFlags.Dirty) {
        this._setFlags(DisplayObjectFlags.DirtyTextContent);
      }
    }

    _textContent: Shumway.TextContent;
    _lineMetricsData: DataBuffer;

    // JS -> AS Bindings

    //selectedText: string;
    //appendText: (newText: string) => void;
    //getXMLText: (beginIndex: number /*int*/ = 0, endIndex: number /*int*/ = 2147483647) => string;
    //insertXMLText: (beginIndex: number /*int*/, endIndex: number /*int*/, richText: string, pasting: boolean = false) => void;
    //copyRichText: () => string;
    //pasteRichText: (richText: string) => boolean;

    // AS -> JS Bindings
    static isFontCompatible(fontName: string, fontStyle: string): boolean {
      fontName = asCoerceString(fontName);
      fontStyle = asCoerceString(fontStyle);
      somewhatImplemented("flash.text.TextField.isFontCompatible");
      return true;
    }

    _alwaysShowSelection: boolean;
    _antiAliasType: string;
    _autoSize: string;
    _background: boolean;
    _backgroundColor: number /*uint*/;
    _border: boolean;
    _borderColor: number /*uint*/;
    _bottomScrollV: number /*int*/;
    _caretIndex: number /*int*/;
    _condenseWhite: boolean;
    _defaultTextFormat: flash.text.TextFormat;
    _embedFonts: boolean;
    _gridFitType: string;
    _htmlText: string;
    _length: number /*int*/;
    _textInteractionMode: string;
    _maxChars: number /*int*/;
    _maxScrollH: number /*int*/;
    _maxScrollV: number /*int*/;
    _mouseWheelEnabled: boolean;
    _multiline: boolean;
    _numLines: number /*int*/;
    _displayAsPassword: boolean;
    _restrict: string;
    _scrollH: number /*int*/;
    _scrollV: number /*int*/;
    _selectable: boolean;
    _selectedText: string;
    _selectionBeginIndex: number /*int*/;
    _selectionEndIndex: number /*int*/;
    _sharpness: number;
    _styleSheet: flash.text.StyleSheet;
    _textColor: number /*uint*/;
    _textHeight: number;
    _textWidth: number;
    _thickness: number;
    _type: string;
    _wordWrap: boolean;
    _useRichTextClipboard: boolean;

    get alwaysShowSelection(): boolean {
      return this._alwaysShowSelection;
    }

    set alwaysShowSelection(value: boolean) {
      somewhatImplemented("public flash.text.TextField::set alwaysShowSelection");
      this._alwaysShowSelection = !!value;
    }

    get antiAliasType(): string {
      return this._antiAliasType;
    }

    set antiAliasType(antiAliasType: string) {
      somewhatImplemented("public flash.text.TextField::set antiAliasType");
      antiAliasType = asCoerceString(antiAliasType);
      if (AntiAliasType.toNumber(antiAliasType) < 0) {
        throwError("ArgumentError", Errors.InvalidParamError, "antiAliasType");
      }
      this._antiAliasType = antiAliasType;
    }

    get autoSize(): string {
      return this._autoSize;
    }

    set autoSize(value: string) {
      value = asCoerceString(value);
      if (value === this._autoSize) {
        return;
      }
      if (TextFieldAutoSize.toNumber(value) < 0) {
        throwError("ArgumentError", Errors.InvalidParamError, "autoSize");
      }
      this._autoSize = value;
      this._textContent.autoSize = TextFieldAutoSize.toNumber(value);
      this._invalidateContent();
    }

    get background(): boolean {
      return this._background;
    }

    set background(value: boolean) {
      value = !!value;
      if (value === this._background) {
        return;
      }
      this._background = value;
      this._textContent.backgroundColor = value ? this._backgroundColor : 0;
      this._setDirtyFlags(DisplayObjectFlags.DirtyTextContent);
    }

    get backgroundColor(): number /*uint*/ {
      return this._backgroundColor >> 8;
    }

    set backgroundColor(value: number /*uint*/) {
      value = ((value << 8) | 0xff) >>> 0;
      if (value === this._backgroundColor) {
        return;
      }
      this._backgroundColor = value;
      if (this._background) {
        this._textContent.backgroundColor = value;
        this._setDirtyFlags(DisplayObjectFlags.DirtyTextContent);
      }
    }

    get border(): boolean {
      return this._border;
    }

    set border(value: boolean) {
      value = !!value;
      if (value === this._border) {
        return;
      }
      this._border = value;
      this._textContent.borderColor = value ? this._borderColor : 0;
      this._setDirtyFlags(DisplayObjectFlags.DirtyTextContent);
    }

    get borderColor(): number /*uint*/ {
      return this._borderColor >> 8;
    }

    set borderColor(value: number /*uint*/) {
      value = ((value << 8) | 0xff) >>> 0;
      if (value === this._borderColor) {
        return;
      }
      this._borderColor = value;
      if (this._border) {
        this._textContent.borderColor = value;
        this._setDirtyFlags(DisplayObjectFlags.DirtyTextContent);
      }
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
      somewhatImplemented("public flash.text.TextField::get condenseWhite");
      return this._condenseWhite;
    }

    set condenseWhite(value: boolean) {
      this._condenseWhite = !!value;
    }

    get defaultTextFormat(): flash.text.TextFormat {
      return this._defaultTextFormat;
    }

    set defaultTextFormat(format: flash.text.TextFormat) {
      somewhatImplemented("public flash.text.TextField::set defaultTextFormat");
      // this._defaultTextFormat = format;
    }

    get embedFonts(): boolean {
      return this._embedFonts;
    }

    set embedFonts(value: boolean) {
      this._embedFonts = !!value;
    }

    get gridFitType(): string {
      somewhatImplemented("public flash.text.TextField::get gridFitType");
      return this._gridFitType;
    }
    set gridFitType(gridFitType: string) {
      gridFitType = asCoerceString(gridFitType);
      release || assert (flash.text.GridFitType.toNumber(gridFitType) >= 0);
      somewhatImplemented("public flash.text.TextField::set gridFitType");
      this._gridFitType = gridFitType;
    }

    get htmlText(): string {
      return this._htmlText;
    }

    set htmlText(value: string) {
      somewhatImplemented("public flash.text.TextField::set htmlText");
      value = asCoerceString(value);
      // Flash resets the bold and italic flags when an html value is set on a text field created from a symbol.
      if (this._symbol) {
        this._defaultTextFormat.bold = false;
        this._defaultTextFormat.italic = false;
      }
      this._textContent.parseHtml(value, this._multiline);
      this._htmlText = value;
      this._invalidateContent();
    }

    get length(): number /*int*/ {
      return this._length;
    }

    get textInteractionMode(): string {
      notImplemented("public flash.text.TextField::get textInteractionMode"); return;
      // return this._textInteractionMode;
    }

    get maxChars(): number /*int*/ {
      return this._maxChars;
    }

    set maxChars(value: number /*int*/) {
      this._maxChars = value | 0;
    }

    get maxScrollH(): number /*int*/ {
      return this._maxScrollH;
    }

    get maxScrollV(): number /*int*/ {
      return this._maxScrollV;
    }

    get mouseWheelEnabled(): boolean {
      return this._mouseWheelEnabled;
    }

    set mouseWheelEnabled(value: boolean) {
      somewhatImplemented("public flash.text.TextField::set mouseWheelEnabled");
      this._mouseWheelEnabled = !!value;
    }

    get multiline(): boolean {
      return this._multiline;
    }

    set multiline(value: boolean) {
      this._multiline = !!value;
    }

    get numLines(): number /*int*/ {
      return this._numLines;
    }

    get displayAsPassword(): boolean {
      return this._displayAsPassword;
    }

    set displayAsPassword(value: boolean) {
      somewhatImplemented("public flash.text.TextField::set displayAsPassword");
      this._displayAsPassword = !!value;
    }

    get restrict(): string {
      return this._restrict;
    }

    set restrict(value: string) {
      somewhatImplemented("public flash.text.TextField::set restrict");
      this._restrict = asCoerceString(value);
    }

    get scrollH(): number /*int*/ {
      somewhatImplemented("public flash.text.TextField::get scrollH");
      return this._scrollH;
    }
    set scrollH(value: number /*int*/) {
      value = value | 0;
      somewhatImplemented("public flash.text.TextField::set scrollH");
      this._scrollH = value;
    }
    get scrollV(): number /*int*/ {
      somewhatImplemented("public flash.text.TextField::get scrollV");
      return this._scrollV;
    }
    set scrollV(value: number /*int*/) {
      value = value | 0;
      somewhatImplemented("public flash.text.TextField::set scrollV");
      this._scrollV = value;
    }

    get selectable(): boolean {
      return this._selectable;
    }

    set selectable(value: boolean) {
      somewhatImplemented("public flash.text.TextField::set selectable");
      this._selectable = !!value;
    }

    get selectionBeginIndex(): number /*int*/ {
      return this._selectionBeginIndex;
    }

    get selectionEndIndex(): number /*int*/ {
      return this._selectionEndIndex;
    }

    get sharpness(): number {
      return this._sharpness;
    }

    set sharpness(value: number) {
      this._sharpness = clamp(+value, -400, 400);
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
      return this._textContent.plainText;
    }

    set text(value: string) {
      somewhatImplemented("public flash.text.TextField::set text");
      this._textContent.plainText = asCoerceString(value);
      this._invalidateContent();
    }

    get textColor(): number /*uint*/ {
      return this._textColor < 0 ? +this._defaultTextFormat.color : this._textColor;
    }

    set textColor(value: number /*uint*/) {
      this._textColor = value >>> 0;
    }

    get textHeight(): number {
      this._ensureLineMetrics();
      return (this._textHeight / 20) | 0;
    }

    get textWidth(): number {
      this._ensureLineMetrics();
      return (this._textWidth / 20) | 0;
    }

    get thickness(): number {
      return this._thickness;
    }

    set thickness(value: number) {
      this._thickness = clamp(+value, -200, 200);
    }

    get type(): string {
      return this._type;
    }

    set type(value: string) {
      this._type = asCoerceString(value);
    }

    get wordWrap(): boolean {
      return this._textContent.wordWrap;
    }

    set wordWrap(value: boolean) {
      value = !!value;
      if (value === this._textContent.wordWrap) {
        return;
      }
      this._textContent.wordWrap = !!value;
      this._invalidateContent();
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

    private _ensureLineMetrics() {
      if (!this._hasFlags(DisplayObjectFlags.DirtyTextContent)) {
        return;
      }
      var serializer = Shumway.AVM2.Runtime.AVM2.instance.globals['Shumway.Player.Utils'];
      var lineMetricsData = serializer.syncDisplayObject(this, false);
      var textWidth = lineMetricsData.readInt();
      var textHeight = lineMetricsData.readInt();
      var offsetX = lineMetricsData.readInt();
      if (this._autoSize !== TextFieldAutoSize.NONE) {
        this._fillBounds.xMin = this._lineBounds.xMin = offsetX;
        this._fillBounds.xMax = this._lineBounds.xMax = offsetX + textWidth + 80;
        this._fillBounds.yMax = this._lineBounds.yMax = this._lineBounds.yMin + textHeight + 80;
      }
      this._textWidth = textWidth;
      this._textHeight = textHeight;
      this._numLines = lineMetricsData.readInt();
      this._lineMetricsData = lineMetricsData;
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
      if (lineIndex < 0 || lineIndex > this._numLines - 1) {
        throwError('RangeError', Errors.ParamRangeError);
      }
      this._ensureLineMetrics();
      var lineMetricsData = this._lineMetricsData;
      lineMetricsData.position = 12 + lineIndex * 20;
      var x = lineMetricsData.readInt();
      var width = lineMetricsData.readInt();
      var ascent = lineMetricsData.readInt();
      var descent = lineMetricsData.readInt();
      var leading = lineMetricsData.readInt();
      var height = ascent + descent + leading;
      return new TextLineMetrics(x, width, height, ascent, descent, leading);
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
      var textRuns = this._textContent.textRuns;
      var result = [];
      for (var i = 0; i < textRuns.length; i++) {
        var textRun = textRuns[i];
        if (textRun.beginIndex >= beginIndex && textRun.endIndex <= endIndex) {
          result.push(textRun.clone());
        }
      }
      return result;
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
      somewhatImplemented("public flash.text.TextField::replaceText");
      var plainText = this._textContent.plainText;
      this._textContent.plainText = plainText.substring(0, beginIndex) + newText + plainText.substring(endIndex);
    }
    setSelection(beginIndex: number /*int*/, endIndex: number /*int*/): void {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      notImplemented("public flash.text.TextField::setSelection"); return;
    }
    setTextFormat(format: flash.text.TextFormat, beginIndex: number /*int*/ = -1, endIndex: number /*int*/ = -1): void {
      format = format; beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      somewhatImplemented("public flash.text.TextField::setTextFormat"); return;
    }
    getImageReference(id: string): flash.display.DisplayObject {
      id = "" + id;
      notImplemented("public flash.text.TextField::getImageReference"); return;
    }
  }
}
