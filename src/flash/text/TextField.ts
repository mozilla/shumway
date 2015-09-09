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
module Shumway.AVMX.AS.flash.text {
  import notImplemented = Shumway.Debug.notImplemented;
  import assert = Shumway.Debug.assert;
  import warning = Shumway.Debug.warning;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import clamp = Shumway.NumberUtilities.clamp;

  import DisplayObjectFlags = flash.display.DisplayObjectFlags;
  import DisplayObjectDirtyFlags = flash.display.DisplayObjectDirtyFlags;

  import TextTag = Shumway.SWF.Parser.TextTag;
  import TextFlags = Shumway.SWF.Parser.TextFlags;
  import TextRecord = Shumway.SWF.Parser.TextRecord;
  import TextRecordFlags = Shumway.SWF.Parser.TextRecordFlags;

  export class TextField extends flash.display.InteractiveObject {

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    static classInitializer: any = null;

    _symbol: TextSymbol;

    applySymbol() {
      this._initializeFields();
      release || assert(this._symbol);
      var symbol = this._symbol;
      this._setFillAndLineBoundsFromSymbol(symbol);
      var defaultTextFormat = this._textContent.defaultTextFormat;
      defaultTextFormat.color = symbol.color;
      defaultTextFormat.size = (symbol.size / 20) | 0;
      defaultTextFormat.font = symbol.face;
      defaultTextFormat.bold = symbol.bold;
      defaultTextFormat.italic = symbol.italic;
      defaultTextFormat.align = symbol.align;
      defaultTextFormat.leftMargin = (symbol.leftMargin / 20) | 0;
      defaultTextFormat.rightMargin = (symbol.rightMargin / 20) | 0;
      defaultTextFormat.indent = (symbol.indent / 20) | 0;
      defaultTextFormat.leading = (symbol.leading / 20) | 0;
      this._multiline = symbol.multiline;
      this._embedFonts = symbol.embedFonts;
      this._selectable = symbol.selectable;
      this._displayAsPassword = symbol.displayAsPassword;
      this._type = symbol.type;
      this._maxChars = symbol.maxChars;
      if (symbol.border) {
        this.background = true;
        this.border = true;
      }
      if (symbol.html) {
        this.htmlText = symbol.initialText;
      } else {
        this.text = symbol.initialText;
      }
      this.wordWrap = symbol.wordWrap;
      this.autoSize = symbol.autoSize;
    }
    constructor() {
      super();
      if (!this._fieldsInitialized) {
        this._initializeFields();
      }
      if (!this._symbol) {
        this._setFillAndLineBoundsFromWidthAndHeight(100 * 20, 100 * 20);
      }
    }

    protected _initializeFields(): void {
      super._initializeFields();
      this._alwaysShowSelection = false;
      this._antiAliasType = AntiAliasType.NORMAL;
      this._autoSize = TextFieldAutoSize.NONE;
      this._background = false;
      this._backgroundColor = 0xffffffff;
      this._border = false;
      this._borderColor = 0x000000ff;
      this._bottomScrollV = 1;
      this._caretIndex = 0;
      this._condenseWhite = false;
      this._embedFonts = false;
      this._gridFitType = GridFitType.PIXEL;
      this._htmlText = '';
      this._length = 0;
      this._textInteractionMode = TextInteractionMode.NORMAL;
      this._maxChars = 0;
      this._maxScrollH = 0;
      this._maxScrollV = 1;
      this._mouseWheelEnabled = false;
      this._multiline = false;
      this._numLines = 1;
      this._displayAsPassword = false;
      this._restrict = null;
      this._selectable = true;
      this._selectedText = '';
      this._selectionBeginIndex = 0;
      this._selectionEndIndex = 0;
      this._sharpness = 0;
      this._styleSheet = null;
      this._textColor = null;
      this._textHeight = 0;
      this._textWidth = 0;
      this._thickness = 0;
      this._type = TextFieldType.DYNAMIC;
      this._useRichTextClipboard = false;
      this._lineMetricsData = null;

      var defaultTextFormat = new this.sec.flash.text.TextFormat(
        this.sec.flash.text.Font.axClass.DEFAULT_FONT_SERIF,
        12,
        0,
        false,
        false,
        false,
        '',
        '',
        TextFormatAlign.LEFT
      );
      defaultTextFormat.letterSpacing = 0;
      defaultTextFormat.kerning = 0;
      this._textContent = new Shumway.TextContent(this.sec, defaultTextFormat);
    }

