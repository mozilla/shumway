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
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import TextFieldType = flash.text.TextFieldType;
  import TextFieldAutosize = flash.text.TextFieldAutoSize;
  export class TextField extends flash.display.InteractiveObject {

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    static classInitializer: any = null;

    static initializer: any = function (symbol: Shumway.Timeline.TextSymbol) {
      this._bbox = {xMin: 0, yMin: 0, xMax: 2000, yMax: 2000};
      var initialFormat = this._defaultTextFormat = new NativeTextFormat();
      initialFormat.align = 'LEFT';
      initialFormat.fontObj = null;
      initialFormat.face = 'serif';
      initialFormat.size = 12;
      initialFormat.letterSpacing = 0;
      initialFormat.kerning = 0;
      initialFormat.color = 0;
      initialFormat.leading = 0;
      initialFormat.bold = false;
      initialFormat.italic = false;

      this._type = 'dynamic';
      this._embedFonts = false;
      this._selectable = true;
      this._autoSize = 'none';
      this._scrollV = 1;
      this._maxScrollV = 1;
      this._bottomScrollV = 1;
      this._background = false;
      this._border = false;
      this._backgroundColor = 0xffffff;
      this._backgroundColorStr = "#ffffff";
      this._borderColor = 0x0;
      this._borderColorStr = "#000000";
      this._text = '';
      this._htmlText = '';
      this._condenseWhite = false;
      this._multiline = false;
      this._wordWrap = false;
      this._textColor = 0;

      var s = symbol;
      if (!s) {
        this._matrix.tx -= 40;
        this._matrix.ty -= 40;
        this._text = '';
        return;
      }

      //var bbox = tag.bbox;
      //if (bbox) {
      //  this._matrix.tx += bbox.xMin;
      //  this._matrix.ty += bbox.yMin;
      //  this._bbox.xMax = bbox.xMax - bbox.xMin;
      //  this._bbox.yMax = bbox.yMax - bbox.yMin;
      //}

      //if (tag.hasLayout) {
      //  initialFormat.size = tag.fontHeight / 20;
      //  initialFormat.leading = (tag.leading | 0) / 20;
      //}
      //if (tag.hasColor) {
      //  var colorObj = tag.color;
      //  var color = (colorObj.red << 24) |
      //              (colorObj.green << 16) |
      //              (colorObj.blue << 8) |
      //              colorObj.alpha;
      //  initialFormat.color = this._textColor = color;
      //}
      //if (tag.hasFont) {
      //  var font = Font.getFontBySymbolId(tag.fontId);
      //  if (font) {
      //    initialFormat.fontObj = font;
      //    initialFormat.face = font._fontName;
      //    initialFormat.bold = font.symbol.bold;
      //    initialFormat.italic = font.symbol.italic;
      //  }
      //}

      //this._multiline = !!tag.multiline;
      //this._wordWrap = !!tag.wordWrap;

      //this._embedFonts = !!tag.useOutlines;
      //this._selectable = !tag.noSelect;
      //// TODO: Find out how the IDE causes textfields to have a background
      //this._border = !!tag.border;

      //switch (tag.align) {
      //  case 1:
      //    initialFormat.align = 'RIGHT';
      //    break;
      //  case 2:
      //    initialFormat.align = 'CENTER';
      //    break;
      //  case 3:
      //    initialFormat.align = 'JUSTIFIED';
      //    break;
      //  default: // 'left' is pre-set
      //}

      //if (tag.initialText) {
      //  if (tag.html) {
      //    this._htmlText = tag.initialText;
      //  } else {
      //    this._text = tag.initialText;
      //  }
      //} else {
      //  this._text = '';
      //}
    };

    constructor() {
      super();
      notImplemented("Dummy Constructor: public flash.text.TextField");
    }

    private invalidateDimensions() {
      this._invalidateBounds();
      this._invalidatePaint();
      this._dimensionsValid = false;
    }

    private ensureDimensions() {
      notImplemented("ensureDimensions");
      /*
      if (this._dimensionsValid) {
        return;
      }

      var bounds = this._bbox;
      var diffX = 0;


      var message = new BinaryMessage();

      message.syncRenderable(this, function (data) {
        this._lines = data.lines;
        this._textWidth = data.textWidth;
        this._textHeight = data.textHeight;
        diffX = data.diffX;
        this._text = data.text;
        this._htmlText = data.htmlText;
      }.bind(this));
      message.post('render', true);

      var lines = this._lines;

      this._scrollV = 1;
      this._maxScrollV = 1;
      this._bottomScrollV = 1;
      var autoSize = this._autoSize;
      if (autoSize === 'none') {
        var maxVisibleY = (bounds.yMax - 80) / 20;
        if (this._textHeight > maxVisibleY) {
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.y + line.height > maxVisibleY) {
              this._maxScrollV = i + 1;
              this._bottomScrollV = i === 0 ? 1 : i;
              break;
            }
          }
        }
      } else {
        if (diffX) {
          this._invalidatePosition();
          this._matrix.tx += diffX * 20 | 0;
          bounds.xMax = (this._textWidth * 20 | 0) + 80;
        }
        bounds.yMax = (this._textHeight * 20 | 0) + 80;
        this._invalidateBounds();
      }

      this._dimensionsValid = true;
      */
    }


    // AS -> JS Bindings
    static isFontCompatible(fontName: string, fontStyle: string): boolean {
      fontName = asCoerceString(fontName);
      fontStyle = asCoerceString(fontStyle);
      somewhatImplemented("flash.text.TextField.isFontCompatible");
      return true;
    }

    _alwaysShowSelection: boolean = false;
    _antiAliasType: string = 'normal';

    _autoSize: string = 'none';

    _background: boolean = false;
    _backgroundColor: number /*uint*/ = 0xFFFFFF;
    _border: boolean = false;
    _borderColor: number /*uint*/ = 0x000000;

    _bbox: {xMin: number; xMax: number; yMin: number; yMax: number};
    _lines: TextLineMetrics[];
    _dimensionsValid: boolean;

    _bottomScrollV: number /*int*/ = 0;
    // _caretIndex: number /*int*/;
    _condenseWhite: boolean;
    _defaultTextFormat: NativeTextFormat;
    _embedFonts: boolean;
    _gridFitType: string;
    _textInteractionMode: string;
    _maxChars: number /*int*/;
    _maxScrollH: number /*int*/ = 0;
    _maxScrollV: number /*int*/ = 0;
    _mouseWheelEnabled: boolean;
    _multiline: boolean;
    _displayAsPassword: boolean;
    _restrict: string;
    _scrollH: number /*int*/ = 0;
    _scrollV: number /*int*/ = 0;
    _selectable: boolean;
    _selectedText: string;
    _selectionBeginIndex: number /*int*/;
    _selectionEndIndex: number /*int*/;
    _sharpness: number;
    // _styleSheet: flash.text.StyleSheet;
    _text: string;
    _htmlText: string;
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
      this._antiAliasType = asCoerceString(antiAliasType) === 'advanced' ? 'advanced' : 'normal';
    }

    get autoSize(): string {
      return this._autoSize;
    }

    set autoSize(value: string) {
      value = asCoerceString(value);
      if (TextFieldAutoSize.toNumber(value) < 0) {
        throwError("ArgumentError", Errors.InvalidParamError, "autoSize");
      }
      this._autoSize = value;
    }

    get background(): boolean {
      return this._background;
    }

    set background(value: boolean) {
      this._background = !!value;
    }

    get backgroundColor(): number /*uint*/ {
      return this._backgroundColor;
    }

    set backgroundColor(value: number /*uint*/) {
      this._backgroundColor = value >>> 0;
    }

    get border(): boolean {
      return this._border;
    }

    set border(value: boolean) {
      this._border = !!value;
    }

    get borderColor(): number /*uint*/ {
      return this._borderColor;
    }

    set borderColor(value: number /*uint*/) {
      this._borderColor = value >>> 0;
    }

    get bottomScrollV(): number /*int*/ {
      this.ensureDimensions();
      if (this._scrollV === 1) {
        return this._bottomScrollV;
      }
      var maxVisibleY = (this._bbox.yMax - 80) / 20;
      var lines = this._lines;
      var offsetY = lines[this._scrollV - 1].y;
      for (var i = this._bottomScrollV; i < lines.length; i++) {
        var line = lines[i];
        if (line.y + line.height + offsetY > maxVisibleY) {
          return i + 1;
        }
      }
    }

    get caretIndex(): number /*int*/ {
      notImplemented("public flash.text.TextField::get caretIndex");
      return;
      // return this._caretIndex;
    }

    get condenseWhite(): boolean {
      somewhatImplemented("public flash.text.TextField::get condenseWhite");
      return this._condenseWhite;
    }

    set condenseWhite(value: boolean) {
      somewhatImplemented("public flash.text.TextField::set condenseWhite");
      this._condenseWhite = !!value;
    }

    get defaultTextFormat(): flash.text.TextFormat {
      return new flash.text.TextFormat().fromNative(this._defaultTextFormat);
    }

    set defaultTextFormat(format: flash.text.TextFormat) {
      this._defaultTextFormat = format && format.toNative();
      this.invalidateDimensions();
    }

    get embedFonts(): boolean {
      return this._embedFonts;
    }

    set embedFonts(value: boolean) {
      this._embedFonts = !!value;
      this.invalidateDimensions();
    }

    get gridFitType(): string {
      somewhatImplemented("public flash.text.TextField::get gridFitType");
      return this._gridFitType;
    }

    set gridFitType(gridFitType: string) {
      gridFitType = asCoerceString(gridFitType);
      somewhatImplemented("public flash.text.TextField::set gridFitType");
      this._gridFitType = "" + gridFitType;
    }

    get htmlText(): string {
      this.ensureDimensions();
      return this._htmlText;
    }

    set htmlText(value: string) {
      this._htmlText = asCoerceString(value);
      this._text = '';
      this.invalidateDimensions();
    }

    get length(): number /*int*/ {
      return this._text.length;
    }

    get textInteractionMode(): string {
      somewhatImplemented("public flash.text.TextField::get textInteractionMode");
      return this._textInteractionMode;
    }

    get maxChars(): number /*int*/ {
      somewhatImplemented("public flash.text.TextField::get maxChars");
      return this._maxChars;
    }

    set maxChars(value: number /*int*/) {
      this._maxChars = value | 0;
      somewhatImplemented("public flash.text.TextField::set maxChars");
    }

    get maxScrollH(): number /*int*/ {
      return this._maxScrollH;
    }

    get maxScrollV(): number /*int*/ {
      return this._maxScrollV;
    }

    get mouseWheelEnabled(): boolean {
      somewhatImplemented("public flash.text.TextField::get mouseWheelEnabled");
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
      this.ensureDimensions();
      return this._lines.length;
    }

    get displayAsPassword(): boolean {
      somewhatImplemented("public flash.text.TextField::get displayAsPassword");
      return this._displayAsPassword;
    }

    set displayAsPassword(value: boolean) {
      somewhatImplemented("public flash.text.TextField::set displayAsPassword");
      this._displayAsPassword = !!value;
    }

    get restrict(): string {
      somewhatImplemented("public flash.text.TextField::get restrict");
      return this._restrict;
    }

    set restrict(value: string) {
      somewhatImplemented("public flash.text.TextField::set restrict");
      this._restrict = asCoerceString(value);
    }

    get scrollH(): number /*int*/ {
      return this._scrollH;
    }

    set scrollH(value: number /*int*/) {
      this.ensureDimensions();
      value = Math.max(1, Math.min(this._maxScrollH, value|0))|0;
      this._scrollH = value;
    }

    get scrollV(): number /*int*/ {
      return this._scrollV;
    }

    set scrollV(value: number /*int*/) {
      this.ensureDimensions();
      value = Math.max(1, Math.min(this._maxScrollV, value|0))|0;
      this._scrollV = value;
    }

    get selectable(): boolean {
      somewhatImplemented("public flash.text.TextField::get selectable");
      return this._selectable;
    }

    set selectable(value: boolean) {
      somewhatImplemented("public flash.text.TextField::set selectable");
      this._selectable = !!value;
    }

    get selectionBeginIndex(): number /*int*/ {
      somewhatImplemented("public flash.text.TextField::get selectionBeginIndex");
      return this._selectionBeginIndex;
    }

    get selectionEndIndex(): number /*int*/ {
      somewhatImplemented("public flash.text.TextField::get selectionEndIndex");
      return this._selectionEndIndex;
    }

    get sharpness(): number {
      somewhatImplemented("public flash.text.TextField::get sharpness");
      return this._sharpness;
    }

    set sharpness(value: number) {
      somewhatImplemented("public flash.text.TextField::set sharpness");
      this._sharpness = +value;
    }

    get styleSheet(): flash.text.StyleSheet {
      notImplemented("public flash.text.TextField::get styleSheet");
      return;
      // return this._styleSheet;
    }

    set styleSheet(value: flash.text.StyleSheet) {
      value = value;
      notImplemented("public flash.text.TextField::set styleSheet");
      return;
      // this._styleSheet = value;
    }

    get text(): string {
      return this._text;
    }

    set text(value: string) {
      this._text = asCoerceString(value);
      this._htmlText = '';
      this.invalidateDimensions();
    }

    get textColor(): number /*uint*/ {
      return this._textColor;
    }

    set textColor(value: number /*uint*/) {
      value = value >>> 0;
      if (this._textColor === value) {
        return;
      }
      this._textColor = value;
      this._invalidatePaint();
    }

    get textHeight(): number {
      this.ensureDimensions();
      return this._textHeight;
    }

    get textWidth(): number {
      this.ensureDimensions();
      return this._textWidth;
    }

    get thickness(): number {
      somewhatImplemented("public flash.text.TextField::get thickness");
      return this._thickness;
    }

    set thickness(value: number) {
      somewhatImplemented("public flash.text.TextField::set thickness");
      this._thickness = +value;
    }

    get type(): string {
      somewhatImplemented("public flash.text.TextField::get type");
      return this._type;
    }

    set type(value: string) {
      value = asCoerceString(value);
      if (value !== TextFieldType.DYNAMIC && value !== TextFieldType.INPUT) {
        throwError("ArgumentError", Errors.InvalidParamError, "type");
      }
      somewhatImplemented("public flash.text.TextField::set type");
      this._type = value;
    }

    get wordWrap(): boolean {
      return this._wordWrap;
    }

    set wordWrap(value: boolean) {
      this._wordWrap = !!value;
    }

    get useRichTextClipboard(): boolean {
      somewhatImplemented("public flash.text.TextField::get useRichTextClipboard");
      return this._useRichTextClipboard;
    }

    set useRichTextClipboard(value: boolean) {
      somewhatImplemented("public flash.text.TextField::set useRichTextClipboard");
      this._useRichTextClipboard = !!value;
    }

    getCharBoundaries(charIndex: number /*int*/): flash.geom.Rectangle {
      charIndex = charIndex | 0;
      somewhatImplemented("public flash.text.TextField::getCharBoundaries");
      return new flash.geom.Rectangle(0, 0, 0, 0);
    }

    getCharIndexAtPoint(x: number, y: number): number /*int*/ {
      x = +x;
      y = +y;
      somewhatImplemented("public flash.text.TextField::getCharIndexAtPoint");
      return 0;
    }

    getFirstCharInParagraph(charIndex: number /*int*/): number /*int*/ {
      charIndex = charIndex | 0;
      somewhatImplemented("public flash.text.TextField::getFirstCharInParagraph");
      return 0;
    }

    getLineIndexAtPoint(x: number, y: number): number /*int*/ {
      x = +x;
      y = +y;
      somewhatImplemented("public flash.text.TextField::getLineIndexAtPoint");
      return 0;
    }

    getLineIndexOfChar(charIndex: number /*int*/): number /*int*/ {
      charIndex = charIndex | 0;
      somewhatImplemented("public flash.text.TextField::getLineIndexOfChar");
      return 0;
    }

    getLineLength(lineIndex: number /*int*/): number /*int*/ {
      lineIndex = lineIndex | 0;
      notImplemented("public flash.text.TextField::getLineLength");
      return;
    }

    getLineMetrics(lineIndex: number /*int*/): flash.text.TextLineMetrics {
      lineIndex |= 0;
      this.ensureDimensions();
      if (lineIndex < 0 || lineIndex >= this._lines.length) {
        throwError('RangeError', Errors.ParamRangeError);
      }
      var line = this._lines[lineIndex];
      var format = line.largestFormat;
      var font: Font = format.fontObj;
      var size = format.size;
      // Rounding for metrics seems to be screwy. A descent of 3.5 gets
      // rounded to 3, but an ascent of 12.8338 gets rounded to 13.
      // For now, round up for things slightly above .5.
      var ascent = font.ascent * size + 0.49999 | 0;
      var descent = font.descent * size + 0.49999 | 0;
      var leading = font.leading * size + 0.49999 + line.leading | 0;
      // TODO: check if metrics values can be floats for embedded fonts
      return new flash.text.TextLineMetrics(line.x + 2, line.width,
                                            line.height,
                                            ascent, descent, leading);
    }

    getLineOffset(lineIndex: number /*int*/): number /*int*/ {
      lineIndex = lineIndex | 0;
      notImplemented("public flash.text.TextField::getLineOffset");
      return;
    }

    getLineText(lineIndex: number /*int*/): string {
      lineIndex = lineIndex | 0;
      notImplemented("public flash.text.TextField::getLineText");
      return;
    }

    getParagraphLength(charIndex: number /*int*/): number /*int*/ {
      charIndex = charIndex | 0;
      notImplemented("public flash.text.TextField::getParagraphLength");
      return;
    }

    getTextFormat(beginIndex: number /*int*/ = -1,
                  endIndex: number /*int*/ = -1): flash.text.TextFormat {
      beginIndex = beginIndex | 0;
      endIndex = endIndex | 0;
      somewhatImplemented("public flash.text.TextField::getTextFormat");
      return this.defaultTextFormat;
    }

    getTextRuns(beginIndex: number /*int*/ = 0, endIndex: number /*int*/ = 2147483647): any [] {
      beginIndex = beginIndex | 0;
      endIndex = endIndex | 0;
      notImplemented("public flash.text.TextField::getTextRuns");
      return;
    }

    getRawText(): string {
      notImplemented("public flash.text.TextField::getRawText");
      return;
    }

    replaceSelectedText(value: string): void {
      value = asCoerceString(value);
      somewhatImplemented("public flash.text.TextField::replaceSelectedText");
      var text = this._text;
      this.text = text.substring(0, this._selectionBeginIndex) + value +
                  text.substring(this._selectionEndIndex);
    }

    replaceText(beginIndex: number /*int*/, endIndex: number /*int*/, newText: string): void {
      beginIndex |= 0;
      endIndex |= 0;
      newText = "" + newText;
      somewhatImplemented("public flash.text.TextField::replaceText");
      var text = this._text;
      this.text = text.substring(0, beginIndex) + newText + text.substring(endIndex);
    }

    setSelection(beginIndex: number /*int*/, endIndex: number /*int*/): void {
      this._selectionBeginIndex = beginIndex | 0;
      this._selectionEndIndex = endIndex | 0;
      somewhatImplemented("public flash.text.TextField::setSelection");
    }

    setTextFormat(format: flash.text.TextFormat, beginIndex: number /*int*/ = -1,
                  endIndex: number /*int*/ = -1): void {
      beginIndex = beginIndex | 0;
      endIndex = endIndex | 0;
      somewhatImplemented("public flash.text.TextField::setTextFormat");
      this.defaultTextFormat = format;// TODO
      if (this.text === this.htmlText) {
        // HACK replacing format for non-html text
        this.text = this.text;
      }
      this.invalidateDimensions();
    }

    getImageReference(id: string): flash.display.DisplayObject {
      id = asCoerceString(id);
      notImplemented("public flash.text.TextField::getImageReference");
      return null;
    }
  }
}
