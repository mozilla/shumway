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
module Shumway.AVMX.AS.flash.text {

  //import FontStyle = flash.text.FontStyle;
  //import FontType = flash.text.FontType;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import clamp = Shumway.NumberUtilities.clamp;
  import DisplayObjectFlags = flash.display.DisplayObjectFlags;
  import DisplayObjectDirtyFlags = flash.display.DisplayObjectDirtyFlags;
  import TextTag = Shumway.SWF.Parser.TextTag;
  import TextFlags = Shumway.SWF.Parser.TextFlags;
  import TextRecord = Shumway.SWF.Parser.TextRecord;
  import TextRecordFlags = Shumway.SWF.Parser.TextRecordFlags;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import roundHalfEven = Shumway.NumberUtilities.roundHalfEven;
  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import assert = Shumway.Debug.assert;
  import warning = Shumway.Debug.warning;

  export class AntiAliasType extends ASObject {
    static classInitializer: any = null;
    static classSymbols : string [] = null;
    static instanceSymbols: string [] = null;
    constructor() {
      super();
    }
    static NORMAL: string = "normal";
    static ADVANCED: string = "advanced";
    static fromNumber(n: number): string {
      switch (n) {
        case 1:
          return AntiAliasType.NORMAL;
        case 2:
          return AntiAliasType.ADVANCED;
        default:
          return null;
      }
    }
    static toNumber(value: string): number {
      switch (value) {
        case AntiAliasType.NORMAL:
          return 1;
        case AntiAliasType.ADVANCED:
          return 2;
        default:
          return -1;
      }
    }
  }

  //export class CSMSettings extends ASObject {
  //
  //  static classInitializer: any = null;
  //  static classSymbols: string [] = null;
  //  static instanceSymbols: string [] = null; // ["fontSize", "insideCutoff", "outsideCutoff"];
  //
  //  constructor(fontSize: number, insideCutoff: number, outsideCutoff: number) {
  //    super();
  //    this.fontSize = +fontSize;
  //    this.insideCutoff = +insideCutoff;
  //    this.outsideCutoff = +outsideCutoff;
  //  }
  //
  //  // JS -> AS Bindings
  //  fontSize: number;
  //  insideCutoff: number;
  //  outsideCutoff: number;
  //}

  export class Font extends ASObject implements Shumway.Remoting.IRemotable {

    static axClass: typeof Font;

    private static _fonts: Font[];
    private static _fontsBySymbolId: Shumway.MapObject<Font>;
    private static _fontsByName: Shumway.MapObject<Font>;

    static DEVICE_FONT_METRICS_WIN: Object;
    static DEVICE_FONT_METRICS_LINUX: Object;
    static DEVICE_FONT_METRICS_MAC: Object;
    static DEVICE_FONT_METRICS_BUILTIN: Object;

    static DEFAULT_FONT_SANS = 'Arial';
    static DEFAULT_FONT_SERIF = 'Times New Roman';
    static DEFAULT_FONT_TYPEWRITER = 'Courier New';