    _setFillAndLineBoundsFromSymbol(symbol: Timeline.DisplaySymbol) {
      super._setFillAndLineBoundsFromSymbol(symbol);
      this._textContent.bounds = this._lineBounds;
      this._invalidateContent();
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

    _containsPointDirectly(localX: number, localY: number,
                           globalX: number, globalY: number): boolean {
      // If this override is reached, the content bounds have already been checked, which is all
      // we need to do.
      release || assert(this._getContentBounds().contains(localX, localY));
      return true;
    }

    private _invalidateContent() {
      if (this._textContent.flags & Shumway.TextContentFlags.Dirty) {
        this._setDirtyFlags(DisplayObjectDirtyFlags.DirtyTextContent);
      }
    }

    _textContent: Shumway.TextContent;
    _lineMetricsData: DataBuffer;

    // JS -> AS Bindings

    //selectedText: string;
    //appendText: (newText: string) => void;
    //getXMLText: (beginIndex: number /*int*/ = 0, endIndex: number /*int*/ = 2147483647) =>
    // string;
    //insertXMLText: (beginIndex: number /*int*/, endIndex: number /*int*/, richText: string,
    // pasting: boolean = false) => void; copyRichText: () => string; pasteRichText: (richText:
    // string) => boolean;

    // AS -> JS Bindings
    static isFontCompatible(fontName: string, fontStyle: string): boolean {
      fontName = axCoerceString(fontName);
      fontStyle = axCoerceString(fontStyle);
      var font = Font.getByNameAndStyle(fontName, fontStyle);
      if (!font) {
        return false;
      }
      return font.fontStyle === fontStyle;
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
      this._alwaysShowSelection = !!value;
    }

    get antiAliasType(): string {
      return this._antiAliasType;
    }

    set antiAliasType(antiAliasType: string) {
      if (isNullOrUndefined(antiAliasType)) {
        this.sec.throwError('TypeError', Errors.NullPointerError, 'antiAliasType');
      }
      antiAliasType = axCoerceString(antiAliasType);
      if (AntiAliasType.toNumber(antiAliasType) < 0) {
        this.sec.throwError("ArgumentError", Errors.InvalidParamError, "antiAliasType");
      }
      this._antiAliasType = antiAliasType;
    }

    get autoSize(): string {
      return this._autoSize;
    }

    set autoSize(value: string) {
      if (isNullOrUndefined(value)) {
        this.sec.throwError('TypeError', Errors.NullPointerError, 'autoSize');
      }
      value = axCoerceString(value);
      if (value === this._autoSize) {
        return;
      }
      if (TextFieldAutoSize.toNumber(value) < 0) {
        this.sec.throwError("ArgumentError", Errors.InvalidParamError, "autoSize");
      }
      this._autoSize = value;
      this._textContent.autoSize = TextFieldAutoSize.toNumber(value);
      this._invalidateContent();
      this._ensureLineMetrics();
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
      this._setDirtyFlags(DisplayObjectDirtyFlags.DirtyTextContent);
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
        this._setDirtyFlags(DisplayObjectDirtyFlags.DirtyTextContent);
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
      this._setDirtyFlags(DisplayObjectDirtyFlags.DirtyTextContent);
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
        this._setDirtyFlags(DisplayObjectDirtyFlags.DirtyTextContent);
      }
    }

    // Returns bottommost line that is currently visible.
    get bottomScrollV(): number /*int*/ {
      return this._bottomScrollV;
    }

    get caretIndex(): number /*int*/ {
      release || notImplemented("public flash.text.TextField::get caretIndex"); return;
      // return this._caretIndex;
    }

    get condenseWhite(): boolean {
      return this._condenseWhite;
    }

    set condenseWhite(value: boolean) {
      this._condenseWhite = !!value;
    }

    get defaultTextFormat(): flash.text.TextFormat {
      return this._textContent.defaultTextFormat.clone();
    }

    set defaultTextFormat(format: flash.text.TextFormat) {
      if (isNullOrUndefined(format)) {
        this.sec.throwError('TypeError', Errors.NullPointerError, 'format');
      }
      var defaultTextFormat = this._textContent.defaultTextFormat;
      defaultTextFormat.merge(format);
      if (defaultTextFormat.color === null) {
        defaultTextFormat.color = this._textColor;
      } else {
        this._textColor = +defaultTextFormat.color;
      }
    }

