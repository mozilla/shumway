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
// Class: Font
module Shumway.AVM2.AS.flash.text {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Font extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.text.Font");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    static enumerateFonts(enumerateDeviceFonts: boolean = false): any [] {
      enumerateDeviceFonts = !!enumerateDeviceFonts;
      notImplemented("public flash.text.Font::static enumerateFonts"); return;
    }
    static registerFont(font: ASClass): void {
      font = font;
      notImplemented("public flash.text.Font::static registerFont"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    get fontName(): string {
      notImplemented("public flash.text.Font::get fontName"); return;
    }
    get fontStyle(): string {
      notImplemented("public flash.text.Font::get fontStyle"); return;
    }
    get fontType(): string {
      notImplemented("public flash.text.Font::get fontType"); return;
    }
    hasGlyphs(str: string): boolean {
      str = "" + str;
      notImplemented("public flash.text.Font::hasGlyphs"); return;
    }
  }
}
