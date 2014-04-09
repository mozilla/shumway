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

  export class TextFormat extends ASNative {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor (font: string = null, size: ASObject = null, color: ASObject = null, bold: ASObject = null, italic: ASObject = null, underline: ASObject = null, url: string = null, target: string = null, align: string = null, leftMargin: ASObject = null, rightMargin: ASObject = null, indent: ASObject = null, leading: ASObject = null) {
      font = "" + font; size = size; color = color; bold = bold; italic = italic; underline = underline; url = "" + url; target = "" + target; align = "" + align; leftMargin = leftMargin; rightMargin = rightMargin; indent = indent; leading = leading;
      false && super();
      notImplemented("Dummy Constructor: public flash.text.TextFormat");
    }
    
    // JS -> AS Bindings

    
    // AS -> JS Bindings
    
    // _align: string;
    // _blockIndent: ASObject;
    // _bold: ASObject;
    // _bullet: ASObject;
    // _color: ASObject;
    // _display: string;
    // _font: string;
    // _indent: ASObject;
    // _italic: ASObject;
    // _kerning: ASObject;
    // _leading: ASObject;
    // _leftMargin: ASObject;
    // _letterSpacing: ASObject;
    // _rightMargin: ASObject;
    // _size: ASObject;
    // _tabStops: any [];
    // _target: string;
    // _underline: ASObject;
    // _url: string;
    get align(): string {
      notImplemented("public flash.text.TextFormat::get align"); return;
      // return this._align;
    }
    set align(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextFormat::set align"); return;
      // this._align = value;
    }
    get blockIndent(): ASObject {
      notImplemented("public flash.text.TextFormat::get blockIndent"); return;
      // return this._blockIndent;
    }
    set blockIndent(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set blockIndent"); return;
      // this._blockIndent = value;
    }
    get bold(): ASObject {
      notImplemented("public flash.text.TextFormat::get bold"); return;
      // return this._bold;
    }
    set bold(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set bold"); return;
      // this._bold = value;
    }
    get bullet(): ASObject {
      notImplemented("public flash.text.TextFormat::get bullet"); return;
      // return this._bullet;
    }
    set bullet(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set bullet"); return;
      // this._bullet = value;
    }
    get color(): ASObject {
      notImplemented("public flash.text.TextFormat::get color"); return;
      // return this._color;
    }
    set color(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set color"); return;
      // this._color = value;
    }
    get display(): string {
      notImplemented("public flash.text.TextFormat::get display"); return;
      // return this._display;
    }
    set display(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextFormat::set display"); return;
      // this._display = value;
    }
    get font(): string {
      notImplemented("public flash.text.TextFormat::get font"); return;
      // return this._font;
    }
    set font(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextFormat::set font"); return;
      // this._font = value;
    }
    get indent(): ASObject {
      notImplemented("public flash.text.TextFormat::get indent"); return;
      // return this._indent;
    }
    set indent(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set indent"); return;
      // this._indent = value;
    }
    get italic(): ASObject {
      notImplemented("public flash.text.TextFormat::get italic"); return;
      // return this._italic;
    }
    set italic(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set italic"); return;
      // this._italic = value;
    }
    get kerning(): ASObject {
      notImplemented("public flash.text.TextFormat::get kerning"); return;
      // return this._kerning;
    }
    set kerning(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set kerning"); return;
      // this._kerning = value;
    }
    get leading(): ASObject {
      notImplemented("public flash.text.TextFormat::get leading"); return;
      // return this._leading;
    }
    set leading(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set leading"); return;
      // this._leading = value;
    }
    get leftMargin(): ASObject {
      notImplemented("public flash.text.TextFormat::get leftMargin"); return;
      // return this._leftMargin;
    }
    set leftMargin(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set leftMargin"); return;
      // this._leftMargin = value;
    }
    get letterSpacing(): ASObject {
      notImplemented("public flash.text.TextFormat::get letterSpacing"); return;
      // return this._letterSpacing;
    }
    set letterSpacing(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set letterSpacing"); return;
      // this._letterSpacing = value;
    }
    get rightMargin(): ASObject {
      notImplemented("public flash.text.TextFormat::get rightMargin"); return;
      // return this._rightMargin;
    }
    set rightMargin(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set rightMargin"); return;
      // this._rightMargin = value;
    }
    get size(): ASObject {
      notImplemented("public flash.text.TextFormat::get size"); return;
      // return this._size;
    }
    set size(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set size"); return;
      // this._size = value;
    }
    get tabStops(): any [] {
      notImplemented("public flash.text.TextFormat::get tabStops"); return;
      // return this._tabStops;
    }
    set tabStops(value: any []) {
      value = value;
      notImplemented("public flash.text.TextFormat::set tabStops"); return;
      // this._tabStops = value;
    }
    get target(): string {
      notImplemented("public flash.text.TextFormat::get target"); return;
      // return this._target;
    }
    set target(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextFormat::set target"); return;
      // this._target = value;
    }
    get underline(): ASObject {
      notImplemented("public flash.text.TextFormat::get underline"); return;
      // return this._underline;
    }
    set underline(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set underline"); return;
      // this._underline = value;
    }
    get url(): string {
      notImplemented("public flash.text.TextFormat::get url"); return;
      // return this._url;
    }
    set url(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextFormat::set url"); return;
      // this._url = value;
    }
  }
}