    get embedFonts(): boolean {
      return this._embedFonts;
    }

    set embedFonts(value: boolean) {
      this._embedFonts = !!value;
    }

    get gridFitType(): string {
      return this._gridFitType;
    }

    set gridFitType(gridFitType: string) {
      if (isNullOrUndefined(gridFitType)) {
        this.sec.throwError('TypeError', Errors.NullPointerError, 'gridFitType');
      }
      gridFitType = axCoerceString(gridFitType);
      release || assert (flash.text.GridFitType.toNumber(gridFitType) >= 0);
      this._gridFitType = gridFitType;
    }

    get htmlText(): string {
      return this._htmlText;
    }

    set htmlText(value: string) {
      if (isNullOrUndefined(value)) {
        this.sec.throwError('TypeError', Errors.NullPointerError, 'value');
      }
      value = axCoerceString(value);
      // Flash resets the bold and italic flags when an html value is set on a text field created
      // from a symbol.
      if (this._symbol) {
        this._textContent.defaultTextFormat.bold = false;
        this._textContent.defaultTextFormat.italic = false;
      }
      this._textContent.parseHtml(value, this._styleSheet, this._multiline);
      this._htmlText = value;
      this._invalidateContent();
      this._ensureLineMetrics();
    }

    get length(): number /*int*/ {
      return this._length;
    }

    get textInteractionMode(): string {
      release || notImplemented("public flash.text.TextField::get textInteractionMode"); return;
      // return this._textInteractionMode;
    }

    get maxChars(): number /*int*/ {
      return this._maxChars;
    }

    set maxChars(value: number /*int*/) {
      this._maxChars = value | 0;
    }

    get maxScrollH(): number /*int*/ {
      this._ensureLineMetrics();
      return this._maxScrollH;
    }

    get maxScrollV(): number /*int*/ {
      this._ensureLineMetrics();
      return this._maxScrollV;
    }

    get mouseWheelEnabled(): boolean {
      return this._mouseWheelEnabled;
    }

    set mouseWheelEnabled(value: boolean) {
      release || somewhatImplemented("public flash.text.TextField::set mouseWheelEnabled");
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
      release || somewhatImplemented("public flash.text.TextField::set displayAsPassword");
      this._displayAsPassword = !!value;
    }

    get restrict(): string {
      return this._restrict;
    }

    set restrict(value: string) {
      release || somewhatImplemented("public flash.text.TextField::set restrict");
      this._restrict = axCoerceString(value);
    }

    // Returns the current vertical scrolling position in lines.
    get scrollH(): number /*int*/ {
      return this._textContent.scrollH;
    }

    set scrollH(value: number /*int*/) {
      value = value | 0;
      this._ensureLineMetrics();
      this._textContent.scrollH = clamp(Math.abs(value), 0, this._maxScrollH);
      this._invalidateContent();
    }

    // Returns the current horizontal scrolling position in pixels.
    get scrollV(): number /*int*/ {
      return this._textContent.scrollV;
    }

    set scrollV(value: number /*int*/) {
      value = value | 0;
      this._ensureLineMetrics();
      this._textContent.scrollV = clamp(value, 1, this._maxScrollV);
      this._invalidateContent();
    }

    get selectable(): boolean {
      return this._selectable;
    }

    set selectable(value: boolean) {
      this._selectable = !!value;
    }

    get selectedText(): string {
      return this._textContent.plainText.substring(this._selectionBeginIndex, this._selectionEndIndex);
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
      return this._styleSheet;
    }

    set styleSheet(value: flash.text.StyleSheet) {
      this._styleSheet = value;
    }

    get text(): string {
      return this._textContent.plainText;
    }

    set text(value: string) {
      if (isNullOrUndefined(value)) {
        this.sec.throwError('TypeError', Errors.NullPointerError, 'value');
      }
      value = axCoerceString(value) || '';
      if (value === this._textContent.plainText) {
        return;
      }
      this._textContent.plainText = value;
      this._invalidateContent();
      this._ensureLineMetrics();
    }

    get textColor(): number /*uint*/ {
      return this._textColor === null ? +this._textContent.defaultTextFormat.color : this._textColor;
    }