    static classInitializer: any = function () {
      this._fonts = [];
      this._fontsBySymbolId = Shumway.ObjectUtilities.createMap<Font>();
      this._fontsByName = Shumway.ObjectUtilities.createMap<Font>();

      this.DEVICE_FONT_METRICS_BUILTIN = {
        "_sans": [0.9, 0.22, 0.08],
        "_serif": [0.88, 0.26, 0.08],
        "_typewriter": [0.86, 0.24, 0.08]
      };

      // Measurements taken on a freshly installed Windows 7 (Ultimate).
      this.DEVICE_FONT_METRICS_WIN = {
        __proto__: this.DEVICE_FONT_METRICS_BUILTIN,
        "Arial": [1, 0.25, 0],
        "Arial Baltic": [1, 0.25, 0],
        "Arial Black": [1.0833, 0.3333, 0],
        "Arial CE": [1, 0.25, 0],
        "Arial CYR": [1, 0.25, 0],
        "Arial Greek": [1, 0.25, 0],
        "Arial TUR": [1, 0.25, 0],
        "Comic Sans MS": [1.0833, 0.3333, 0],
        "Courier New": [1, 0.25, 0],
        "Courier New Baltic": [1, 0.25, 0],
        "Courier New CE": [1, 0.25, 0],
        "Courier New CYR": [1, 0.25, 0],
        "Courier New Greek": [1, 0.25, 0],
        "Courier New TUR": [1, 0.25, 0],
        "Estrangelo Edessa": [0.75, 0.3333, 0],
        "Franklin Gothic Medium": [1, 0.3333, 0],
        "Gautami": [0.9167, 0.8333, 0],
        "Georgia": [1, 0.25, 0],
        "Impact": [1.0833, 0.25, 0],
        "Latha": [1.0833, 0.25, 0],
        "Lucida Console": [0.75, 0.25, 0],
        "Lucida Sans Unicode": [1.0833, 0.25, 0],
        "Mangal": [1.0833, 0.25, 0],
        "Marlett": [1, 0, 0],
        "Microsoft Sans Serif": [1.0833, 0.1667, 0],
        "MV Boli": [0.9167, 0.25, 0],
        "Palatino Linotype": [1.0833, 0.3333, 0],
        "Raavi": [1.0833, 0.6667, 0],
        "Shruti": [1, 0.5, 0],
        "Sylfaen": [1, 0.3333, 0],
        "Symbol": [1, 0.25, 0],
        "Tahoma": [1, 0.1667, 0],
        "Times New Roman": [1, 0.25, 0],
        "Times New Roman Baltic": [1, 0.25, 0],
        "Times New Roman CE": [1, 0.25, 0],
        "Times New Roman CYR": [1, 0.25, 0],
        "Times New Roman Greek": [1, 0.25, 0],
        "Times New Roman TUR": [1, 0.25, 0],
        "Trebuchet MS": [1.0833, 0.4167, 0],
        "Tunga": [1, 0.75, 0],
        "Verdana": [1, 0.1667, 0],
        "Webdings": [1.0833, 0.5, 0],
        "Wingdings": [0.9167, 0.25, 0]
      };
      // Measurements taken on a freshly installed Mac OS X 10.10 (Yosemite).
      this.DEVICE_FONT_METRICS_MAC = {
        __proto__: this.DEVICE_FONT_METRICS_BUILTIN,
        "Al Bayan Bold": [1, 0.5833, 0],
        "Al Bayan Plain": [1, 0.5, 0],
        "Al Nile": [0.8333, 0.5, 0],
        "Al Nile Bold": [0.8333, 0.5, 0],
        "Al Tarikh Regular": [0.5833, 0.4167, 0],
        "American Typewriter": [0.9167, 0.25, 0],
        "American Typewriter Bold": [0.9167, 0.25, 0],
        "American Typewriter Condensed": [0.9167, 0.25, 0],
        "American Typewriter Condensed Bold": [0.9167, 0.25, 0],
        "American Typewriter Condensed Light": [0.8333, 0.25, 0],
        "American Typewriter Light": [0.9167, 0.25, 0],
        "Andale Mono": [0.9167, 0.25, 0],
        "Apple Braille": [0.75, 0.25, 0],
        "Apple Braille Outline 6 Dot": [0.75, 0.25, 0],
        "Apple Braille Outline 8 Dot": [0.75, 0.25, 0],
        "Apple Braille Pinpoint 6 Dot": [0.75, 0.25, 0],
        "Apple Braille Pinpoint 8 Dot": [0.75, 0.25, 0],
        "Apple Chancery": [1.0833, 0.5, 0],
        "Apple Color Emoji": [1.25, 0.4167, 0],
        "Apple SD Gothic Neo Bold": [0.9167, 0.3333, 0],
        "Apple SD Gothic Neo Heavy": [0.9167, 0.3333, 0],
        "Apple SD Gothic Neo Light": [0.9167, 0.3333, 0],
        "Apple SD Gothic Neo Medium": [0.9167, 0.3333, 0],
        "Apple SD Gothic Neo Regular": [0.9167, 0.3333, 0],
        "Apple SD Gothic Neo SemiBold": [0.9167, 0.3333, 0],
        "Apple SD Gothic Neo Thin": [0.9167, 0.3333, 0],
        "Apple SD Gothic Neo UltraLight": [0.9167, 0.3333, 0],
        "Apple SD GothicNeo ExtraBold": [0.9167, 0.3333, 0],
        "Apple Symbols": [0.6667, 0.25, 0],
        "AppleGothic Regular": [0.9167, 0.3333, 0],
        "AppleMyungjo Regular": [0.8333, 0.3333, 0],
        "Arial": [0.9167, 0.25, 0],
        "Arial Black": [1.0833, 0.3333, 0],
        "Arial Bold": [0.9167, 0.25, 0],
        "Arial Bold Italic": [0.9167, 0.25, 0],
        "Arial Hebrew": [0.75, 0.3333, 0],
        "Arial Hebrew Bold": [0.75, 0.3333, 0],
        "Arial Hebrew Light": [0.75, 0.3333, 0],
        "Arial Hebrew Scholar": [0.75, 0.3333, 0],
        "Arial Hebrew Scholar Bold": [0.75, 0.3333, 0],
        "Arial Hebrew Scholar Light": [0.75, 0.3333, 0],
        "Arial Italic": [0.9167, 0.25, 0],
        "Arial Narrow": [0.9167, 0.25, 0],
        "Arial Narrow Bold": [0.9167, 0.25, 0],
        "Arial Narrow Bold Italic": [0.9167, 0.25, 0],
        "Arial Narrow Italic": [0.9167, 0.25, 0],
        "Arial Rounded MT Bold": [0.9167, 0.25, 0],
        "Arial Unicode MS": [1.0833, 0.25, 0],
        "Athelas Bold": [0.9167, 0.25, 0],
        "Athelas Bold Italic": [0.9167, 0.25, 0],
        "Athelas Italic": [0.9167, 0.25, 0],
        "Athelas Regular": [0.9167, 0.25, 0],
        "Avenir Black": [1, 0.3333, 0],
        "Avenir Black Oblique": [1, 0.3333, 0],
        "Avenir Book": [1, 0.3333, 0],
        "Avenir Book Oblique": [1, 0.3333, 0],
        "Avenir Heavy": [1, 0.3333, 0],
        "Avenir Heavy Oblique": [1, 0.3333, 0],
        "Avenir Light": [1, 0.3333, 0],
        "Avenir Light Oblique": [1, 0.3333, 0],
        "Avenir Medium": [1, 0.3333, 0],
        "Avenir Medium Oblique": [1, 0.3333, 0],
        "Avenir Next Bold": [1, 0.3333, 0],
        "Avenir Next Bold Italic": [1, 0.3333, 0],
        "Avenir Next Condensed Bold": [1, 0.3333, 0],
        "Avenir Next Condensed Bold Italic": [1, 0.3333, 0],
        "Avenir Next Condensed Demi Bold": [1, 0.3333, 0],
        "Avenir Next Condensed Demi Bold Italic": [1, 0.3333, 0],
        "Avenir Next Condensed Heavy": [1, 0.3333, 0],
        "Avenir Next Condensed Heavy Italic": [1, 0.3333, 0],
        "Avenir Next Condensed Italic": [1, 0.3333, 0],
        "Avenir Next Condensed Medium": [1, 0.3333, 0],
        "Avenir Next Condensed Medium Italic": [1, 0.3333, 0],
        "Avenir Next Condensed Regular": [1, 0.3333, 0],
        "Avenir Next Condensed Ultra Light": [1, 0.3333, 0],
        "Avenir Next Condensed Ultra Light Italic": [1, 0.3333, 0],
        "Avenir Next Demi Bold": [1, 0.3333, 0],
        "Avenir Next Demi Bold Italic": [1, 0.3333, 0],
        "Avenir Next Heavy": [1, 0.3333, 0],
        "Avenir Next Heavy Italic": [1, 0.3333, 0],
        "Avenir Next Italic": [1, 0.3333, 0],
        "Avenir Next Medium": [1, 0.3333, 0],
        "Avenir Next Medium Italic": [1, 0.3333, 0],
        "Avenir Next Regular": [1, 0.3333, 0],
        "Avenir Next Ultra Light": [1, 0.3333, 0],
        "Avenir Next Ultra Light Italic": [1, 0.3333, 0],
        "Avenir Oblique": [1, 0.3333, 0],
        "Avenir Roman": [1, 0.3333, 0],
        "Ayuthaya": [1.0833, 0.3333, 0],
        "Baghdad Regular": [0.9167, 0.4167, 0],
        "Bangla MN": [1.0833, 0.75, 0],
        "Bangla MN Bold": [1.0833, 0.75, 0],
        "Bangla Sangam MN": [0.9167, 0.4167, 0],
        "Bangla Sangam MN Bold": [0.9167, 0.4167, 0],
        "Baoli SC Regular": [1.0833, 0.3333, 0],
        "Baskerville": [0.9167, 0.25, 0],
        "Baskerville Bold": [0.9167, 0.25, 0],
        "Baskerville Bold Italic": [0.9167, 0.25, 0],
        "Baskerville Italic": [0.9167, 0.25, 0],
        "Baskerville SemiBold": [0.9167, 0.25, 0],
        "Baskerville SemiBold Italic": [0.9167, 0.25, 0],
        "Beirut Regular": [0.75, 0.25, 0],
        "Big Caslon Medium": [0.9167, 0.25, 0],
        "Bodoni 72 Bold": [0.9167, 0.25, 0],
        "Bodoni 72 Book": [0.9167, 0.25, 0],
        "Bodoni 72 Book Italic": [0.9167, 0.3333, 0],
        "Bodoni 72 Oldstyle Bold": [0.9167, 0.25, 0],
        "Bodoni 72 Oldstyle Book": [0.9167, 0.25, 0],
        "Bodoni 72 Oldstyle Book Italic": [0.9167, 0.3333, 0],
        "Bodoni 72 Smallcaps Book": [0.9167, 0.25, 0],
        "Bodoni Ornaments": [0.8333, 0.1667, 0],
        "Bradley Hand Bold": [0.8333, 0.4167, 0],
        "Brush Script MT Italic": [0.9167, 0.3333, 0],
        "Chalkboard": [1, 0.25, 0],
        "Chalkboard Bold": [1, 0.25, 0],
        "Chalkboard SE Bold": [1.1667, 0.25, 0],
        "Chalkboard SE Light": [1.1667, 0.25, 0],
        "Chalkboard SE Regular": [1.1667, 0.25, 0],
        "Chalkduster": [1, 0.25, 0],
        "Charter Black": [1, 0.25, 0],
        "Charter Black Italic": [1, 0.25, 0],
        "Charter Bold": [1, 0.25, 0],
        "Charter Bold Italic": [1, 0.25, 0],
        "Charter Italic": [1, 0.25, 0],
        "Charter Roman": [1, 0.25, 0],
        "Cochin": [0.9167, 0.25, 0],
        "Cochin Bold": [0.9167, 0.25, 0],
        "Cochin Bold Italic": [0.9167, 0.25, 0],
        "Cochin Italic": [0.9167, 0.25, 0],
        "Comic Sans MS": [1.0833, 0.25, 0],
        "Comic Sans MS Bold": [1.0833, 0.25, 0],
        "Copperplate": [0.75, 0.25, 0],
        "Copperplate Bold": [0.75, 0.25, 0],
        "Copperplate Light": [0.75, 0.25, 0],
        "Corsiva Hebrew": [0.6667, 0.3333, 0],
        "Corsiva Hebrew Bold": [0.6667, 0.3333, 0],
        "Courier": [0.75, 0.25, 0],
        "Courier Bold": [0.75, 0.25, 0],
        "Courier Bold Oblique": [0.75, 0.25, 0],
        "Courier New": [0.8333, 0.3333, 0],
        "Courier New Bold": [0.8333, 0.3333, 0],
        "Courier New Bold Italic": [0.8333, 0.3333, 0],
        "Courier New Italic": [0.8333, 0.3333, 0],
        "Courier Oblique": [0.75, 0.25, 0],
        "Damascus Bold": [0.5833, 0.4167, 0],
        "Damascus Light": [0.5833, 0.4167, 0],
        "Damascus Medium": [0.5833, 0.4167, 0],
        "Damascus Regular": [0.5833, 0.4167, 0],
        "Damascus Semi Bold": [0.5833, 0.4167, 0],
        "DecoType Naskh Regular": [1.1667, 0.6667, 0],
        "Devanagari MT": [0.9167, 0.6667, 0],
        "Devanagari MT Bold": [0.9167, 0.6667, 0],
        "Devanagari Sangam MN": [0.9167, 0.4167, 0],
        "Devanagari Sangam MN Bold": [0.9167, 0.4167, 0],
        "Didot": [0.9167, 0.3333, 0],
        "Didot Bold": [1, 0.3333, 0],
        "Didot Italic": [0.9167, 0.25, 0],
        "DIN Alternate Bold": [0.9167, 0.25, 0],
        "DIN Condensed Bold": [0.75, 0.25, 0],
        "Diwan Kufi Regular": [1.4167, 0.5, 0],
        "Diwan Thuluth Regular": [1, 0.6667, 0],
        "Euphemia UCAS": [1.0833, 0.25, 0],
        "Euphemia UCAS Bold": [1.0833, 0.25, 0],
        "Euphemia UCAS Italic": [1.0833, 0.25, 0],
        "Farah Regular": [0.75, 0.25, 0],
        "Farisi Regular": [1.0833, 1, 0],
        "Futura Condensed ExtraBold": [1, 0.25, 0],
        "Futura Condensed Medium": [1, 0.25, 0],
        "Futura Medium": [1, 0.25, 0],
        "Futura Medium Italic": [1, 0.25, 0],
        "GB18030 Bitmap": [1.1667, 0.1667, 0],
        "Geeza Pro Bold": [0.9167, 0.3333, 0],
        "Geeza Pro Regular": [0.9167, 0.3333, 0],
        "Geneva": [1, 0.25, 0],
        "Georgia": [0.9167, 0.25, 0],
        "Georgia Bold": [0.9167, 0.25, 0],
        "Georgia Bold Italic": [0.9167, 0.25, 0],
        "Georgia Italic": [0.9167, 0.25, 0],
        "Gill Sans": [0.9167, 0.25, 0],
        "Gill Sans Bold": [0.9167, 0.25, 0],
        "Gill Sans Bold Italic": [0.9167, 0.25, 0],
        "Gill Sans Italic": [0.9167, 0.25, 0],
        "Gill Sans Light": [0.9167, 0.25, 0],
        "Gill Sans Light Italic": [0.9167, 0.25, 0],
        "Gill Sans SemiBold": [0.9167, 0.25, 0],
        "Gill Sans SemiBold Italic": [0.9167, 0.25, 0],
        "Gill Sans UltraBold": [1, 0.25, 0],
        "Gujarati MT": [0.9167, 0.6667, 0],
        "Gujarati MT Bold": [0.9167, 0.6667, 0],
        "Gujarati Sangam MN": [0.8333, 0.4167, 0],
        "Gujarati Sangam MN Bold": [0.8333, 0.4167, 0],
        "GungSeo Regular": [0.8333, 0.25, 0],
        "Gurmukhi MN": [0.9167, 0.25, 0],
        "Gurmukhi MN Bold": [0.9167, 0.25, 0],
        "Gurmukhi MT": [0.8333, 0.4167, 0],
        "Gurmukhi Sangam MN": [0.9167, 0.3333, 0],
        "Gurmukhi Sangam MN Bold": [0.9167, 0.3333, 0],
        "Hannotate SC Bold": [1.0833, 0.3333, 0],
        "Hannotate SC Regular": [1.0833, 0.3333, 0],
        "Hannotate TC Bold": [1.0833, 0.3333, 0],
        "Hannotate TC Regular": [1.0833, 0.3333, 0],
        "HanziPen SC Bold": [1.0833, 0.3333, 0],
        "HanziPen SC Regular": [1.0833, 0.3333, 0],
        "HanziPen TC Bold": [1.0833, 0.3333, 0],
        "HanziPen TC Regular": [1.0833, 0.3333, 0],
        "HeadLineA Regular": [0.8333, 0.1667, 0],
        "Heiti SC Light": [0.8333, 0.1667, 0],
        "Heiti SC Medium": [0.8333, 0.1667, 0],
        "Heiti TC Light": [0.8333, 0.1667, 0],
        "Heiti TC Medium": [0.8333, 0.1667, 0],
        "Helvetica": [0.75, 0.25, 0],
        "Helvetica Bold": [0.75, 0.25, 0],
        "Helvetica Bold Oblique": [0.75, 0.25, 0],
        "Helvetica Light": [0.75, 0.25, 0],
        "Helvetica Light Oblique": [0.75, 0.25, 0],
        "Helvetica Neue": [0.9167, 0.25, 0],
        "Helvetica Neue Bold": [1, 0.25, 0],
        "Helvetica Neue Bold Italic": [1, 0.25, 0],
        "Helvetica Neue Condensed Black": [1, 0.25, 0],
        "Helvetica Neue Condensed Bold": [1, 0.25, 0],
        "Helvetica Neue Italic": [0.9167, 0.25, 0],
        "Helvetica Neue Light": [1, 0.25, 0],
        "Helvetica Neue Light Italic": [0.9167, 0.25, 0],
        "Helvetica Neue Medium": [1, 0.25, 0],
        "Helvetica Neue Medium Italic": [1, 0.25, 0],
        "Helvetica Neue Thin": [1, 0.25, 0],
        "Helvetica Neue Thin Italic": [1, 0.25, 0],
        "Helvetica Neue UltraLight": [0.9167, 0.25, 0],
        "Helvetica Neue UltraLight Italic": [0.9167, 0.25, 0],
        "Helvetica Oblique": [0.75, 0.25, 0],
        "Herculanum": [0.8333, 0.1667, 0],
        "Hiragino Kaku Gothic Pro W3": [0.9167, 0.0833, 0],
        "Hiragino Kaku Gothic Pro W6": [0.9167, 0.0833, 0],
        "Hiragino Kaku Gothic ProN W3": [0.9167, 0.0833, 0],
        "Hiragino Kaku Gothic ProN W6": [0.9167, 0.0833, 0],
        "Hiragino Kaku Gothic Std W8": [0.9167, 0.0833, 0],
        "Hiragino Kaku Gothic StdN W8": [0.9167, 0.0833, 0],
        "Hiragino Maru Gothic Pro W4": [0.9167, 0.0833, 0],
        "Hiragino Maru Gothic ProN W4": [0.9167, 0.0833, 0],
        "Hiragino Mincho Pro W3": [0.9167, 0.0833, 0],
        "Hiragino Mincho Pro W6": [0.9167, 0.0833, 0],
        "Hiragino Mincho ProN W3": [0.9167, 0.0833, 0],
        "Hiragino Mincho ProN W6": [0.9167, 0.0833, 0],
        "Hiragino Sans GB W3": [0.9167, 0.0833, 0],
        "Hiragino Sans GB W6": [0.9167, 0.0833, 0],
        "Hoefler Text": [0.75, 0.25, 0],
        "Hoefler Text Black": [0.75, 0.25, 0],
        "Hoefler Text Black Italic": [0.75, 0.25, 0],
        "Hoefler Text Italic": [0.75, 0.25, 0],
        "Hoefler Text Ornaments": [0.8333, 0.1667, 0],
        "Impact": [1, 0.25, 0],
        "InaiMathi": [0.8333, 0.4167, 0],
        "Iowan Old Style Black": [1, 0.3333, 0],
        "Iowan Old Style Black Italic": [1, 0.3333, 0],
        "Iowan Old Style Bold": [1, 0.3333, 0],
        "Iowan Old Style Bold Italic": [1, 0.3333, 0],
        "Iowan Old Style Italic": [1, 0.3333, 0],
        "Iowan Old Style Roman": [1, 0.3333, 0],
        "Iowan Old Style Titling": [1, 0.3333, 0],
        "ITF Devanagari Bold": [1.0833, 0.3333, 0],
        "ITF Devanagari Book": [1.0833, 0.3333, 0],
        "ITF Devanagari Demi": [1.0833, 0.3333, 0],
        "ITF Devanagari Light": [1.0833, 0.3333, 0],
        "ITF Devanagari Medium": [1.0833, 0.3333, 0],
        "Kailasa Regular": [1.0833, 0.5833, 0],
        "Kaiti SC Black": [1.0833, 0.3333, 0],
        "Kaiti SC Bold": [1.0833, 0.3333, 0],
        "Kaiti SC Regular": [1.0833, 0.3333, 0],
        "Kaiti TC Bold": [1.0833, 0.3333, 0],
        "Kaiti TC Regular": [1.0833, 0.3333, 0],
        "Kannada MN": [0.9167, 0.25, 0],
        "Kannada MN Bold": [0.9167, 0.25, 0],
        "Kannada Sangam MN": [1, 0.5833, 0],
        "Kannada Sangam MN Bold": [1, 0.5833, 0],
        "Kefa Bold": [0.9167, 0.25, 0],
        "Kefa Regular": [0.9167, 0.25, 0],
        "Khmer MN": [1, 0.8333, 0],
        "Khmer MN Bold": [1, 0.8333, 0],
        "Khmer Sangam MN": [1.0833, 0.8333, 0],
        "Kohinoor Devanagari Bold": [1.0833, 0.3333, 0],
        "Kohinoor Devanagari Book": [1.0833, 0.3333, 0],
        "Kohinoor Devanagari Demi": [1.0833, 0.3333, 0],
        "Kohinoor Devanagari Light": [1.0833, 0.3333, 0],
        "Kohinoor Devanagari Medium": [1.0833, 0.3333, 0],
        "Kokonor Regular": [1.0833, 0.5833, 0],
        "Krungthep": [1, 0.25, 0],
        "KufiStandardGK Regular": [0.9167, 0.5, 0],
        "Lantinghei SC Demibold": [1, 0.3333, 0],
        "Lantinghei SC Extralight": [1, 0.3333, 0],
        "Lantinghei SC Heavy": [1, 0.3333, 0],
        "Lantinghei TC Demibold": [1, 0.3333, 0],
        "Lantinghei TC Extralight": [1, 0.3333, 0],
        "Lantinghei TC Heavy": [1, 0.3333, 0],
        "Lao MN": [0.9167, 0.4167, 0],
        "Lao MN Bold": [0.9167, 0.4167, 0],
        "Lao Sangam MN": [1, 0.3333, 0],
        "Libian SC Regular": [1.0833, 0.3333, 0],
        "LiHei Pro": [0.8333, 0.1667, 0],
        "LiSong Pro": [0.8333, 0.1667, 0],
        "Lucida Grande": [1, 0.25, 0],
        "Lucida Grande Bold": [1, 0.25, 0],
        "Luminari": [1, 0.3333, 0],
        "Malayalam MN": [1, 0.4167, 0],
        "Malayalam MN Bold": [1, 0.4167, 0],
        "Malayalam Sangam MN": [0.8333, 0.4167, 0],
        "Malayalam Sangam MN Bold": [0.8333, 0.4167, 0],
        "Marion Bold": [0.6667, 0.3333, 0],
        "Marion Italic": [0.6667, 0.3333, 0],
        "Marion Regular": [0.6667, 0.3333, 0],
        "Marker Felt Thin": [0.8333, 0.25, 0],
        "Marker Felt Wide": [0.9167, 0.25, 0],
        "Menlo Bold": [0.9167, 0.25, 0],
        "Menlo Bold Italic": [0.9167, 0.25, 0],
        "Menlo Italic": [0.9167, 0.25, 0],
        "Menlo Regular": [0.9167, 0.25, 0],
        "Microsoft Sans Serif": [0.9167, 0.25, 0],
        "Mishafi Gold Regular": [0.75, 0.6667, 0],
        "Mishafi Regular": [0.75, 0.6667, 0],
        "Monaco": [1, 0.25, 0],
        "Mshtakan": [0.9167, 0.25, 0],
        "Mshtakan Bold": [0.9167, 0.25, 0],
        "Mshtakan BoldOblique": [0.9167, 0.25, 0],
        "Mshtakan Oblique": [0.9167, 0.25, 0],
        "Muna Black": [0.75, 0.3333, 0],
        "Muna Bold": [0.75, 0.3333, 0],
        "Muna Regular": [0.75, 0.3333, 0],
        "Myanmar MN": [1, 0.4167, 0],
        "Myanmar MN Bold": [1, 0.4167, 0],
        "Myanmar Sangam MN": [0.9167, 0.4167, 0],
        "Nadeem Regular": [0.9167, 0.4167, 0],
        "Nanum Brush Script": [0.9167, 0.25, 0],
        "Nanum Pen Script": [0.9167, 0.25, 0],
        "NanumGothic": [0.9167, 0.25, 0],
        "NanumGothic Bold": [0.9167, 0.25, 0],
        "NanumGothic ExtraBold": [0.9167, 0.25, 0],
        "NanumMyeongjo": [0.9167, 0.25, 0],
        "NanumMyeongjo Bold": [0.9167, 0.25, 0],
        "NanumMyeongjo ExtraBold": [0.9167, 0.25, 0],
        "New Peninim MT": [0.75, 0.3333, 0],
        "New Peninim MT Bold": [0.75, 0.3333, 0],
        "New Peninim MT Bold Inclined": [0.75, 0.3333, 0],
        "New Peninim MT Inclined": [0.75, 0.3333, 0],
        "Noteworthy Bold": [1.25, 0.3333, 0],
        "Noteworthy Light": [1.25, 0.3333, 0],
        "Optima Bold": [0.9167, 0.25, 0],
        "Optima Bold Italic": [0.9167, 0.25, 0],
        "Optima ExtraBlack": [1, 0.25, 0],
        "Optima Italic": [0.9167, 0.25, 0],
        "Optima Regular": [0.9167, 0.25, 0],
        "Oriya MN": [0.9167, 0.25, 0],
        "Oriya MN Bold": [0.9167, 0.25, 0],
        "Oriya Sangam MN": [0.8333, 0.4167, 0],
        "Oriya Sangam MN Bold": [0.8333, 0.4167, 0],
        "Osaka": [1, 0.25, 0],
        "Osaka-Mono": [0.8333, 0.1667, 0],
        "Palatino": [0.8333, 0.25, 0],
        "Palatino Bold": [0.8333, 0.25, 0],
        "Palatino Bold Italic": [0.8333, 0.25, 0],
        "Palatino Italic": [0.8333, 0.25, 0],
        "Papyrus": [0.9167, 0.5833, 0],
        "Papyrus Condensed": [0.9167, 0.5833, 0],
        "PCMyungjo Regular": [0.8333, 0.25, 0],
        "Phosphate Inline": [0.9167, 0.25, 0],
        "Phosphate Solid": [0.9167, 0.25, 0],
        "PilGi Regular": [0.8333, 0.25, 0],
        "Plantagenet Cherokee": [0.6667, 0.25, 0],
        "PT Mono": [0.9167, 0.25, 0],
        "PT Mono Bold": [0.9167, 0.25, 0],
        "PT Sans": [0.9167, 0.25, 0],
        "PT Sans Bold": [0.9167, 0.25, 0],
        "PT Sans Bold Italic": [0.9167, 0.25, 0],
        "PT Sans Caption": [0.9167, 0.25, 0],
        "PT Sans Caption Bold": [0.9167, 0.25, 0],
        "PT Sans Italic": [0.9167, 0.25, 0],
        "PT Sans Narrow": [0.9167, 0.25, 0],
        "PT Sans Narrow Bold": [0.9167, 0.25, 0],
        "PT Serif": [1, 0.25, 0],
        "PT Serif Bold": [1, 0.25, 0],
        "PT Serif Bold Italic": [1, 0.25, 0],
        "PT Serif Caption": [1, 0.25, 0],
        "PT Serif Caption Italic": [1, 0.25, 0],
        "PT Serif Italic": [1, 0.25, 0],
        "Raanana": [0.75, 0.25, 0],
        "Raanana Bold": [0.75, 0.25, 0],
        "Sana Regular": [0.75, 0.25, 0],
        "Sathu": [0.9167, 0.3333, 0],
        "Savoye LET Plain CC.:1.0": [1.0833, 0.75, 0],
        "Savoye LET Plain:1.0": [0.6667, 0.5, 0],
        "Seravek": [0.9167, 0.3333, 0],
        "Seravek Bold": [0.9167, 0.3333, 0],
        "Seravek Bold Italic": [0.9167, 0.3333, 0],
        "Seravek ExtraLight": [0.9167, 0.3333, 0],
        "Seravek ExtraLight Italic": [0.9167, 0.3333, 0],
        "Seravek Italic": [0.9167, 0.3333, 0],
        "Seravek Light": [0.9167, 0.3333, 0],
        "Seravek Light Italic": [0.9167, 0.3333, 0],
        "Seravek Medium": [0.9167, 0.3333, 0],
        "Seravek Medium Italic": [0.9167, 0.3333, 0],
        "Shree Devanagari 714": [0.9167, 0.4167, 0],
        "Shree Devanagari 714 Bold": [0.9167, 0.4167, 0],
        "Shree Devanagari 714 Bold Italic": [0.9167, 0.4167, 0],
        "Shree Devanagari 714 Italic": [0.9167, 0.4167, 0],
        "SignPainter-HouseScript": [0.6667, 0.1667, 0],
        "Silom": [1, 0.3333, 0],
        "Sinhala MN": [0.9167, 0.25, 0],
        "Sinhala MN Bold": [0.9167, 0.25, 0],
        "Sinhala Sangam MN": [1.1667, 0.3333, 0],
        "Sinhala Sangam MN Bold": [1.1667, 0.3333, 0],
        "Skia Black": [0.75, 0.25, 0],
        "Skia Black Condensed": [0.75, 0.25, 0],
        "Skia Black Extended": [0.75, 0.25, 0],
        "Skia Bold": [0.75, 0.25, 0],
        "Skia Condensed": [0.75, 0.25, 0],
        "Skia Extended": [0.75, 0.25, 0],
        "Skia Light": [0.75, 0.25, 0],
        "Skia Light Condensed": [0.75, 0.25, 0],
        "Skia Light Extended": [0.75, 0.25, 0],
        "Skia Regular": [0.75, 0.25, 0],
        "Snell Roundhand": [0.9167, 0.3333, 0],
        "Snell Roundhand Black": [0.9167, 0.3333, 0],
        "Snell Roundhand Bold": [0.9167, 0.3333, 0],
        "Songti SC Black": [1.0833, 0.3333, 0],
        "Songti SC Bold": [1.0833, 0.3333, 0],
        "Songti SC Light": [1.0833, 0.3333, 0],
        "Songti SC Regular": [1.0833, 0.3333, 0],
        "Songti TC Bold": [1.0833, 0.3333, 0],
        "Songti TC Light": [1.0833, 0.3333, 0],
        "Songti TC Regular": [1.0833, 0.3333, 0],
        "STFangsong": [0.8333, 0.1667, 0],
        "STHeiti": [0.8333, 0.1667, 0],
        "STIXGeneral-Bold": [1.0833, 0.4167, 0],
        "STIXGeneral-BoldItalic": [1.0833, 0.4167, 0],
        "STIXGeneral-Italic": [1.0833, 0.4167, 0],
        "STIXGeneral-Regular": [1.0833, 0.4167, 0],
        "STIXIntegralsD-Bold": [2.1667, 0.4167, 0],
        "STIXIntegralsD-Regular": [2.1667, 0.4167, 0],
        "STIXIntegralsSm-Bold": [1.0833, 0.4167, 0],
        "STIXIntegralsSm-Regular": [1.0833, 0.4167, 0],
        "STIXIntegralsUp-Bold": [1.0833, 0.4167, 0],
        "STIXIntegralsUp-Regular": [1.0833, 0.4167, 0],
        "STIXIntegralsUpD-Bold": [2.1667, 0.4167, 0],
        "STIXIntegralsUpD-Regular": [2.1667, 0.4167, 0],
        "STIXIntegralsUpSm-Bold": [1.0833, 0.4167, 0],
        "STIXIntegralsUpSm-Regular": [1.0833, 0.4167, 0],
        "STIXNonUnicode-Bold": [1.4167, 0.5833, 0],
        "STIXNonUnicode-BoldItalic": [1.4167, 0.5833, 0],
        "STIXNonUnicode-Italic": [1.4167, 0.5833, 0],
        "STIXNonUnicode-Regular": [1.4167, 0.5833, 0],
        "STIXSizeFiveSym-Regular": [1, 0.4167, 0],
        "STIXSizeFourSym-Bold": [2.5833, 0.5, 0],
        "STIXSizeFourSym-Regular": [2.5833, 0.5, 0],
        "STIXSizeOneSym-Bold": [1.5833, 0.3333, 0],
        "STIXSizeOneSym-Regular": [1.5833, 0.3333, 0],
        "STIXSizeThreeSym-Bold": [2.5833, 0.5, 0],
        "STIXSizeThreeSym-Regular": [2.5833, 0.5, 0],
        "STIXSizeTwoSym-Bold": [2.0833, 0.4167, 0],
        "STIXSizeTwoSym-Regular": [2.0833, 0.4167, 0],
        "STIXVariants-Bold": [1.0833, 0.4167, 0],
        "STIXVariants-Regular": [1.0833, 0.4167, 0],
        "STKaiti": [0.8333, 0.1667, 0],
        "STSong": [0.8333, 0.1667, 0],
        "STXihei": [0.8333, 0.1667, 0],
        "Sukhumvit Set Bold": [1.0833, 0.5, 0],
        "Sukhumvit Set Light": [1.0833, 0.5, 0],
        "Sukhumvit Set Medium": [1.0833, 0.5, 0],
        "Sukhumvit Set Semi Bold": [1.0833, 0.5, 0],
        "Sukhumvit Set Text": [1.0833, 0.5, 0],
        "Sukhumvit Set Thin": [1.0833, 0.5, 0],
        "Superclarendon Black": [1, 0.25, 0],
        "Superclarendon Black Italic": [1, 0.25, 0],
        "Superclarendon Bold": [1, 0.25, 0],
        "Superclarendon Bold Italic": [1, 0.25, 0],
        "Superclarendon Italic": [1, 0.25, 0],
        "Superclarendon Light": [1, 0.25, 0],
        "Superclarendon Light Italic": [1, 0.25, 0],
        "Superclarendon Regular": [1, 0.25, 0],
        "Symbol": [0.6667, 0.3333, 0],
        "System Font Bold": [1, 0.25, 0],
        "System Font Bold Italic": [1, 0.25, 0],
        "System Font Heavy": [1, 0.25, 0],
        "System Font Italic": [1, 0.25, 0],
        "System Font Light": [1, 0.25, 0],
        "System Font Medium Italic P4": [1, 0.25, 0],
        "System Font Medium P4": [1, 0.25, 0],
        "System Font Regular": [1, 0.25, 0],
        "System Font Thin": [1, 0.25, 0],
        "System Font UltraLight": [1, 0.25, 0],
        "Tahoma": [1, 0.1667, 0],
        "Tahoma Negreta": [1, 0.1667, 0],
        "Tamil MN": [0.9167, 0.25, 0],
        "Tamil MN Bold": [0.9167, 0.25, 0],
        "Tamil Sangam MN": [0.75, 0.25, 0],
        "Tamil Sangam MN Bold": [0.75, 0.25, 0],
        "Telugu MN": [0.9167, 0.25, 0],
        "Telugu MN Bold": [0.9167, 0.25, 0],
        "Telugu Sangam MN": [1, 0.5833, 0],
        "Telugu Sangam MN Bold": [1, 0.5833, 0],
        "Thonburi": [1.0833, 0.25, 0],
        "Thonburi Bold": [1.0833, 0.25, 0],
        "Thonburi Light": [1.0833, 0.25, 0],
        "Times Bold": [0.75, 0.25, 0],
        "Times Bold Italic": [0.75, 0.25, 0],
        "Times Italic": [0.75, 0.25, 0],
        "Times New Roman": [0.9167, 0.25, 0],
        "Times New Roman Bold": [0.9167, 0.25, 0],
        "Times New Roman Bold Italic": [0.9167, 0.25, 0],
        "Times New Roman Italic": [0.9167, 0.25, 0],
        "Times Roman": [0.75, 0.25, 0],
        "Trattatello": [1.1667, 0.6667, 0],
        "Trebuchet MS": [0.9167, 0.25, 0],
        "Trebuchet MS Bold": [0.9167, 0.25, 0],
        "Trebuchet MS Bold Italic": [0.9167, 0.25, 0],
        "Trebuchet MS Italic": [0.9167, 0.25, 0],
        "Verdana": [1, 0.25, 0],
        "Verdana Bold": [1, 0.25, 0],
        "Verdana Bold Italic": [1, 0.25, 0],
        "Verdana Italic": [1, 0.25, 0],
        "Waseem Light": [0.9167, 0.5833, 0],
        "Waseem Regular": [0.9167, 0.5833, 0],
        "Wawati SC Regular": [1.0833, 0.3333, 0],
        "Wawati TC Regular": [1.0833, 0.3333, 0],
        "Webdings": [0.8333, 0.1667, 0],
        "Weibei SC Bold": [1.0833, 0.3333, 0],
        "Weibei TC Bold": [1.0833, 0.3333, 0],
        "Wingdings": [0.9167, 0.25, 0],
        "Wingdings 2": [0.8333, 0.25, 0],
        "Wingdings 3": [0.9167, 0.25, 0],
        "Xingkai SC Bold": [1.0833, 0.3333, 0],
        "Xingkai SC Light": [1.0833, 0.3333, 0],
        "Yuanti SC Bold": [1.0833, 0.3333, 0],
        "Yuanti SC Light": [1.0833, 0.3333, 0],
        "Yuanti SC Regular": [1.0833, 0.3333, 0],
        "YuGothic Bold": [0.9167, 0.0833, 0],
        "YuGothic Medium": [0.9167, 0.0833, 0],
        "YuMincho Demibold": [0.9167, 0.0833, 0],
        "YuMincho Medium": [0.9167, 0.0833, 0],
        "Yuppy SC Regular": [1.0833, 0.3333, 0],
        "Yuppy TC Regular": [1.0833, 0.3333, 0],
        "Zapf Dingbats": [0.8333, 0.1667, 0],
        "Zapfino": [1.9167, 1.5, 0]
      };
      // Measurements taken on a freshly installed Ubuntu Linux 12.04.5 (Precise Pangolin).
      this.DEVICE_FONT_METRICS_LINUX = {
        __proto__: this.DEVICE_FONT_METRICS_BUILTIN,
        "KacstFarsi": [1.0417, 0.5208, 0],
        "Meera": [0.651, 0.4557, 0],
        "FreeMono": [0.7812, 0.1953, 0],
        "Loma": [1.1719, 0.4557, 0],
        "Century Schoolbook L": [0.9766, 0.3255, 0],
        "KacstTitleL": [1.0417, 0.5208, 0],
        "Garuda": [1.3021, 0.5859, 0],
        "Rekha": [1.1068, 0.2604, 0],
        "Purisa": [1.1068, 0.5208, 0],
        "DejaVu Sans Mono": [0.9115, 0.2604, 0],
        "Vemana2000": [0.9115, 0.8464, 0],
        "KacstOffice": [1.0417, 0.5208, 0],
        "Umpush": [1.237, 0.651, 0],
        "OpenSymbol": [0.7812, 0.1953, 0],
        "Sawasdee": [1.1068, 0.4557, 0],
        "URW Palladio L": [0.9766, 0.3255, 0],
        "FreeSerif": [0.9115, 0.3255, 0],
        "KacstDigital": [1.0417, 0.5208, 0],
        "Ubuntu Condensed": [0.9115, 0.1953, 0],
        "mry_KacstQurn": [1.4323, 0.7161, 0],
        "URW Gothic L": [0.9766, 0.2604, 0],
        "Dingbats": [0.8464, 0.1953, 0],
        "URW Chancery L": [0.9766, 0.3255, 0],
        "Phetsarath OT": [1.1068, 0.5208, 0],
        "Tlwg Typist": [0.9115, 0.3906, 0],
        "KacstLetter": [1.0417, 0.5208, 0],
        "utkal": [1.1719, 0.651, 0],
        "Norasi": [1.237, 0.5208, 0],
        "KacstOne": [1.237, 0.651, 0],
        "Liberation Sans Narrow": [0.9115, 0.2604, 0],
        "Symbol": [1.0417, 0.3255, 0],
        "NanumMyeongjo": [0.9115, 0.2604, 0],
        "Untitled1": [0.651, 0.5859, 0],
        "Lohit Gujarati": [0.9115, 0.3906, 0],
        "Liberation Mono": [0.8464, 0.3255, 0],
        "KacstArt": [1.0417, 0.5208, 0],
        "Mallige": [0.9766, 0.651, 0],
        "Bitstream Charter": [0.9766, 0.2604, 0],
        "NanumGothic": [0.9115, 0.2604, 0],
        "Liberation Serif": [0.9115, 0.2604, 0],
        "Ubuntu": [0.9115, 0.1953, 0],
        "Courier 10 Pitch": [0.8464, 0.3255, 0],
        "Nimbus Sans L": [0.9766, 0.3255, 0],
        "TakaoPGothic": [0.9115, 0.1953, 0],
        "WenQuanYi Micro Hei Mono": [0.9766, 0.2604, 0],
        "DejaVu Sans": [0.9115, 0.2604, 0],
        "Kedage": [0.9766, 0.651, 0],
        "Kinnari": [1.3021, 0.5208, 0],
        "TlwgMono": [0.8464, 0.3906, 0],
        "Standard Symbols L": [1.0417, 0.3255, 0],
        "Lohit Punjabi": [1.1719, 0.651, 0],
        "Nimbus Mono L": [0.8464, 0.3255, 0],
        "Rachana": [0.651, 0.5859, 0],
        "Waree": [1.237, 0.4557, 0],
        "KacstPoster": [1.0417, 0.5208, 0],
        "Khmer OS": [1.3021, 0.7161, 0],
        "FreeSans": [0.9766, 0.3255, 0],
        "gargi": [0.9115, 0.3255, 0],
        "Nimbus Roman No9 L": [0.9115, 0.3255, 0],
        "DejaVu Serif": [0.9115, 0.2604, 0],
        "WenQuanYi Micro Hei": [0.9766, 0.2604, 0],
        "Ubuntu Light": [0.9115, 0.1953, 0],
        "TlwgTypewriter": [0.9115, 0.3906, 0],
        "KacstPen": [1.0417, 0.5208, 0],
        "Tlwg Typo": [0.9115, 0.3906, 0],
        "Mukti Narrow": [1.237, 0.4557, 0],
        "Ubuntu Mono": [0.8464, 0.1953, 0],
        "Lohit Bengali": [0.9766, 0.4557, 0],
        "Liberation Sans": [0.9115, 0.2604, 0],
        "KacstDecorative": [1.1068, 0.5208, 0],
        "Khmer OS System": [1.237, 0.5859, 0],
        "Saab": [0.9766, 0.651, 0],
        "KacstTitle": [1.0417, 0.5208, 0],
        "Mukti Narrow Bold": [1.237, 0.4557, 0],
        "Lohit Hindi": [0.9766, 0.5208, 0],
        "KacstQurn": [1.0417, 0.5208, 0],
        "URW Bookman L": [0.9766, 0.3255, 0],
        "KacstNaskh": [1.0417, 0.5208, 0],
        "KacstScreen": [1.0417, 0.5208, 0],
        "Pothana2000": [0.9115, 0.8464, 0],
        "Lohit Tamil": [0.8464, 0.3906, 0],
        "KacstBook": [1.0417, 0.5208, 0],
        "Sans": [0.9115, 0.2604, 0],
        "Times": [0.9115, 0.3255, 0],
        "Monospace": [0.9115, 0.2604, 0]
      };

      var userAgent = self.navigator.userAgent;
      if (userAgent.indexOf("Windows") > -1) {
        this._deviceFontMetrics = this.DEVICE_FONT_METRICS_WIN;
      } else if (/(Macintosh|iPad|iPhone|iPod|Android)/.test(userAgent)) {
        this._deviceFontMetrics = this.DEVICE_FONT_METRICS_MAC;
        this.DEFAULT_FONT_SANS = 'Helvetica';
        this.DEFAULT_FONT_SERIF = 'Times Roman';
        this.DEFAULT_FONT_TYPEWRITER = 'Courier';
      } else {
        this._deviceFontMetrics = this.DEVICE_FONT_METRICS_LINUX;
        this.DEFAULT_FONT_SANS = 'Sans';
        this.DEFAULT_FONT_SERIF = 'Times';
        this.DEFAULT_FONT_TYPEWRITER = 'Monospace';
      }

      var metrics = this._deviceFontMetrics;
      for (var fontName in metrics) {
        metrics[fontName.toLowerCase()] = metrics[fontName];
      }
    };

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    private _initializeFields() {
      this._fontName = null;
      this._fontFamily = null;
      this._fontStyle = null;
      this._fontType = null;

      this.ascent = 0;
      this.descent = 0;
      this.leading = 0;
      this.advances = null;
      this._id = flash.display.DisplayObject.getNextSyncID();
    }

