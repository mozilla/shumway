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

  export class Font extends ASNative implements Shumway.Remoting.IRemotable {

    private static _fonts: Font[];
    private static _fontsBySymbolId: Shumway.Map<Font>;
    private static _fontsByName: Shumway.Map<Font>;

    static classInitializer: any = function () {
      Font._fonts = [];
      Font._fontsBySymbolId = Shumway.ObjectUtilities.createMap<Font>();
      Font._fontsByName = Shumway.ObjectUtilities.createMap<Font>();
    };

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    static initializer: any = function (symbol: Shumway.Timeline.FontSymbol) {
      var self: Font = this;

      self._id = flash.display.DisplayObject.getNextSyncID();

      self._fontName = null;
      self._fontStyle = null;
      self._fontType = null;

      self.ascent = 0;
      self.descent = 0;
      self.leading = 0;
      self.advances = null;

      if (symbol) {
        self._symbol = symbol;
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

        var metrics = symbol.metrics;
        if (metrics) {
          self.ascent = metrics.ascent;
          self.descent = metrics.descent;
          self.leading = metrics.leading;
          self.advances = metrics.advances;
        }

        // Font symbols without any glyphs describe device fonts.
        self._fontType = symbol.data ? FontType.EMBEDDED : FontType.DEVICE;
        Font._fontsBySymbolId[symbol.id] = self;
        Font._fontsByName[symbol.name] = self;
        Font._fontsByName['swffont' + symbol.id] = self;
      }
    };

    constructor() {
      false && super();
    }

    static getBySymbolId(id: number): Font {
      return this._fontsBySymbolId[id];
    }

    static getByName(name: string): Font {
      return this._fontsByName[name];
    }

    // JS -> AS Bindings
    private _fontName: string;
    private _fontStyle: string;
    private _fontType: string;

    _id: number;
    _symbol: Shumway.Timeline.FontSymbol;

    ascent: number;
    descent: number;
    leading: number;
    advances: number[];

    // AS -> JS Bindings
    static enumerateFonts(enumerateDeviceFonts: boolean = false): any [] {
      //TODO: support iterating device fonts, perhaps?
      somewhatImplemented("public flash.text.Font::static enumerateFonts");
      return Font._fonts.slice();
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