    set textColor(value: number /*uint*/) {
      this._textColor = this._textContent.defaultTextFormat.color =  value >>> 0;
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
      this._type = axCoerceString(value);
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
      release || notImplemented("public flash.text.TextField::get useRichTextClipboard"); return;
      // return this._useRichTextClipboard;
    }
    set useRichTextClipboard(value: boolean) {
      value = !!value;
      release || notImplemented("public flash.text.TextField::set useRichTextClipboard"); return;
      // this._useRichTextClipboard = value;
    }

    copyRichText() {
      release || notImplemented("public flash.text.TextField::copyRichText");
    }
    pasteRichText(richText: string) {
      richText = axCoerceString(richText);
      release || notImplemented("public flash.text.TextField::pasteRichText");
    }

    getXMLText(beginIndex: number, endIndex: number = 2147483647): string {
      beginIndex = +beginIndex;
      endIndex = +endIndex;
      release || notImplemented("public flash.text.TextField::getXMLText");
      return "";
    }
    insertXMLText(beginIndex: number, endIndex: number, richText: String, pasting: Boolean): void {
      beginIndex = +beginIndex;
      endIndex = +endIndex;
      richText = axCoerceString(richText);
      pasting = !!pasting;
      release || notImplemented("public flash.text.TextField::insertXMLText");
    }

    private _ensureLineMetrics() {
      if (!this._hasDirtyFlags(DisplayObjectDirtyFlags.DirtyTextContent)) {
        return;
      }
      var serializer = this.sec.player;
      var lineMetricsData = serializer.syncDisplayObject(this, false);
      var textWidth = lineMetricsData.readInt();
      var textHeight = lineMetricsData.readInt();
      var offsetX = lineMetricsData.readInt();
      var bounds = this._lineBounds;
      if (this._autoSize !== TextFieldAutoSize.NONE) {
        bounds.xMin = bounds.xMin = offsetX;
        bounds.xMax = bounds.xMax = offsetX + textWidth + 80;
        bounds.yMax = bounds.yMax = bounds.yMin + textHeight + 80;
      }
      this._textWidth = textWidth;
      this._textHeight = textHeight;
      this._numLines = lineMetricsData.readInt();
      this._lineMetricsData = lineMetricsData;
      if (this._textHeight > bounds.height) {
        var maxScrollV = 1;
        var bottomScrollV = 1;
        lineMetricsData.position = 16;
        var y = 0;
        for (var i = 0; i < this._numLines; i++) {
          lineMetricsData.position += 8;
          var ascent = lineMetricsData.readInt();
          var descent = lineMetricsData.readInt();
          var leading = lineMetricsData.readInt();
          var height = ascent + descent + leading;
          if (y > bounds.height / 20) {
            maxScrollV++;
          } else {
            bottomScrollV++;
          }
          y += height;
        }
        this._maxScrollV = maxScrollV;
        this._bottomScrollV = bottomScrollV;
      }
      if (this._textWidth > bounds.width) {
        this._maxScrollH = (((this._textWidth + 80) - bounds.width) / 20) | 0;
      } else {
        this._maxScrollH = 0;
      }
    }

    appendText(newText: string) {
      this._textContent.appendText(axCoerceString(newText));
    }

    getCharBoundaries(charIndex: number /*int*/): flash.geom.Rectangle {
      charIndex = charIndex | 0;
      release || somewhatImplemented("public flash.text.TextField::getCharBoundaries");
      var fakeCharHeight = this.textHeight, fakeCharWidth = fakeCharHeight * 0.75;
      return new this.sec.flash.geom.Rectangle(charIndex * fakeCharWidth, 0,
                                                          fakeCharWidth, fakeCharHeight);
    }
    getCharIndexAtPoint(x: number, y: number): number /*int*/ {
      x = +x; y = +y;
      release || notImplemented("public flash.text.TextField::getCharIndexAtPoint"); return;
    }
    getFirstCharInParagraph(charIndex: number /*int*/): number /*int*/ {
      charIndex = charIndex | 0;
      release || notImplemented("public flash.text.TextField::getFirstCharInParagraph"); return;
    }
    getLineIndexAtPoint(x: number, y: number): number /*int*/ {
      x = +x; y = +y;
      release || notImplemented("public flash.text.TextField::getLineIndexAtPoint"); return;
    }
    getLineIndexOfChar(charIndex: number /*int*/): number /*int*/ {
      charIndex = charIndex | 0;
      release || notImplemented("public flash.text.TextField::getLineIndexOfChar"); return;
    }
    getLineLength(lineIndex: number /*int*/): number /*int*/ {
      lineIndex = lineIndex | 0;
      release || notImplemented("public flash.text.TextField::getLineLength"); return;
    }