    private static _deviceFontMetrics: Object;

    private static _getFontMetrics(name: string, style: string) {
      return this._deviceFontMetrics[name + style] || this._deviceFontMetrics[name];
    }

    static resolveFontName(name: string) {
      if (name === '_sans') {
        return this.DEFAULT_FONT_SANS;
      } else if (name === '_serif') {
        return this.DEFAULT_FONT_SERIF;
      } else if (name === '_typewriter') {
        return this.DEFAULT_FONT_TYPEWRITER;
      }
      return name;
    }

    _symbol: FontSymbol;
    applySymbol() {
      release || Debug.assert(this._symbol);
      var symbol = this._symbol;
      release || Debug.assert(symbol.syncId);
      this._initializeFields();

      this._id = symbol.syncId;
      this._fontName = symbol.name;
      var fontClass = this.sec.flash.text.Font.axClass;
      this._fontFamily = fontClass.resolveFontName(symbol.name);
      if (symbol.bold) {
        if (symbol.italic) {
          this._fontStyle = FontStyle.BOLD_ITALIC;
        } else {
          this._fontStyle = FontStyle.BOLD;
        }
      } else if (symbol.italic) {
        this._fontStyle = FontStyle.ITALIC;
      } else {
        this._fontStyle = FontStyle.REGULAR;
      }

      var metrics = symbol.metrics;
      if (metrics) {
        this.ascent = metrics.ascent;
        this.descent = metrics.descent;
        this.leading = metrics.leading;
        this.advances = metrics.advances;
      }

      // Font symbols without any glyphs describe device fonts.
      this._fontType = metrics ? FontType.EMBEDDED : FontType.DEVICE;

      // Keeping fontProp.configurable === true, some old movies have fonts with non-unique
      // names.
      var fontProp = {
        value: this,
        configurable: true
      };
      Object.defineProperty(fontClass._fontsBySymbolId, symbol.id + '', fontProp);
      Object.defineProperty(fontClass._fontsByName, symbol.name.toLowerCase() + this._fontStyle,
                            fontProp);
      if (this._fontType === FontType.EMBEDDED) {
        Object.defineProperty(fontClass._fontsByName, 'swffont' + symbol.syncId + this._fontStyle,
                              fontProp);
      }
    }
    constructor() {
      super();
      if (!this._symbol) {
        this._initializeFields();
      }
    }

