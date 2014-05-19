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
// Class: Font
module Shumway.AVM2.AS.flash.text {
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  import FontStyle = flash.text.FontStyle;
  import FontType = flash.text.FontType;

  export class Font extends ASNative {

    private static fonts: Font[];
    private static fontsBySymbolId: Shumway.Map<Font>;

    static classInitializer: any = function () {
      Font.fonts = [];
      Font.fontsBySymbolId = Shumway.ObjectUtilities.createMap<Font>();
    };

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    static initializer: any = function (symbol: Shumway.Timeline.FontSymbol) {
      var self: Font = this;

      self._fontName = null;
      self._fontStyle = null;
      self._fontType = null;

      if (symbol) {
        self._fontName = symbol.name;
        if (symbol.bold) {
          if (symbol.italic) {
            self._fontStyle = FontStyle.BOLD_ITALIC;
          } else {
            self._fontStyle = FontStyle.BOLD;
          }
        } else if (symbol.italic) {
          self._fontStyle = FontStyle.ITALIC;
        } else {
          self._fontStyle = FontStyle.REGULAR;
        }
        self._fontType = FontType.EMBEDDED;
        Font.fontsBySymbolId[symbol.id] = self;
      }
    };

    constructor() {
      false && super();
    }

    static getFontBySymbolId(id) {
      return this.fontsBySymbolId[id];
    }

    ascent: number;
    descent: number;
    leading: number;

    //private _fontId: string;
    private _fontName: string;
    private _fontStyle: string;
    private _fontType: string;

    // JS -> AS Bindings


    // AS -> JS Bindings
    static enumerateFonts(enumerateDeviceFonts: boolean = false): any [] {
      //TODO: support iterating device fonts, perhaps?
      somewhatImplemented("public flash.text.Font::static enumerateFonts");
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
      str = asCoerceString(str);
      somewhatImplemented('Font#hasGlyphs');
      return true;
    }
  }
}