    getLineMetrics(lineIndex: number /*int*/): flash.text.TextLineMetrics {
      lineIndex = lineIndex | 0;
      if (lineIndex < 0 || lineIndex > this._numLines - 1) {
        this.sec.throwError('RangeError', Errors.ParamRangeError);
      }
      this._ensureLineMetrics();
      var lineMetricsData = this._lineMetricsData;
      lineMetricsData.position = 16 + lineIndex * 20;
      // The lines left position includes the gutter widths (it should also include the the margin
      // and indent, which we don't support yet).
      var x = lineMetricsData.readInt() + this._lineBounds.xMin + 2;
      var width = lineMetricsData.readInt();
      var ascent = lineMetricsData.readInt();
      var descent = lineMetricsData.readInt();
      var leading = lineMetricsData.readInt();
      var height = ascent + descent + leading;
      return new this.sec.flash.text.TextLineMetrics(x, width, height, ascent, descent,
                                                                leading);
    }

    getLineOffset(lineIndex: number /*int*/): number /*int*/ {
      lineIndex = lineIndex | 0;
      var lines = this._textContent.plainText.split('\r');
      if (lineIndex < 0 || lineIndex >= lines.length) {
        this.sec.throwError('RangeError', Errors.ParamRangeError);
      }
      var offset = 0;
      for (var i = 0; i < lineIndex; i++) {
        offset += lines[i].length + 1; // Length + `\r`
      }
      // TODO:  I've tried modifying the width of the text field so that lines wrap, but this doesn't seem
      // to have any effect on how line offsets are computed. I'm leaving in the |somewhatImplemented| call
      // since this is not fully tested.
      release || release || somewhatImplemented("public flash.text.TextField::getLineOffset");
      return offset;
    }
    getLineText(lineIndex: number /*int*/): string {
      lineIndex = lineIndex | 0;
      var lines = this._textContent.plainText.split('\r');
      if (lineIndex < 0 || lineIndex >= lines.length) {
        this.sec.throwError('RangeError', Errors.ParamRangeError);
      }
      return lines[lineIndex];
    }
    getParagraphLength(charIndex: number /*int*/): number /*int*/ {
      charIndex = charIndex | 0;
      release || notImplemented("public flash.text.TextField::getParagraphLength"); return;
    }

    /**
     * Returns a TextFormat object that contains the intersection of formatting information for the
     * range of text between |beginIndex| and |endIndex|.
     */
    getTextFormat(beginIndex: number /*int*/ = -1, endIndex: number /*int*/ = -1): flash.text.TextFormat {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      var plainText = this._textContent.plainText;
      var maxIndex = plainText.length;
      if (beginIndex < 0) {
        beginIndex = 0;
        if (endIndex < 0) {
          endIndex = maxIndex;
        }
      } else {
        if (endIndex < 0) {
          endIndex = beginIndex + 1;
        }
      }
      if (endIndex <= beginIndex || endIndex > maxIndex) {
        this.sec.throwError('RangeError', Errors.ParamRangeError);
      }
      var format: TextFormat;
      var textRuns = this._textContent.textRuns;
      for (var i = 0; i < textRuns.length; i++) {
        var run = textRuns[i];
        if (run.intersects(beginIndex, endIndex)) {
          if (format) {
            format.intersect(run.textFormat);
          } else {
            format = run.textFormat.clone();
          }
        }
      }
      return format;
    }

    getTextRuns(beginIndex: number /*int*/ = 0, endIndex: number /*int*/ = 2147483647): ASArray {
      var textRuns = this._textContent.textRuns;
      var result = [];
      for (var i = 0; i < textRuns.length; i++) {
        var textRun = textRuns[i];
        if (textRun.beginIndex >= beginIndex && textRun.endIndex <= endIndex) {
          result.push(textRun.clone());
        }
      }
      return this.sec.createArrayUnsafe(result);
    }

    getRawText(): string {
      release || notImplemented("public flash.text.TextField::getRawText"); return;
    }

