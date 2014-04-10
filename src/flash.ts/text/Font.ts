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
// Class: Font
module Shumway.AVM2.AS.flash.text {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Font extends ASNative {

    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = function (symbol) {
      var s = symbol;
      if (s) {
        this._fontId = s.renderableId;
        this._fontName = s.name || null;
        if (s.bold) {
          if (s.italic) {
            this._fontStyle = 'boldItalic';
          } else {
            this._fontStyle = 'bold';
          }
        } else if (s.italic) {
          this._fontStyle = 'italic';
        } else {
          this._fontStyle = 'regular';
        }
        this._fontType = 'embedded';
        Font.fonts.push(this);
        Font.fontsBySymbolId[s.id] = this;
      }
    };

    static staticBindings: string [] = null;
    static bindings: string [] = null;

    constructor() {
    }

    private static fonts: Font[] = [];
    private static fontsBySymbolId = Object.create(null);

    static getFontBySymbolId(id) {
      return this.fontsBySymbolId[id];
    }

    private _fontId: string;
    private _fontName: string;
    private _fontStyle: string;
    private _fontType: string;

    // JS -> AS Bindings


    // AS -> JS Bindings
    static enumerateFonts(enumerateDeviceFonts: boolean = false): any [] {
      return Font.fonts.slice();
    }

    static registerFont(font: ASClass): void {
      somewhatImplemented('Font.registerFont');
    }

    get fontName(): string {
      return this._fontName;
    }

    get fontStyle(): string {
      return this._fontStyle;
    }

    get fontType(): string {
      return this._fontType;
    }

    hasGlyphs(str: string): boolean {
      somewhatImplemented('Font#hasGlyphs');
      return true;
    }
  }
}