    static getBySymbolId(id: number): Font {
      return this._fontsBySymbolId[id];
    }

    static getByNameAndStyle(name: string, style: string): Font {
      var key: string;
      var font: Font;

      // The name argument can be a string specifying a list of comma-delimited font names in which
      // case the first available font should be used.
      var names = name.split(',');
      for (var i = 0; i < names.length && !font; i++) {
        key = names[i].toLowerCase() + style;
        font = this._fontsByName[key];
      }

      if (!font) {
        var font = new this.sec.flash.text.Font();
        font._fontName = names[0];
        font._fontFamily = this.resolveFontName(names[0].toLowerCase());
        font._fontStyle = style;
        font._fontType = FontType.DEVICE;
        this._fontsByName[key] = font;
      }
      if (font._fontType === FontType.DEVICE) {
        var metrics = this._getFontMetrics(font._fontName, font._fontStyle);
        if (!metrics) {
          Shumway.Debug.warning(
            'Font metrics for "' + font._fontName + '" unknown. Fallback to default.');
          metrics = this._getFontMetrics(this.DEFAULT_FONT_SANS, font._fontStyle);
          font._fontFamily = this.DEFAULT_FONT_SANS;
        }
        font.ascent = metrics[0];
        font.descent = metrics[1];
        font.leading = metrics[2];
      }
      return font;
    }