    replaceSelectedText(value: string): void {
      value = "" + value;
      this.replaceText(this._selectionBeginIndex, this._selectionEndIndex, value);
    }

    replaceText(beginIndex: number /*int*/, endIndex: number /*int*/, newText: string): void {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0; newText = "" + newText;
      if (beginIndex < 0 || endIndex < 0) {
        return;
      }
      this._textContent.replaceText(beginIndex, endIndex, newText);
      this._invalidateContent();
      this._ensureLineMetrics();
    }

    setSelection(beginIndex: number /*int*/, endIndex: number /*int*/): void {
      this._selectionBeginIndex = beginIndex | 0;
      this._selectionEndIndex = endIndex | 0;
    }

    setTextFormat(format: flash.text.TextFormat, beginIndex: number /*int*/ = -1, endIndex: number /*int*/ = -1): void {
      format = format; beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      var plainText = this._textContent.plainText;
      var maxIndex = plainText.length;
      if (beginIndex < 0) {
        beginIndex = 0;
        if (endIndex < 0) {
          endIndex = maxIndex;
        }
      } else {
        if (endIndex < 0) {
          endIndex = beginIndex + 1;
        }
      }
      if (beginIndex > maxIndex || endIndex > maxIndex) {
        this.sec.throwError('RangeError', Errors.ParamRangeError);
      }
      if (endIndex <= beginIndex) {
        return;
      }
      var subText = plainText.substring(beginIndex, endIndex);
      this._textContent.replaceText(beginIndex, endIndex, subText, format);
      this._invalidateContent();
      this._ensureLineMetrics();
    }

    getImageReference(id: string): flash.display.DisplayObject {
      //id = "" + id;
      release || notImplemented("public flash.text.TextField::getImageReference"); return;
    }
  }

  export class TextSymbol extends Timeline.DisplaySymbol {
    color: number = 0;
    size: number = 0;
    face: string = "";
    bold: boolean = false;
    italic: boolean = false;
    align: string = flash.text.TextFormatAlign.LEFT;
    leftMargin: number = 0;
    rightMargin: number = 0;
    indent: number = 0;
    leading: number = 0;
    multiline: boolean = false;
    wordWrap: boolean = false;
    embedFonts: boolean = false;
    selectable: boolean = true;
    border: boolean = false;
    initialText: string = "";
    html: boolean = false;
    displayAsPassword: boolean = false;
    type: string = flash.text.TextFieldType.DYNAMIC;
    maxChars: number = 0;
    autoSize: string = flash.text.TextFieldAutoSize.NONE;
    variableName: string = null;
    textContent: Shumway.TextContent = null;

    constructor(data: Timeline.SymbolData, sec: ISecurityDomain) {
      super(data, sec.flash.text.TextField.axClass, true);
    }

    static FromTextData(data: any, loaderInfo: flash.display.LoaderInfo): TextSymbol {
      var sec = loaderInfo.sec;
      var symbol = new TextSymbol(data, sec);
      symbol._setBoundsFromData(data);
      var tag = <TextTag>data.tag;
      if (data.static) {
        symbol.dynamic = false;
        symbol.symbolClass = sec.flash.text.StaticText.axClass;
        if (tag.initialText) {
          var textContent = new Shumway.TextContent(sec);
          textContent.bounds = symbol.lineBounds;
          textContent.parseHtml(tag.initialText, null, false);
          textContent.matrix = new sec.flash.geom.Matrix();
          textContent.matrix.copyFromUntyped(data.matrix);
          textContent.coords = data.coords;
          symbol.textContent = textContent;
        }
      }
      if (tag.flags & TextFlags.HasColor) {
        symbol.color = tag.color >>> 8;
      }
      if (tag.flags & TextFlags.HasFont) {
        symbol.size = tag.fontHeight;
        // Requesting the font symbol guarantees that it's loaded and initialized.
        var fontSymbol = <flash.text.FontSymbol>loaderInfo.getSymbolById(tag.fontId);
        if (fontSymbol) {
          symbol.face = tag.flags & TextFlags.UseOutlines ?
                        fontSymbol.name :
                        'swffont' + fontSymbol.syncId;
          symbol.bold = fontSymbol.bold;
          symbol.italic = fontSymbol.italic;
        } else {
          warning("Font " + tag.fontId + " is not defined.");
        }
      }
      if (tag.flags & TextFlags.HasLayout) {
        symbol.align = flash.text.TextFormatAlign.fromNumber(tag.align);
        symbol.leftMargin = tag.leftMargin;
        symbol.rightMargin = tag.rightMargin;
        symbol.indent = tag.indent;
        symbol.leading = tag.leading;
      }
      symbol.multiline = !!(tag.flags & TextFlags.Multiline);
      symbol.wordWrap = !!(tag.flags & TextFlags.WordWrap);
      symbol.embedFonts = !!(tag.flags & TextFlags.UseOutlines);
      symbol.selectable = !(tag.flags & TextFlags.NoSelect);
      symbol.border = !!(tag.flags & TextFlags.Border);
      if (tag.flags & TextFlags.HasText) {
        symbol.initialText = tag.initialText;
      }
      symbol.html = !!(tag.flags & TextFlags.Html);
      symbol.displayAsPassword = !!(tag.flags & TextFlags.Password);
      symbol.type = tag.flags & TextFlags.ReadOnly ?
                    flash.text.TextFieldType.DYNAMIC :
                    flash.text.TextFieldType.INPUT;
      if (tag.flags & TextFlags.HasMaxLength) {
        symbol.maxChars = tag.maxLength;
      }
      symbol.autoSize = tag.flags & TextFlags.AutoSize ?
                        flash.text.TextFieldAutoSize.LEFT :
                        flash.text.TextFieldAutoSize.NONE;
      symbol.variableName = tag.variableName;
      return symbol;
    }

