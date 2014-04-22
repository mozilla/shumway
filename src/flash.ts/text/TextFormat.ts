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
 * limitations under the License.
 */
// Class: TextFormat
module Shumway.AVM2.AS.flash.text {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  export class TextFormat extends ASNative {

    static classInitializer: any = null;
    static initializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];

    constructor(font: string = null, size: ASObject = null, color: ASObject = null,
                bold: ASObject = null, italic: ASObject = null, underline: ASObject = null,
                url: string = null, target: string = null, align: string = null,
                leftMargin: ASObject = null, rightMargin: ASObject = null, indent: ASObject = null,
                leading: ASObject = null)
    {
      font = "" + font;
      size = size;
      color = color;
      bold = bold;
      italic = italic;
      underline = underline;
      url = "" + url;
      target = "" + target;
      align = "" + align;
      leftMargin = leftMargin;
      rightMargin = rightMargin;
      indent = indent;
      leading = leading;
      false && super();
      notImplemented("Dummy Constructor: public flash.text.TextFormat");
    }

    private static measureTextField: flash.text.TextField;

    private _align: string;
    private _blockIndent: ASObject;
    private _bold: ASObject;
    private _bullet: ASObject;
    private _color: ASObject;
    private _display: string;
    private _font: string;
    private _indent: ASObject;
    private _italic: ASObject;
    private _kerning: ASObject;
    private _leading: ASObject;
    private _leftMargin: ASObject;
    private _letterSpacing: ASObject;
    private _rightMargin: ASObject;
    private _size: ASObject;
    private _tabStops: any [];
    private _target: string;
    private _underline: ASObject;
    private _url: string;


    fromObject(obj: any): TextFormat {
      if (!obj) {
        return this;
      }
      this._font = obj.face || null;
      this._size = typeof obj.size === 'number' ? obj.size : null;
      this._color = typeof obj.color === 'number' ? obj.color : null;
      this._bold = typeof obj.bold === 'boolean' ? obj.bold : null;
      this._italic = typeof obj.italic === 'boolean' ? obj.italic : null;
      this._underline = typeof obj.underline === 'boolean'
        ? obj.underline
        : null;
      this._url = obj.url || null;
      this._target = obj.target || null;
      this._align = obj.align || null;
      this._leftMargin = typeof obj.leftMargin === 'number'
        ? obj.leftMargin
        : null;
      this._rightMargin = typeof obj.rightMargin === 'number'
        ? obj.rightMargin
        : null;
      this._indent = typeof obj.indent === 'number' ? obj.indent : null;
      this._leading = typeof obj.leading === 'number' ? obj.leading : null;
      return this;
    }

    toObject(): Object {
      return {
        face: this._font || 'serif',
        size: this._size || 12,
        color: this._color || 0x0,
        bold: this._bold || false,
        italic: this._italic || false,
        underline: this._underline || false,
        url: this._url,
        target: this._target,
        align: this._align || 'left',
        leftMargin: this._leftMargin || 0,
        rightMargin: this._rightMargin || 0,
        indent: this._indent || 0,
        leading: this._leading || 0
      };
    }

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
      this._align = asCoerceString(value);
    }

    get blockIndent(): ASObject {
      return this._blockIndent;
    }

    set blockIndent(value: ASObject) {
      this._blockIndent = value;
    }

    get bold(): ASObject {
      return this._bold;
    }

    set bold(value: ASObject) {
      this._bold = value;
    }

    get bullet(): ASObject {
      return this._bullet;
    }

    set bullet(value: ASObject) {
      this._bullet = value;
    }

    get color(): ASObject {
      return this._color;
    }

    set color(value: ASObject) {
      this._color = value;
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

    get indent(): ASObject {
      return this._indent;
    }

    set indent(value: ASObject) {
      this._indent = value;
    }

    get italic(): ASObject {
      return this._italic;
    }

    set italic(value: ASObject) {
      this._italic = value;
    }

    get kerning(): ASObject {
      return this._kerning;
    }

    set kerning(value: ASObject) {
      this._kerning = value;
    }

    get leading(): ASObject {
      return this._leading;
    }

    set leading(value: ASObject) {
      this._leading = value;
    }

    get leftMargin(): ASObject {
      return this._leftMargin;
    }

    set leftMargin(value: ASObject) {
      this._leftMargin = value;
    }

    get letterSpacing(): ASObject {
      return this._letterSpacing;
    }

    set letterSpacing(value: ASObject) {
      this._letterSpacing = value;
    }

    get rightMargin(): ASObject {
      return this._rightMargin;
    }

    set rightMargin(value: ASObject) {
      this._rightMargin = value;
    }

    get size(): ASObject {
      return this._size;
    }

    set size(value: ASObject) {
      this._size = value;
    }

    get tabStops(): any [] {
      return this._tabStops;
    }

    set tabStops(value: any []) {
      this._tabStops = value;
    }

    get target(): string {
      return this._target;
    }

    set target(value: string) {
      this._target = asCoerceString(value);
    }

    get underline(): ASObject {
      return this._underline;
    }

    set underline(value: ASObject) {
      this._underline = value;
    }

    get url(): string {
      return this._url;
    }

    set url(value: string) {
      this._url = asCoerceString(value);
    }
  }
}
