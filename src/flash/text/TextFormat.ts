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
// Class: TextFormat
module Shumway.AVM2.AS.flash.text {
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import roundHalfEven = Shumway.NumberUtilities.roundHalfEven;
  import notImplemented = Shumway.Debug.notImplemented;
  import throwError = Shumway.AVM2.Runtime.throwError;

  export class TextFormat extends ASNative {

    static classInitializer: any = null;
    static initializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];

    constructor(font: string = null, size: Object = null, color: Object = null,
                bold: Object = null, italic: Object = null, underline: Object = null,
                url: string = null, target: string = null, align: string = null,
                leftMargin: Object = null, rightMargin: Object = null, indent: Object = null,
                leading: Object = null)
    {
      false && super();
      notImplemented("Dummy Constructor: public flash.text.TextFormat");
    }

    private static measureTextField: flash.text.TextField;

    private _align: string;
    private _blockIndent: Object;
    private _bold: Object;
    private _bullet: Object;
    private _color: Object;
    private _display: string;
    private _font: string;
    private _indent: Object;
    private _italic: Object;
    private _kerning: Object;
    private _leading: Object;
    private _leftMargin: Object;
    private _letterSpacing: Object;
    private _rightMargin: Object;
    private _size: Object;
    private _tabStops: any [];
    private _target: string;
    private _underline: Object;
    private _url: string;

    //fromNative(nativeFormat: NativeTextFormat): TextFormat {
    //  this._font = nativeFormat.face;
    //  this._size = nativeFormat.size;
    //  this._color = nativeFormat.color;
    //  this._bold = nativeFormat.bold;
    //  this._italic = nativeFormat.italic;
    //  this._underline = nativeFormat.underline;
    //  this._url = nativeFormat.url;
    //  this._target = nativeFormat.target;
    //  this._align = nativeFormat.align;
    //  this._leftMargin = nativeFormat.leftMargin;
    //  this._rightMargin = nativeFormat.rightMargin;
    //  this._indent = nativeFormat.indent;
    //  this._leading = nativeFormat.leading;
    //  this._letterSpacing = nativeFormat.letterSpacing;
    //  this._kerning = nativeFormat.kerning;
    //  return this;
    //}

    /**
     * Inside TextField, a native representation of TextFormat is used for efficiency:
     * The AS3 representation is almost entirely untyped and can contain null values, which are
     * replaced by defaults for internal calculation purposes. To avoid having to check for them
     * in all calculations, TextFormat is converted into NativeTextFormat, with the null checks
     * happening once during the conversion.
     */
    //toNative(): NativeTextFormat {
    //  var format: NativeTextFormat = new NativeTextFormat();
    //  format.face = this._font || 'serif';
    //  format.size = isNaN(+this._size) ? 12 : +this._size;
    //  format.color = +this._color | 0;
    //  format.bold = !!this._bold;
    //  format.italic = !!this._italic;
    //  format.underline = !!this._underline;
    //  format.url = this._url;
    //  format.target = this._target;
    //  format.align = this._align;
    //  format.leftMargin = +this._leftMargin;
    //  format.rightMargin = +this._rightMargin;
    //  format.indent = isNaN(+this._indent) ? 0 : +this._indent;
    //  format.leading = isNaN(+this._leading) ? 0 : +this._indent;
    //  return format;
    //}

    as2GetTextExtent(text: string, width: number/* optional */) {
      if (!TextFormat.measureTextField) {
        TextFormat.measureTextField = new flash.text.TextField();
        TextFormat.measureTextField._multiline = true;
      }
      var measureTextField = TextFormat.measureTextField;
      if (!isNaN(width) && width > 0) {
        measureTextField.width = width + 4;
        measureTextField._wordWrap = true;
      } else {
        measureTextField._wordWrap = false;
      }
      measureTextField.defaultTextFormat = this;
      measureTextField.text = text;
      var result: any = {};
      var textWidth: number = measureTextField.textWidth;
      var textHeight: number = measureTextField.textHeight;
      result.asSetPublicProperty('width', textWidth);
      result.asSetPublicProperty('height', textHeight);
      result.asSetPublicProperty('textFieldWidth', textWidth + 4);
      result.asSetPublicProperty('textFieldHeight', textHeight + 4);
      var metrics: TextLineMetrics = measureTextField.getLineMetrics(0);
      result.asSetPublicProperty('ascent', metrics.ascent);
      result.asSetPublicProperty('descent', metrics.descent);
      return result;
    }

    // AS -> JS Bindings
    get align(): string {
      return this._align;
    }