    static getDefaultFont(): Font {
      return this.getByNameAndStyle(this.DEFAULT_FONT_SANS, FontStyle.REGULAR);
    }

    private _fontName: string;
    _fontFamily: string;
    private _fontStyle: string;
    private _fontType: string;

    _id: number;

    ascent: number;
    descent: number;
    leading: number;
    advances: number[];

    static enumerateFonts(enumerateDeviceFonts: boolean = false): ASArray {
      //TODO: support iterating device fonts, perhaps?
      somewhatImplemented("public flash.text.Font::static enumerateFonts");
      return this.sec.createArrayUnsafe(this._fonts.slice());
    }

    static registerFont(font: ASClass): void {
      somewhatImplemented('Font.registerFont');
    }

    /**
     * Registers a font symbol as available in the system.
     *
     * Firefox decodes fonts synchronously, allowing us to do the decoding upon first actual use.
     * All we need to do here is let the system know about the family name and ID, so that both
     * TextFields/Labels referring to the font's symbol ID as well as HTML text specifying a font
     * face can resolve the font.
     *
     * For all other browsers, the decoding has been triggered by the Loader at this point.
     */
    static registerFontSymbol(fontMapping: {name: string; style: string; id: number},
                              loaderInfo: flash.display.LoaderInfo): void {
      var syncId = this.sec.flash.display.DisplayObject.axClass.getNextSyncID();
      var key = fontMapping.name.toLowerCase() + fontMapping.style;
      var resolverProp = {
        get: this.resolveFontSymbol.bind(this, loaderInfo, fontMapping.id, syncId, key),
        configurable: true
      };
      Object.defineProperty(this._fontsByName, key, resolverProp);
      Object.defineProperty(this._fontsByName, 'swffont' + syncId + fontMapping.style,
                            resolverProp);
      Object.defineProperty(this._fontsBySymbolId, fontMapping.id + '', resolverProp);
    }

