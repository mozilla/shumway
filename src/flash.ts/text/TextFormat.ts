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
// Class: TextFormat
module Shumway.AVM2.AS.flash.text {
  import notImplemented = Shumway.Debug.notImplemented;
  export class TextFormat extends ASNative {
    static initializer: any = null;
    constructor (font: string = null, size: ASObject = null, color: ASObject = null, bold: ASObject = null, italic: ASObject = null, underline: ASObject = null, url: string = null, target: string = null, align: string = null, leftMargin: ASObject = null, rightMargin: ASObject = null, indent: ASObject = null, leading: ASObject = null) {
      font = "" + font; size = size; color = color; bold = bold; italic = italic; underline = underline; url = "" + url; target = "" + target; align = "" + align; leftMargin = leftMargin; rightMargin = rightMargin; indent = indent; leading = leading;
      false && super();
      notImplemented("Dummy Constructor: public flash.text.TextFormat");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    get align(): string {
      notImplemented("public flash.text.TextFormat::get align"); return;
    }
    set align(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextFormat::set align"); return;
    }
    get blockIndent(): ASObject {
      notImplemented("public flash.text.TextFormat::get blockIndent"); return;
    }
    set blockIndent(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set blockIndent"); return;
    }
    get bold(): ASObject {
      notImplemented("public flash.text.TextFormat::get bold"); return;
    }
    set bold(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set bold"); return;
    }
    get bullet(): ASObject {
      notImplemented("public flash.text.TextFormat::get bullet"); return;
    }
    set bullet(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set bullet"); return;
    }
    get color(): ASObject {
      notImplemented("public flash.text.TextFormat::get color"); return;
    }
    set color(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set color"); return;
    }
    get display(): string {
      notImplemented("public flash.text.TextFormat::get display"); return;
    }
    set display(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextFormat::set display"); return;
    }
    get font(): string {
      notImplemented("public flash.text.TextFormat::get font"); return;
    }
    set font(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextFormat::set font"); return;
    }
    get indent(): ASObject {
      notImplemented("public flash.text.TextFormat::get indent"); return;
    }
    set indent(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set indent"); return;
    }
    get italic(): ASObject {
      notImplemented("public flash.text.TextFormat::get italic"); return;
    }
    set italic(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set italic"); return;
    }
    get kerning(): ASObject {
      notImplemented("public flash.text.TextFormat::get kerning"); return;
    }
    set kerning(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set kerning"); return;
    }
    get leading(): ASObject {
      notImplemented("public flash.text.TextFormat::get leading"); return;
    }
    set leading(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set leading"); return;
    }
    get leftMargin(): ASObject {
      notImplemented("public flash.text.TextFormat::get leftMargin"); return;
    }
    set leftMargin(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set leftMargin"); return;
    }
    get letterSpacing(): ASObject {
      notImplemented("public flash.text.TextFormat::get letterSpacing"); return;
    }
    set letterSpacing(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set letterSpacing"); return;
    }
    get rightMargin(): ASObject {
      notImplemented("public flash.text.TextFormat::get rightMargin"); return;
    }
    set rightMargin(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set rightMargin"); return;
    }
    get size(): ASObject {
      notImplemented("public flash.text.TextFormat::get size"); return;
    }
    set size(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set size"); return;
    }
    get tabStops(): any [] {
      notImplemented("public flash.text.TextFormat::get tabStops"); return;
    }
    set tabStops(value: any []) {
      value = value;
      notImplemented("public flash.text.TextFormat::set tabStops"); return;
    }
    get target(): string {
      notImplemented("public flash.text.TextFormat::get target"); return;
    }
    set target(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextFormat::set target"); return;
    }
    get underline(): ASObject {
      notImplemented("public flash.text.TextFormat::get underline"); return;
    }
    set underline(value: ASObject) {
      value = value;
      notImplemented("public flash.text.TextFormat::set underline"); return;
    }
    get url(): string {
      notImplemented("public flash.text.TextFormat::get url"); return;
    }
    set url(value: string) {
      value = "" + value;
      notImplemented("public flash.text.TextFormat::set url"); return;
    }
  }
}