    set align(value: string) {
      value = asCoerceString(value);
      //if (TextFormatAlign.toNumber(value) < 0) {
      //  throwError("ArgumentError", Errors.InvalidEnumError, "align");
      //}
      this._align = value;
    }

    get blockIndent(): Object {
      return this._blockIndent;
    }

    set blockIndent(value: Object) {
      this._blockIndent = TextFormat.coerceNumber(value);
    }

    get bold(): Object {
      return this._bold;
    }

    set bold(value: Object) {
      this._bold = TextFormat.coerceBoolean(value);
    }

    get bullet(): Object {
      return this._bullet;
    }

    set bullet(value: Object) {
      this._bullet = TextFormat.coerceBoolean(value);
    }

    get color(): Object {
      return this._color;
    }

    set color(value: Object) {
      this._color = +value|0;
    }

    get display(): string {
      return this._display;
    }

    set display(value: string) {
      this._display = asCoerceString(value);
    }

    get font(): string {
      return this._font;
    }

    set font(value: string) {
      this._font = asCoerceString(value);
    }

    get indent(): Object {
      return this._indent;
    }

    set indent(value: Object) {
      this._indent = TextFormat.coerceNumber(value);
    }

    get italic(): Object {
      return this._italic;
    }

    set italic(value: Object) {
      this._italic = TextFormat.coerceBoolean(value);
    }

    get kerning(): Object {
      return this._kerning;
    }

    set kerning(value: Object) {
      this._kerning = TextFormat.coerceBoolean(value);
    }

    get leading(): Object {
      return this._leading;
    }

    set leading(value: Object) {
      this._leading = TextFormat.coerceNumber(value);
    }

    get leftMargin(): Object {
      return this._leftMargin;
    }

    set leftMargin(value: Object) {
      this._leftMargin = TextFormat.coerceNumber(value);
    }

    get letterSpacing(): Object {
      return this._letterSpacing;
    }

    set letterSpacing(value: Object) {
      this._letterSpacing = TextFormat.coerceBoolean(value);
    }

    get rightMargin(): Object {
      return this._rightMargin;
    }

    set rightMargin(value: Object) {
      this._rightMargin = TextFormat.coerceNumber(value);
    }

    get size(): Object {
      return this._size;
    }

    set size(value: Object) {
      this._size = TextFormat.coerceNumber(value);
    }

    get tabStops(): any [] {
      return this._tabStops;
    }

    set tabStops(value: any []) {
      if (!(value instanceof Array)) {
        throwError("ArgumentError", Errors.CheckTypeFailedError, value, 'Array');
      }
      this._tabStops = value;
    }

    get target(): string {
      return this._target;
    }

    set target(value: string) {
      this._target = asCoerceString(value);
    }

    get underline(): Object {
      return this._underline;
    }

    set underline(value: Object) {
      this._underline = TextFormat.coerceBoolean(value);
    }

    get url(): string {
      return this._url;
    }

    set url(value: string) {
      this._url = asCoerceString(value);
    }

    /**
     * All integer values on TextFormat are typed as Object and coerced to ints using the following
     * "algorithm":
     * - if the supplied value is null or undefined, the field is set to null
     * - else if coercing to number results in NaN or the value is greater than MAX_INT, set to
     *   -0x80000000
     * - else, round the coerced value using half-even rounding
     */
    private static coerceNumber(value: any): any {
      if (value == undefined) {
        return null;
      }
      if (isNaN(value) || value > 0xfffffff) {
        return -0x80000000;
      }
      return roundHalfEven(value);
    }

    /**
     * Boolean values are only stored as bools if they're not undefined or null. In that case,
     * they're stored as null.
     */
    private static coerceBoolean(value: any): any {
      return value == undefined ? null : !!value;
    }

    clone(): TextFormat {
      return new flash.text.TextFormat(
        this.font,
        this.size,
        this.color,
        this.bold,
        this.italic,
        this.underline,
        this.url,
        this.target,
        this.align,
        this.leftMargin,
        this.rightMargin,
        this.indent,
        this.leading
      );
    }
  }

  //export class NativeTextFormat {
  //  face: string;
  //  fontObj: Font;
  //  size: number;
  //  color: number;
  //  bold: boolean;
  //  italic: boolean;
  //  underline: boolean;
  //  url: string;
  //  target: string;
  //  align: string;
  //  leftMargin: number;
  //  rightMargin: number;
  //  indent: number;
  //  leading: number;
  //  letterSpacing: number;
  //  kerning: number;
  //}
}