    static resolveFontSymbol(loaderInfo: flash.display.LoaderInfo, id: number, syncId: number,
                             key: string) {
      // Force font resolution and installation in _fontsByName and _fontsBySymbolId.
      release || assert('get' in Object.getOwnPropertyDescriptor(this._fontsBySymbolId, id + ''));
      var symbol = <FontSymbol>loaderInfo.getSymbolById(id);
      symbol.syncId = syncId;
      release || assert('value' in Object.getOwnPropertyDescriptor(this._fontsBySymbolId, id + ''));
      release || assert('value' in Object.getOwnPropertyDescriptor(this._fontsByName, key));
      return this._fontsByName[key];
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
      str = axCoerceString(str);
      somewhatImplemented('Font#hasGlyphs');
      return true;
    }
  }

  export class FontSymbol extends Timeline.Symbol implements Timeline.EagerlyResolvedSymbol {
    name: string;
    bold: boolean;
    italic: boolean;
    codes: number[];
    originalSize: boolean;
    metrics: any;
    syncId: number;

    constructor(data: Timeline.SymbolData, sec: ISecurityDomain) {
      super(data, sec.flash.text.Font.axClass);
    }

    static FromData(data: any, loaderInfo: display.LoaderInfo): FontSymbol {
      var symbol = new FontSymbol(data, loaderInfo.sec);
      // Immediately mark glyph-less fonts as ready.
      symbol.ready = !data.metrics;
      symbol.name = data.name;
      // No need to keep the original data baggage around.
      symbol.data = {id: data.id};
      symbol.bold = data.bold;
      symbol.italic = data.italic;
      symbol.originalSize = data.originalSize;
      symbol.codes = data.codes;
      symbol.metrics = data.metrics;
      symbol.syncId = flash.display.DisplayObject.getNextSyncID();
      return symbol;
    }

    get resolveAssetCallback() {
      return this._unboundResolveAssetCallback.bind(this);
    }

    private _unboundResolveAssetCallback(data: any) {
      release || Debug.assert(!this.ready);
      this.ready = true;
    }
  }

  export class FontStyle extends ASObject {

    static classInitializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor() {
      super();
    }

    static REGULAR: string = "regular";
    static BOLD: string = "bold";
    static ITALIC: string = "italic";
    static BOLD_ITALIC: string = "boldItalic";
  }

  export class FontType extends ASObject {
    static classInitializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;
    constructor () {
      super();
    }
    static EMBEDDED: string = "embedded";
    static EMBEDDED_CFF: string = "embeddedCFF";
    static DEVICE: string = "device";
  }

  export class GridFitType extends ASObject {
    static classInitializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;
    constructor() {
      super();
    }
    static NONE: string = "none";
    static PIXEL: string = "pixel";
    static SUBPIXEL: string = "subpixel";
    static fromNumber(n: number): string {
      switch (n) {
        case 0:
          return GridFitType.NONE;
        case 1:
          return GridFitType.PIXEL;
        case 2:
          return GridFitType.SUBPIXEL;
        default:
          return null;
      }
    }
    static toNumber(value: string): number {
      switch (value) {
        case GridFitType.NONE:
          return 0;
        case GridFitType.PIXEL:
          return 1;
        case GridFitType.SUBPIXEL:
          return 2;
        default:
          return -1;
      }
    }
  }

  export class StaticText extends flash.display.DisplayObject {
    static classInitializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;
    _symbol: TextSymbol;
    applySymbol() {
      release || assert(this._symbol);
      this._initializeFields();
      this._setStaticContentFromSymbol(this._symbol);
    }
    constructor () {
      super();
      if (!this._fieldsInitialized) {
        this._initializeFields();
      }
    }
    _canHaveTextContent(): boolean {
      return true;
    }
    _getTextContent(): Shumway.TextContent {
      return this._textContent;
    }
    _textContent: Shumway.TextContent;
    get text(): string {
      return this._textContent.plainText;
    }
  }

  export interface Style {
    color?: string;
    display?: string;
    fontFamily?: string;
    fontSize?: any; // number | string
    fontStyle?: string;
    fontWeight?: string;
    kerning?: any; // number | string
    leading?: any; // number | string
    letterSpacing?: any; // number | string
    marginLeft?: any; // number | string
    marginRight?: any; // number | string
    textAlign?: string;
    textDecoration?: string;
    textIndent?: any; // number | string
  }

  export class StyleSheet extends flash.events.EventDispatcher {
    static classInitializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor () {
      super();
      this.clear();
    }

    private _rules: { [key: string]: Style; };

    get styleNames(): ASArray {
      var styles = this._rules;
      var names = [];
      for (var name in styles) {
        if (styles[name]) {
          names.push(name);
        }
      }
      return this.sec.createArrayUnsafe(names);
    }

    getStyle(styleName: string): Style {
      styleName = axCoerceString(styleName);
      var style = this._rules[styleName.toLowerCase()];
      if (!style) {
        return this.sec.createObject(); // note that documentation is lying about `null`;
      }
      return transformJSValueToAS(this.sec, style, false);
    }

    applyStyle(textFormat: TextFormat, styleName: string): TextFormat {
      styleName = axCoerceString(styleName);
      var style = this._rules[styleName.toLowerCase()];
      if (style) {
        return textFormat.transform(style);
      }
      return textFormat;
    }

    setStyle(styleName: string, styleObject: Style) {
      if (typeof styleObject !== 'object') {
        return;
      }
      styleName = axCoerceString(styleName);
      this._rules[styleName.toLowerCase()] = transformASValueToJS(this.sec, styleObject, false);
    }

    hasStyle(styleName: string): boolean {
      return !!this._rules[styleName.toLowerCase()];
    }

    clear() {
      this._rules = Object.create(null);
    }

    transform(formatObject: ASObject): TextFormat {
      if (typeof formatObject !== 'object') {
        return null;
      }
      formatObject = transformASValueToJS(this.sec, formatObject, false);
      var textFormat = new this.sec.flash.text.TextFormat();
      textFormat.transform(formatObject);
      return textFormat;
    }

    parseCSS(css: string) {
      css = axCoerceString(css) + '';
      var length = css.length;
      var index = skipWhitespace(css, 0, length);
      // Styles are only added once parsing completed successfully. Invalid syntax anywhere discards all new styles.
      var newStyles = {};
      var currentNames = [];
      var sawWhitespace = false;
      var name = '';
      while (index < length) {
        var char = css[index++];
        // Everything except whitespace, command, and '{' is valid in names.
        // Note: if no name is given, the empty string is used.
        switch (char) {
          case '{':
            sawWhitespace = false;
            currentNames.push(name);
            // parse style.
            index = parseStyle(css, index, length, currentNames, newStyles);
            if (index === -1) {
              // Syntax error encountered in style parsing.
              return;
            } else if (!release) {
              assert(css[index - 1] === '}');
            }
            currentNames = [];
            name = '';
            index = skipWhitespace(css, index, length);
            break;
          case ',':
            sawWhitespace = false;
            currentNames.push(name);
            name = '';
            index = skipWhitespace(css, index, length);
            break;
          case ' ':
          case '\n':
          case '\r':
          case '\t':
            sawWhitespace = true;
            index = skipWhitespace(css, index, length);
            break;
          default:
            if (sawWhitespace) {
              return;
            }
            name += char;
        }
      }
      var styles = this._rules;
      for (name in newStyles) {
        styles[name.toLowerCase()] = newStyles[name];
      }
    }
  }