    /**
     * Turns raw DefineLabel tag data into an object that's consumable as a text symbol and then
     * passes that into `FromTextData`, returning the resulting TextSymbol.
     *
     * This has to be done outside the SWF parser because it relies on any used fonts being
     * available as symbols, which isn't the case in the SWF parser.
     */
    static FromLabelData(data: any, loaderInfo: flash.display.LoaderInfo): TextSymbol {
      var bounds = data.fillBounds;
      var records: TextRecord[] = data.records;
      var coords = data.coords = [];
      var htmlText = '';
      var size = 12;
      var face = 'Times Roman';
      var bold = false;
      var italic = false;
      var color = 0;
      var x = 0;
      var y = 0;
      var codes: number[];
      for (var i = 0; i < records.length; i++) {
        var record = records[i];
        if (record.flags & TextRecordFlags.HasFont) {
          var fontSymbol = <flash.text.FontSymbol>loaderInfo.getSymbolById(record.fontId);
          if (fontSymbol) {
            codes = fontSymbol.codes;
            size = record.fontHeight;
            if (!fontSymbol.originalSize) {
              size /= 20;
            }
            face = fontSymbol.metrics ? 'swffont' + fontSymbol.syncId : fontSymbol.name;
            bold = fontSymbol.bold;
            italic = fontSymbol.italic;
          } else {
            Debug.warning('Label ' + data.id + 'refers to undefined font symbol ' + record.fontId);
          }
        }
        if (record.flags & TextRecordFlags.HasColor) {
          color = record.color >>> 8;
        }
        if (record.flags & TextRecordFlags.HasMoveX) {
          x = record.moveX;
          if (x < bounds.xMin) {
            bounds.xMin = x;
          }
        }
        if (record.flags & TextRecordFlags.HasMoveY) {
          y = record.moveY;
          if (y < bounds.yMin) {
            bounds.yMin = y;
          }
        }
        var text = '';
        var entries = record.entries;
        var j = 0;
        var entry;
        while ((entry = entries[j++])) {
          var code = codes[entry.glyphIndex];
          release || assert(code, 'undefined label glyph');
          var char = String.fromCharCode(code);
          text += charEscapeMap[char] || char;
          coords.push(x, y);
          x += entry.advance;
        }
        if (italic) {
          text = '<i>' + text + '</i>';
        }
        if (bold) {
          text = '<b>' + text + '</b>';
        }
        htmlText += '<font size="' + size + '" face="' + face + '"' + ' color="#' +
                    ('000000' + color.toString(16)).slice(-6) + '">' + text + '</font>';
      }
      data.tag.initialText = htmlText;
      return TextSymbol.FromTextData(data, loaderInfo);
    }
  }

  var charEscapeMap = {'<': '&lt;', '>': '&gt;', '&' : '&amp;'};

}