  function parseStyle(css: string, index: number, length: number, names: string[], newStyles: any) {
    release || assert(index > 0);
    release || assert(css[index - 1] === '{');
    var style = {};
    var name = '';
    var sawWhitespace = false;
    var upperCase = false;
    index = skipWhitespace(css, index, length);
    // Outer loop parsing property names.
    nameLoop: while (index < length) {
      var char = css[index++];
      switch (char) {
        case '}':
          if (name.length > 0) {
            return -1;
          }
          break nameLoop;
        case ':':
          var value = '';
          var propertyName = name;
          // Reset outer-loop state.
          name = '';
          sawWhitespace = false;
          upperCase = false;
          // Inner loop parsing property values.
          valueLoop: while (index < length) {
            char = css[index];
            switch (char) {
              case ';':
              case '\r':
              case '\n':
                index++;
                index = skipWhitespace(css, index, length);
              // Fallthrough.
              case '}':
                style[propertyName] = value;
                continue nameLoop;
              default:
                index++;
                value += char;
            }
          }
          // If we got here, the inner loop ended by exhausting the string, so the definition
          // wasn't properly closed.
          return -1;
        case '-':
          if (css[index] === ':') {
            name += char;
          } else {
            upperCase = true;
          }
          break;
        case ' ':
        case '\n':
        case '\r':
        case '\t':
          sawWhitespace = true;
          name += char;
          upperCase = false;
          break;
        default:
          // Names that're interrupted by whitespace are invalid.
          if (sawWhitespace) {
            return -1;
          }
          if (upperCase) {
            char = char.toUpperCase();
            upperCase = false;
          }
          name += char;
      }
    }
    if (css[index - 1] !== '}') {
      return -1;
    }
    for (var i = 0; i < names.length; i++) {
      newStyles[names[i]] = style;
    }
    return index;
  }

  function skipWhitespace(css: string, index: number, length: number) {
    while (index < length) {
      var char = css[index];
      switch (char) {
        case ' ':
        case '\n':
        case '\r':
        case '\t':
          index++;
          break;
        default:
          return index;
      }
    }
    release || assert(index === length);
    return length;
  }

  //export class TextColorType extends ASObject {
  //
  //  static classInitializer: any = null;
  //  static classSymbols: string [] = null;
  //  static instanceSymbols: string [] = null;
  //
  //  constructor () {
  //    super();
  //  }
  //
  //  // JS -> AS Bindings
  //  static DARK_COLOR: string = "dark";
  //  static LIGHT_COLOR: string = "light";
  //}

  export class TextDisplayMode extends ASObject {
    static classInitializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;
    constructor() {
      super();
    }
    static LCD: string = "lcd";
    static CRT: string = "crt";
    static DEFAULT: string = "default";
  }

  //export class TextExtent extends ASObject {
  //
  //  constructor(width: number, height: number, textFieldWidth: number, textFieldHeight: number,
  //              ascent: number, descent: number) {
  //    super();
  //    this.width = +width;
  //    this.height = +height;
  //    this.textFieldWidth = +textFieldWidth;
  //    this.textFieldHeight = +textFieldHeight;
  //    this.ascent = +ascent;
  //    this.descent = +descent;
  //  }
  //
  //  width: number;
  //  height: number;
  //  textFieldWidth: number;
  //  textFieldHeight: number;
  //  ascent: number;
  //  descent: number;
  //}

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
      return this._numLines;
    }

    get displayAsPassword(): boolean {
      return this._displayAsPassword;
    }

    set displayAsPassword(value: boolean) {
      somewhatImplemented("public flash.text.TextField::set displayAsPassword");
      this._displayAsPassword = !!value;
    }

    get restrict(): string {
      return this._restrict;
    }

    set restrict(value: string) {
      somewhatImplemented("public flash.text.TextField::set restrict");
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
      somewhatImplemented("public flash.text.TextField::getCharBoundaries");
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
      release || somewhatImplemented("public flash.text.TextField::getLineOffset");
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

  export class TextFieldAutoSize extends ASObject {

    static classInitializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor() {
      super();
    }

    static NONE: string = "none";
    static LEFT: string = "left";
    static CENTER: string = "center";
    static RIGHT: string = "right";

    static fromNumber(n: number): string {
      switch (n) {
        case 0:
          return TextFieldAutoSize.NONE;
        case 1:
          return TextFieldAutoSize.CENTER;
        case 2:
          return TextFieldAutoSize.LEFT;
        case 3:
          return TextFieldAutoSize.RIGHT;
        default:
          return null;
      }
    }

    static toNumber(value: string): number {
      switch (value) {
        case TextFieldAutoSize.NONE:
          return 0;
        case TextFieldAutoSize.CENTER:
          return 1;
        case TextFieldAutoSize.LEFT:
          return 2;
        case TextFieldAutoSize.RIGHT:
          return 3;
        default:
          return -1;
      }
    }
  }

  export class TextFieldType extends ASObject {
    static classInitializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;
    constructor() {
      super();
    }
    static INPUT: string = "input";
    static DYNAMIC: string = "dynamic";
  }

  export class TextFormat extends ASObject {

    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null; // [];

    constructor(font: string = null, size: Object = null, color: Object = null,
                bold: Object = null, italic: Object = null, underline: Object = null,
                url: string = null, target: string = null, align: string = null,
                leftMargin: Object = null, rightMargin: Object = null, indent: Object = null,
                leading: Object = null) {
      super();
      this.font = font;
      this.size = size;
      this.color = color;
      this.bold = bold;
      this.italic = italic;
      this.underline = underline;
      this.url = url;
      this.target = target;
      this.align = align;
      this.leftMargin = leftMargin;
      this.rightMargin = rightMargin;
      this.indent = indent;
      this.leading = leading;
      
      this._blockIndent = null;
      this._bullet = null;
      this._display = TextFormatDisplay.BLOCK;
      this._kerning = null;
      this._letterSpacing = null;
      this._tabStops = null;
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

    // AS -> JS Bindings
    get align(): string {
      return this._align;
    }

    set align(value: string) {
      value = axCoerceString(value);
      //if (TextFormatAlign.toNumber(value) < 0) {
      //  this.sec.throwError("ArgumentError", Errors.InvalidEnumError, "align");
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
      this._color = value != null ? +value | 0 : null;
    }

    get display(): string {
      return this._display;
    }

    set display(value: string) {
      this._display = axCoerceString(value);
    }

    get font(): string {
      return this._font;
    }

    set font(value: string) {
      this._font = axCoerceString(value);
    }

    get style(): string {
      if (this._bold && this._italic) {
        return FontStyle.BOLD_ITALIC;
      } else if (this._bold) {
        return FontStyle.BOLD;
      } else if (this._italic) {
        return FontStyle.ITALIC;
      } else {
        return FontStyle.REGULAR;
      }
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
      this._letterSpacing = TextFormat.coerceNumber(value);
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

    get tabStops(): ASArray {
      return this.sec.createArrayUnsafe(this._tabStops);
    }

    set tabStops(value: ASArray) {
      if (!this.sec.AXArray.axIsType(value)) {
        this.sec.throwError("ArgumentError", Errors.CheckTypeFailedError, value, 'Array');
      }
      this._tabStops = value.value;
    }

    get target(): string {
      return this._target;
    }

    set target(value: string) {
      this._target = axCoerceString(value);
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
      this._url = axCoerceString(value);
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
      /* tslint:disable */
      if (value == undefined) {
        return null;
      }
      /* tslint:enable */
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
      /* tslint:disable */
      return value == undefined ? null : !!value;
      /* tslint:enable */
    }

    clone(): TextFormat {
      var tf = new this.sec.flash.text.TextFormat(
        this._font,
        this._size,
        this._color,
        this._bold,
        this._italic,
        this._underline,
        this._url,
        this._target,
        this._align,
        this._leftMargin,
        this._rightMargin,
        this._indent,
        this._leading
      );
      tf._blockIndent = this._blockIndent;
      tf._bullet = this._bullet;
      tf._display = this._display;
      tf._kerning = this._kerning;
      tf._letterSpacing = this._letterSpacing;
      tf._tabStops = this._tabStops;
      return tf;
    }

    public equals(other: TextFormat): boolean {
      return this._align === other._align &&
             this._blockIndent === other._blockIndent &&
             this._bold === other._bold &&
             this._bullet === other._bullet &&
             this._color === other._color &&
             this._display === other._display &&
             this._font === other._font &&
             this._indent === other._indent &&
             this._italic === other._italic &&
             this._kerning === other._kerning &&
             this._leading === other._leading &&
             this._leftMargin === other._leftMargin &&
             this._letterSpacing === other._letterSpacing &&
             this._rightMargin === other._rightMargin &&
             this._size === other._size &&
             this._tabStops === other._tabStops &&
             this._target === other._target &&
             this._underline === other._underline &&
             this._url === other._url;
    }

    public merge(other: TextFormat) {
      if (other._align !== null) {
        this._align = other._align;
      }
      if (other._blockIndent !== null) {
        this._blockIndent = other._blockIndent;
      }
      if (other._bold !== null) {
        this._bold = other._bold;
      }
      if (other._bullet !== null) {
        this._bullet = other._bullet;
      }
      if (other._color !== null) {
        this._color = other._color;
      }
      if (other._display !== null) {
        this._display = other._display;
      }
      if (other._font) {
        this._font = other._font;
      }
      if (other._indent !== null) {
        this._indent = other._indent;
      }
      if (other._italic !== null) {
        this._italic = other._italic;
      }
      if (other._kerning !== null) {
        this._kerning = other._kerning;
      }
      if (other._leading !== null) {
        this._leading = other._leading;
      }
      if (other._leftMargin !== null) {
        this._leftMargin = other._leftMargin;
      }
      if (other._letterSpacing !== null) {
        this._letterSpacing = other._letterSpacing;
      }
      if (other._rightMargin !== null) {
        this._rightMargin = other._rightMargin;
      }
      if (other._size !== null) {
        this._size = other._size;
      }
      if (other._tabStops !== null) {
        this._tabStops = other._tabStops;
      }
      if (other._target) {
        this._target = other._target;
      }
      if (other._underline !== null) {
        this._underline = other._underline;
      }
      if (other._url) {
        this._url = other._url;
      }
    }

    public intersect(other: TextFormat) {
      if (other._align !== this._align) {
        this._align = null;
      }
      if (other._blockIndent !== this._blockIndent) {
        this._blockIndent = null;
      }
      if (other._bold !== this._bold) {
        this._bold = null;
      }
      if (other._bullet !== this._bullet) {
        this._bullet = null;
      }
      if (other._color !== this._color) {
        this._color = null;
      }
      if (other._display !== this._display) {
        this._display = null;
      }
      if (other._font !== this._font) {
        this._font = null;
      }
      if (other._indent !== this._indent) {
        this._indent = null;
      }
      if (other._italic !== this._italic) {
        this._italic = null;
      }
      if (other._kerning !== this._kerning) {
        this._kerning = null;
      }
      if (other._leading !== this._leading) {
        this._leading = null;
      }
      if (other._leftMargin !== this._leftMargin) {
        this._leftMargin = null;
      }
      if (other._letterSpacing !== this._letterSpacing) {
        this._letterSpacing = null;
      }
      if (other._rightMargin !== this._rightMargin) {
        this._rightMargin = null;
      }
      if (other._size !== this._size) {
        this._size = null;
      }
      if (other._tabStops !== this._tabStops) {
        this._tabStops = null;
      }
      if (other._target !== this._target) {
        this._target = null;
      }
      if (other._underline !== this._underline) {
        this._underline = null;
      }
      if (other._url !== this._url) {
        this._url = null;
      }
    }

    public transform(formatObject: Style) {
      var v = formatObject.textAlign;
      if (v) {
        this.align = v;
      }
      v = formatObject.fontWeight;
      if (v === "bold") {
        this.bold = true;
      } else if (v === "normal") {
        this.bold = false;
      }
      v = formatObject.color;
      if (v) {
        // When parsing colors, whitespace is trimmed away, and all numbers are accepted, as long
        // as they make up the full string after the "#", without any non-numeric pre- or suffix.
        // This implementation is somewhat atrocious, but it should be reasonably fast and works.
        var colorStr = axCoerceString(v).trim().toLowerCase();
        if (colorStr[0] === '#') {
          var numericPart = colorStr.substr(1);
          while (numericPart[0] === '0') {
            numericPart = numericPart.substr(1);
          }
          var colorVal = parseInt(numericPart, 16);
          if (colorVal.toString(16) === numericPart) {
            this.color = colorVal;
          }
        }
      }
      v = formatObject.display;
      if (v) {
        this.display = v;
      }
      v = formatObject.fontFamily;
      if (v) {
        // TODO: Sanitize fontFamily string.
        this.font = v.replace('sans-serif', '_sans').replace('serif', '_serif');
      }
      v = formatObject.textIndent;
      if (v) {
        this.indent = parseInt(v);
      }
      v = formatObject.fontStyle;
      if (v === "italic") {
        this.italic = true;
      } else if (v === "normal") {
        this.italic = false;
      }
      v = formatObject.kerning;
      if (v === "true") {
        this.kerning = 1;
      } else if (v === "false") {
        this.kerning = 0;
      } else {
        this.kerning = parseInt(v);
      }
      v = formatObject.leading;
      if (v) {
        this.leading = parseInt(v);
      }
      v = formatObject.marginLeft;
      if (v) {
        this.leftMargin = parseInt(v);
      }
      v = formatObject.letterSpacing;
      if (v) {
        this.letterSpacing = parseFloat(v);
      }
      v = formatObject.marginRight;
      if (v) {
        this.rightMargin = parseInt(v);
      }
      v = formatObject.fontSize;
      if (v) {
        var size = parseInt(v);
        if (size > 0) {
          this.size = size;
        }
      }
      v = formatObject.textDecoration;
      if (v === "none") {
        this.underline = false;
      } else if (v === "underline") {
        this.underline = true;
      }
      return this;
    }
  }

  export class TextFormatAlign extends ASObject {

    static classInitializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor() {
      super();
    }

    static LEFT: string = "left";
    static CENTER: string = "center";
    static RIGHT: string = "right";
    static JUSTIFY: string = "justify";
    static START: string = "start";
    static END: string = "end";

    static fromNumber(n: number): string {
      switch (n) {
        case 0:
          return TextFormatAlign.LEFT;
        case 1:
          return TextFormatAlign.RIGHT;
        case 2:
          return TextFormatAlign.CENTER;
        case 3:
          return TextFormatAlign.JUSTIFY;
        case 4:
          return TextFormatAlign.START;
        case 5:
          return TextFormatAlign.END;
        default:
          return null;
      }
    }

    static toNumber(value: string): number {
      switch (value) {
        case TextFormatAlign.LEFT:
          return 0;
        case TextFormatAlign.RIGHT:
          return 1;
        case TextFormatAlign.CENTER:
          return 2;
        case TextFormatAlign.JUSTIFY:
          return 3;
        case TextFormatAlign.START:
          return 4;
        case TextFormatAlign.END:
          return 5;
        default:
          return -1;
      }
    }
  }

  export class TextFormatDisplay extends ASObject {

    static classInitializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor() {
      super();
    }

    static INLINE: string = "inline";
    static BLOCK: string = "block";
  }

  export class TextInteractionMode extends ASObject {

    static classInitializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor() {
      super();
    }

    static NORMAL: string = "normal";
    static SELECTION: string = "selection";
  }

  export class TextLineMetrics extends ASObject {

    static classInitializer: any = null;
    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null; // ["x", "width", "height", "ascent", "descent", "leading"];

    constructor(x: number, width: number, height: number, ascent: number, descent: number,
                leading: number) {
      super();
      this.x = +x;
      this.width = +width;
      this.height = +height;
      this.ascent = +ascent;
      this.descent = +descent;
      this.leading = +leading;
    }

    x: number;
    width: number;
    height: number;
    ascent: number;
    descent: number;
    leading: number;
  }

  //export class TextRenderer extends ASObject {
  //
  //  // Called whenever the class is initialized.
  //  static classInitializer: any = null;
  //
  //  // List of static symbols to link.
  //  static classSymbols: string [] = null; // [];
  //
  //  // List of instance symbols to link.
  //  static instanceSymbols: string [] = null; // [];
  //
  //  constructor () {
  //    super();
  //  }
  //
  //  // static _antiAliasType: string;
  //  // static _maxLevel: number /*int*/;
  //  // static _displayMode: string;
  //  get antiAliasType(): string {
  //    release || notImplemented("public flash.text.TextRenderer::get antiAliasType"); return;
  //    // return this._antiAliasType;
  //  }
  //  set antiAliasType(value: string) {
  //    value = axCoerceString(value);
  //    release || notImplemented("public flash.text.TextRenderer::set antiAliasType"); return;
  //    // this._antiAliasType = value;
  //  }
  //  get maxLevel(): number /*int*/ {
  //    release || notImplemented("public flash.text.TextRenderer::get maxLevel"); return;
  //    // return this._maxLevel;
  //  }
  //  set maxLevel(value: number /*int*/) {
  //    value = value | 0;
  //    release || notImplemented("public flash.text.TextRenderer::set maxLevel"); return;
  //    // this._maxLevel = value;
  //  }
  //  get displayMode(): string {
  //    release || notImplemented("public flash.text.TextRenderer::get displayMode"); return;
  //    // return this._displayMode;
  //  }
  //  set displayMode(value: string) {
  //    value = axCoerceString(value);
  //    release || notImplemented("public flash.text.TextRenderer::set displayMode"); return;
  //    // this._displayMode = value;
  //  }
  //  static setAdvancedAntiAliasingTable(fontName: string, fontStyle: string, colorType: string, advancedAntiAliasingTable: ASArray): void {
  //    fontName = axCoerceString(fontName); fontStyle = axCoerceString(fontStyle); colorType = axCoerceString(colorType); advancedAntiAliasingTable = advancedAntiAliasingTable;
  //    release || notImplemented("public flash.text.TextRenderer::static setAdvancedAntiAliasingTable"); return;
  //  }
  //
  //}

  export class TextRun extends ASObject {

    static classInitializer: any = null;

    constructor(beginIndex: number /*int*/, endIndex: number /*int*/,
                textFormat: flash.text.TextFormat) {
      super();
      this._beginIndex = beginIndex | 0;
      this._endIndex = endIndex | 0;
      this._textFormat = textFormat;
    }

    _beginIndex: number /*int*/;
    _endIndex: number /*int*/;
    _textFormat: flash.text.TextFormat;

    get beginIndex(): number {
      return this._beginIndex;
    }

    set beginIndex(value: number) {
      this._beginIndex = value | 0;
    }

    get endIndex(): number {
      return this._endIndex;
    }

    set endIndex(value: number) {
      this._endIndex = value | 0;
    }

    get textFormat(): TextFormat {
      return this._textFormat;
    }

    set textFormat(value: TextFormat) {
      this._textFormat = value;
    }

    clone(): TextRun {
      return new this.sec.flash.text.TextRun(this.beginIndex, this.endIndex,
                                             this.textFormat.clone());
    }

    containsIndex(index: number): boolean {
      return index >= this._beginIndex && index < this._endIndex;
    }

    intersects(beginIndex: number, endIndex: number): boolean {
      return Math.max(this._beginIndex, beginIndex) < Math.min(this._endIndex, endIndex);
    }
  }

  export class TextSnapshot extends ASObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;

    constructor () {
      super();
    }

    // _charCount: number /*int*/;
    get charCount(): number /*int*/ {
      release || notImplemented("public flash.text.TextSnapshot::get charCount"); return;
      // return this._charCount;
    }
    findText(beginIndex: number /*int*/, textToFind: string, caseSensitive: boolean): number /*int*/ {
      beginIndex = beginIndex | 0; textToFind = axCoerceString(textToFind); caseSensitive = !!caseSensitive;
      release || notImplemented("public flash.text.TextSnapshot::findText"); return;
    }
    getSelected(beginIndex: number /*int*/, endIndex: number /*int*/): boolean {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      release || notImplemented("public flash.text.TextSnapshot::getSelected"); return;
    }
    getSelectedText(includeLineEndings: boolean = false): string {
      includeLineEndings = !!includeLineEndings;
      release || notImplemented("public flash.text.TextSnapshot::getSelectedText"); return;
    }
    getText(beginIndex: number /*int*/, endIndex: number /*int*/, includeLineEndings: boolean = false): string {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0; includeLineEndings = !!includeLineEndings;
      release || notImplemented("public flash.text.TextSnapshot::getText"); return;
    }
    getTextRunInfo(beginIndex: number /*int*/, endIndex: number /*int*/): ASArray {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      release || notImplemented("public flash.text.TextSnapshot::getTextRunInfo"); return;
    }
    hitTestTextNearPos(x: number, y: number, maxDistance: number = 0): number {
      x = +x; y = +y; maxDistance = +maxDistance;
      release || notImplemented("public flash.text.TextSnapshot::hitTestTextNearPos"); return;
    }
    setSelectColor(hexColor: number /*uint*/ = 16776960): void {
      hexColor = hexColor >>> 0;
      release || notImplemented("public flash.text.TextSnapshot::setSelectColor"); return;
    }
    setSelected(beginIndex: number /*int*/, endIndex: number /*int*/, select: boolean): void {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0; select = !!select;
      release || notImplemented("public flash.text.TextSnapshot::setSelected"); return;
    }
  }
}
