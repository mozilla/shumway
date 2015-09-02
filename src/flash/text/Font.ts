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
module Shumway.AVMX.AS.flash.text {
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import assert = Debug.assert;

  import FontStyle = flash.text.FontStyle;
  import FontType = flash.text.FontType;

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
        "Arial": [1, 0.25],
        "Arial Baltic": [1, 0.25],
        "Arial Black": [1.0833, 0.3333],
        "Arial CE": [1, 0.25],
        "Arial CYR": [1, 0.25],
        "Arial Greek": [1, 0.25],
        "Arial TUR": [1, 0.25],
        "Comic Sans MS": [1.0833, 0.3333],
        "Courier New": [1, 0.25],
        "Courier New Baltic": [1, 0.25],
        "Courier New CE": [1, 0.25],
        "Courier New CYR": [1, 0.25],
        "Courier New Greek": [1, 0.25],
        "Courier New TUR": [1, 0.25],
        "Estrangelo Edessa": [0.75, 0.3333],
        "Franklin Gothic Medium": [1, 0.3333],
        "Gautami": [0.9167, 0.8333],
        "Georgia": [1, 0.25],
        "Impact": [1.0833, 0.25],
        "Latha": [1.0833, 0.25],
        "Lucida Console": [0.75, 0.25],
        "Lucida Sans Unicode": [1.0833, 0.25],
        "Mangal": [1.0833, 0.25],
        "Marlett": [1, 0],
        "Microsoft Sans Serif": [1.0833, 0.1667],
        "MV Boli": [0.9167, 0.25],
        "Palatino Linotype": [1.0833, 0.3333],
        "Raavi": [1.0833, 0.6667],
        "Shruti": [1, 0.5],
        "Sylfaen": [1, 0.3333],
        "Symbol": [1, 0.25],
        "Tahoma": [1, 0.1667],
        "Times New Roman": [1, 0.25],
        "Times New Roman Baltic": [1, 0.25],
        "Times New Roman CE": [1, 0.25],
        "Times New Roman CYR": [1, 0.25],
        "Times New Roman Greek": [1, 0.25],
        "Times New Roman TUR": [1, 0.25],
        "Trebuchet MS": [1.0833, 0.4167],
        "Tunga": [1, 0.75],
        "Verdana": [1, 0.1667],
        "Webdings": [1.0833, 0.5],
        "Wingdings": [0.9167, 0.25]
      };
      // Measurements taken on a freshly installed Mac OS X 10.10 (Yosemite).
      this.DEVICE_FONT_METRICS_MAC = {
        __proto__: this.DEVICE_FONT_METRICS_BUILTIN,
        "Al Bayan Bold": [1, 0.5833],
        "Al Bayan Plain": [1, 0.5],
        "Al Nile": [0.8333, 0.5],
        "Al Nile Bold": [0.8333, 0.5],
        "Al Tarikh Regular": [0.5833, 0.4167],
        "American Typewriter": [0.9167, 0.25],
        "American Typewriter Bold": [0.9167, 0.25],
        "American Typewriter Condensed": [0.9167, 0.25],
        "American Typewriter Condensed Bold": [0.9167, 0.25],
        "American Typewriter Condensed Light": [0.8333, 0.25],
        "American Typewriter Light": [0.9167, 0.25],
        "Andale Mono": [0.9167, 0.25],
        "Apple Braille": [0.75, 0.25],
        "Apple Braille Outline 6 Dot": [0.75, 0.25],
        "Apple Braille Outline 8 Dot": [0.75, 0.25],
        "Apple Braille Pinpoint 6 Dot": [0.75, 0.25],
        "Apple Braille Pinpoint 8 Dot": [0.75, 0.25],
        "Apple Chancery": [1.0833, 0.5],
        "Apple Color Emoji": [1.25, 0.4167],
        "Apple SD Gothic Neo Bold": [0.9167, 0.3333],
        "Apple SD Gothic Neo Heavy": [0.9167, 0.3333],
        "Apple SD Gothic Neo Light": [0.9167, 0.3333],
        "Apple SD Gothic Neo Medium": [0.9167, 0.3333],
        "Apple SD Gothic Neo Regular": [0.9167, 0.3333],
        "Apple SD Gothic Neo SemiBold": [0.9167, 0.3333],
        "Apple SD Gothic Neo Thin": [0.9167, 0.3333],
        "Apple SD Gothic Neo UltraLight": [0.9167, 0.3333],
        "Apple SD GothicNeo ExtraBold": [0.9167, 0.3333],
        "Apple Symbols": [0.6667, 0.25],
        "AppleGothic Regular": [0.9167, 0.3333],
        "AppleMyungjo Regular": [0.8333, 0.3333],
        "Arial": [0.9167, 0.25],
        "Arial Black": [1.0833, 0.3333],
        "Arial Bold": [0.9167, 0.25],
        "Arial Bold Italic": [0.9167, 0.25],
        "Arial Hebrew": [0.75, 0.3333],
        "Arial Hebrew Bold": [0.75, 0.3333],
        "Arial Hebrew Light": [0.75, 0.3333],
        "Arial Hebrew Scholar": [0.75, 0.3333],
        "Arial Hebrew Scholar Bold": [0.75, 0.3333],
        "Arial Hebrew Scholar Light": [0.75, 0.3333],
        "Arial Italic": [0.9167, 0.25],
        "Arial Narrow": [0.9167, 0.25],
        "Arial Narrow Bold": [0.9167, 0.25],
        "Arial Narrow Bold Italic": [0.9167, 0.25],
        "Arial Narrow Italic": [0.9167, 0.25],
        "Arial Rounded MT Bold": [0.9167, 0.25],
        "Arial Unicode MS": [1.0833, 0.25],
        "Athelas Bold": [0.9167, 0.25],
        "Athelas Bold Italic": [0.9167, 0.25],
        "Athelas Italic": [0.9167, 0.25],
        "Athelas Regular": [0.9167, 0.25],
        "Avenir Black": [1, 0.3333],
        "Avenir Black Oblique": [1, 0.3333],
        "Avenir Book": [1, 0.3333],
        "Avenir Book Oblique": [1, 0.3333],
        "Avenir Heavy": [1, 0.3333],
        "Avenir Heavy Oblique": [1, 0.3333],
        "Avenir Light": [1, 0.3333],
        "Avenir Light Oblique": [1, 0.3333],
        "Avenir Medium": [1, 0.3333],
        "Avenir Medium Oblique": [1, 0.3333],
        "Avenir Next Bold": [1, 0.3333],
        "Avenir Next Bold Italic": [1, 0.3333],
        "Avenir Next Condensed Bold": [1, 0.3333],
        "Avenir Next Condensed Bold Italic": [1, 0.3333],
        "Avenir Next Condensed Demi Bold": [1, 0.3333],
        "Avenir Next Condensed Demi Bold Italic": [1, 0.3333],
        "Avenir Next Condensed Heavy": [1, 0.3333],
        "Avenir Next Condensed Heavy Italic": [1, 0.3333],
        "Avenir Next Condensed Italic": [1, 0.3333],
        "Avenir Next Condensed Medium": [1, 0.3333],
        "Avenir Next Condensed Medium Italic": [1, 0.3333],
        "Avenir Next Condensed Regular": [1, 0.3333],
        "Avenir Next Condensed Ultra Light": [1, 0.3333],
        "Avenir Next Condensed Ultra Light Italic": [1, 0.3333],
        "Avenir Next Demi Bold": [1, 0.3333],
        "Avenir Next Demi Bold Italic": [1, 0.3333],
        "Avenir Next Heavy": [1, 0.3333],
        "Avenir Next Heavy Italic": [1, 0.3333],
        "Avenir Next Italic": [1, 0.3333],
        "Avenir Next Medium": [1, 0.3333],
        "Avenir Next Medium Italic": [1, 0.3333],
        "Avenir Next Regular": [1, 0.3333],
        "Avenir Next Ultra Light": [1, 0.3333],
        "Avenir Next Ultra Light Italic": [1, 0.3333],
        "Avenir Oblique": [1, 0.3333],
        "Avenir Roman": [1, 0.3333],
        "Ayuthaya": [1.0833, 0.3333],
        "Baghdad Regular": [0.9167, 0.4167],
        "Bangla MN": [1.0833, 0.75],
        "Bangla MN Bold": [1.0833, 0.75],
        "Bangla Sangam MN": [0.9167, 0.4167],
        "Bangla Sangam MN Bold": [0.9167, 0.4167],
        "Baoli SC Regular": [1.0833, 0.3333],
        "Baskerville": [0.9167, 0.25],
        "Baskerville Bold": [0.9167, 0.25],
        "Baskerville Bold Italic": [0.9167, 0.25],
        "Baskerville Italic": [0.9167, 0.25],
        "Baskerville SemiBold": [0.9167, 0.25],
        "Baskerville SemiBold Italic": [0.9167, 0.25],
        "Beirut Regular": [0.75, 0.25],
        "Big Caslon Medium": [0.9167, 0.25],
        "Bodoni 72 Bold": [0.9167, 0.25],
        "Bodoni 72 Book": [0.9167, 0.25],
        "Bodoni 72 Book Italic": [0.9167, 0.3333],
        "Bodoni 72 Oldstyle Bold": [0.9167, 0.25],
        "Bodoni 72 Oldstyle Book": [0.9167, 0.25],
        "Bodoni 72 Oldstyle Book Italic": [0.9167, 0.3333],
        "Bodoni 72 Smallcaps Book": [0.9167, 0.25],
        "Bodoni Ornaments": [0.8333, 0.1667],
        "Bradley Hand Bold": [0.8333, 0.4167],
        "Brush Script MT Italic": [0.9167, 0.3333],
        "Chalkboard": [1, 0.25],
        "Chalkboard Bold": [1, 0.25],
        "Chalkboard SE Bold": [1.1667, 0.25],
        "Chalkboard SE Light": [1.1667, 0.25],
        "Chalkboard SE Regular": [1.1667, 0.25],
        "Chalkduster": [1, 0.25],
        "Charter Black": [1, 0.25],
        "Charter Black Italic": [1, 0.25],
        "Charter Bold": [1, 0.25],
        "Charter Bold Italic": [1, 0.25],
        "Charter Italic": [1, 0.25],
        "Charter Roman": [1, 0.25],
        "Cochin": [0.9167, 0.25],
        "Cochin Bold": [0.9167, 0.25],
        "Cochin Bold Italic": [0.9167, 0.25],
        "Cochin Italic": [0.9167, 0.25],
        "Comic Sans MS": [1.0833, 0.25],
        "Comic Sans MS Bold": [1.0833, 0.25],
        "Copperplate": [0.75, 0.25],
        "Copperplate Bold": [0.75, 0.25],
        "Copperplate Light": [0.75, 0.25],
        "Corsiva Hebrew": [0.6667, 0.3333],
        "Corsiva Hebrew Bold": [0.6667, 0.3333],
        "Courier": [0.75, 0.25],
        "Courier Bold": [0.75, 0.25],
        "Courier Bold Oblique": [0.75, 0.25],
        "Courier New": [0.8333, 0.3333],
        "Courier New Bold": [0.8333, 0.3333],
        "Courier New Bold Italic": [0.8333, 0.3333],
        "Courier New Italic": [0.8333, 0.3333],
        "Courier Oblique": [0.75, 0.25],
        "Damascus Bold": [0.5833, 0.4167],
        "Damascus Light": [0.5833, 0.4167],
        "Damascus Medium": [0.5833, 0.4167],
        "Damascus Regular": [0.5833, 0.4167],
        "Damascus Semi Bold": [0.5833, 0.4167],
        "DecoType Naskh Regular": [1.1667, 0.6667],
        "Devanagari MT": [0.9167, 0.6667],
        "Devanagari MT Bold": [0.9167, 0.6667],
        "Devanagari Sangam MN": [0.9167, 0.4167],
        "Devanagari Sangam MN Bold": [0.9167, 0.4167],
        "Didot": [0.9167, 0.3333],
        "Didot Bold": [1, 0.3333],
        "Didot Italic": [0.9167, 0.25],
        "DIN Alternate Bold": [0.9167, 0.25],
        "DIN Condensed Bold": [0.75, 0.25],
        "Diwan Kufi Regular": [1.4167, 0.5],
        "Diwan Thuluth Regular": [1, 0.6667],
        "Euphemia UCAS": [1.0833, 0.25],
        "Euphemia UCAS Bold": [1.0833, 0.25],
        "Euphemia UCAS Italic": [1.0833, 0.25],
        "Farah Regular": [0.75, 0.25],
        "Farisi Regular": [1.0833, 1],
        "Futura Condensed ExtraBold": [1, 0.25],
        "Futura Condensed Medium": [1, 0.25],
        "Futura Medium": [1, 0.25],
        "Futura Medium Italic": [1, 0.25],
        "GB18030 Bitmap": [1.1667, 0.1667],
        "Geeza Pro Bold": [0.9167, 0.3333],
        "Geeza Pro Regular": [0.9167, 0.3333],
        "Geneva": [1, 0.25],
        "Georgia": [0.9167, 0.25],
        "Georgia Bold": [0.9167, 0.25],
        "Georgia Bold Italic": [0.9167, 0.25],
        "Georgia Italic": [0.9167, 0.25],
        "Gill Sans": [0.9167, 0.25],
        "Gill Sans Bold": [0.9167, 0.25],
        "Gill Sans Bold Italic": [0.9167, 0.25],
        "Gill Sans Italic": [0.9167, 0.25],
        "Gill Sans Light": [0.9167, 0.25],
        "Gill Sans Light Italic": [0.9167, 0.25],
        "Gill Sans SemiBold": [0.9167, 0.25],
        "Gill Sans SemiBold Italic": [0.9167, 0.25],
        "Gill Sans UltraBold": [1, 0.25],
        "Gujarati MT": [0.9167, 0.6667],
        "Gujarati MT Bold": [0.9167, 0.6667],
        "Gujarati Sangam MN": [0.8333, 0.4167],
        "Gujarati Sangam MN Bold": [0.8333, 0.4167],
        "GungSeo Regular": [0.8333, 0.25],
        "Gurmukhi MN": [0.9167, 0.25],
        "Gurmukhi MN Bold": [0.9167, 0.25],
        "Gurmukhi MT": [0.8333, 0.4167],
        "Gurmukhi Sangam MN": [0.9167, 0.3333],
        "Gurmukhi Sangam MN Bold": [0.9167, 0.3333],
        "Hannotate SC Bold": [1.0833, 0.3333],
        "Hannotate SC Regular": [1.0833, 0.3333],
        "Hannotate TC Bold": [1.0833, 0.3333],
        "Hannotate TC Regular": [1.0833, 0.3333],
        "HanziPen SC Bold": [1.0833, 0.3333],
        "HanziPen SC Regular": [1.0833, 0.3333],
        "HanziPen TC Bold": [1.0833, 0.3333],
        "HanziPen TC Regular": [1.0833, 0.3333],
        "HeadLineA Regular": [0.8333, 0.1667],
        "Heiti SC Light": [0.8333, 0.1667],
        "Heiti SC Medium": [0.8333, 0.1667],
        "Heiti TC Light": [0.8333, 0.1667],
        "Heiti TC Medium": [0.8333, 0.1667],
        "Helvetica": [0.75, 0.25],
        "Helvetica Bold": [0.75, 0.25],
        "Helvetica Bold Oblique": [0.75, 0.25],
        "Helvetica Light": [0.75, 0.25],
        "Helvetica Light Oblique": [0.75, 0.25],
        "Helvetica Neue": [0.9167, 0.25],
        "Helvetica Neue Bold": [1, 0.25],
        "Helvetica Neue Bold Italic": [1, 0.25],
        "Helvetica Neue Condensed Black": [1, 0.25],
        "Helvetica Neue Condensed Bold": [1, 0.25],
        "Helvetica Neue Italic": [0.9167, 0.25],
        "Helvetica Neue Light": [1, 0.25],
        "Helvetica Neue Light Italic": [0.9167, 0.25],
        "Helvetica Neue Medium": [1, 0.25],
        "Helvetica Neue Medium Italic": [1, 0.25],
        "Helvetica Neue Thin": [1, 0.25],
        "Helvetica Neue Thin Italic": [1, 0.25],
        "Helvetica Neue UltraLight": [0.9167, 0.25],
        "Helvetica Neue UltraLight Italic": [0.9167, 0.25],
        "Helvetica Oblique": [0.75, 0.25],
        "Herculanum": [0.8333, 0.1667],
        "Hiragino Kaku Gothic Pro W3": [0.9167, 0.0833],
        "Hiragino Kaku Gothic Pro W6": [0.9167, 0.0833],
        "Hiragino Kaku Gothic ProN W3": [0.9167, 0.0833],
        "Hiragino Kaku Gothic ProN W6": [0.9167, 0.0833],
        "Hiragino Kaku Gothic Std W8": [0.9167, 0.0833],
        "Hiragino Kaku Gothic StdN W8": [0.9167, 0.0833],
        "Hiragino Maru Gothic Pro W4": [0.9167, 0.0833],
        "Hiragino Maru Gothic ProN W4": [0.9167, 0.0833],
        "Hiragino Mincho Pro W3": [0.9167, 0.0833],
        "Hiragino Mincho Pro W6": [0.9167, 0.0833],
        "Hiragino Mincho ProN W3": [0.9167, 0.0833],
        "Hiragino Mincho ProN W6": [0.9167, 0.0833],
        "Hiragino Sans GB W3": [0.9167, 0.0833],
        "Hiragino Sans GB W6": [0.9167, 0.0833],
        "Hoefler Text": [0.75, 0.25],
        "Hoefler Text Black": [0.75, 0.25],
        "Hoefler Text Black Italic": [0.75, 0.25],
        "Hoefler Text Italic": [0.75, 0.25],
        "Hoefler Text Ornaments": [0.8333, 0.1667],
        "Impact": [1, 0.25],
        "InaiMathi": [0.8333, 0.4167],
        "Iowan Old Style Black": [1, 0.3333],
        "Iowan Old Style Black Italic": [1, 0.3333],
        "Iowan Old Style Bold": [1, 0.3333],
        "Iowan Old Style Bold Italic": [1, 0.3333],
        "Iowan Old Style Italic": [1, 0.3333],
        "Iowan Old Style Roman": [1, 0.3333],
        "Iowan Old Style Titling": [1, 0.3333],
        "ITF Devanagari Bold": [1.0833, 0.3333],
        "ITF Devanagari Book": [1.0833, 0.3333],
        "ITF Devanagari Demi": [1.0833, 0.3333],
        "ITF Devanagari Light": [1.0833, 0.3333],
        "ITF Devanagari Medium": [1.0833, 0.3333],
        "Kailasa Regular": [1.0833, 0.5833],
        "Kaiti SC Black": [1.0833, 0.3333],
        "Kaiti SC Bold": [1.0833, 0.3333],
        "Kaiti SC Regular": [1.0833, 0.3333],
        "Kaiti TC Bold": [1.0833, 0.3333],
        "Kaiti TC Regular": [1.0833, 0.3333],
        "Kannada MN": [0.9167, 0.25],
        "Kannada MN Bold": [0.9167, 0.25],
        "Kannada Sangam MN": [1, 0.5833],
        "Kannada Sangam MN Bold": [1, 0.5833],
        "Kefa Bold": [0.9167, 0.25],
        "Kefa Regular": [0.9167, 0.25],
        "Khmer MN": [1, 0.8333],
        "Khmer MN Bold": [1, 0.8333],
        "Khmer Sangam MN": [1.0833, 0.8333],
        "Kohinoor Devanagari Bold": [1.0833, 0.3333],
        "Kohinoor Devanagari Book": [1.0833, 0.3333],
        "Kohinoor Devanagari Demi": [1.0833, 0.3333],
        "Kohinoor Devanagari Light": [1.0833, 0.3333],
        "Kohinoor Devanagari Medium": [1.0833, 0.3333],
        "Kokonor Regular": [1.0833, 0.5833],
        "Krungthep": [1, 0.25],
        "KufiStandardGK Regular": [0.9167, 0.5],
        "Lantinghei SC Demibold": [1, 0.3333],
        "Lantinghei SC Extralight": [1, 0.3333],
        "Lantinghei SC Heavy": [1, 0.3333],
        "Lantinghei TC Demibold": [1, 0.3333],
        "Lantinghei TC Extralight": [1, 0.3333],
        "Lantinghei TC Heavy": [1, 0.3333],
        "Lao MN": [0.9167, 0.4167],
        "Lao MN Bold": [0.9167, 0.4167],
        "Lao Sangam MN": [1, 0.3333],
        "Libian SC Regular": [1.0833, 0.3333],
        "LiHei Pro": [0.8333, 0.1667],
        "LiSong Pro": [0.8333, 0.1667],
        "Lucida Grande": [1, 0.25],
        "Lucida Grande Bold": [1, 0.25],
        "Luminari": [1, 0.3333],
        "Malayalam MN": [1, 0.4167],
        "Malayalam MN Bold": [1, 0.4167],
        "Malayalam Sangam MN": [0.8333, 0.4167],
        "Malayalam Sangam MN Bold": [0.8333, 0.4167],
        "Marion Bold": [0.6667, 0.3333],
        "Marion Italic": [0.6667, 0.3333],
        "Marion Regular": [0.6667, 0.3333],
        "Marker Felt Thin": [0.8333, 0.25],
        "Marker Felt Wide": [0.9167, 0.25],
        "Menlo Bold": [0.9167, 0.25],
        "Menlo Bold Italic": [0.9167, 0.25],
        "Menlo Italic": [0.9167, 0.25],
        "Menlo Regular": [0.9167, 0.25],
        "Microsoft Sans Serif": [0.9167, 0.25],
        "Mishafi Gold Regular": [0.75, 0.6667],
        "Mishafi Regular": [0.75, 0.6667],
        "Monaco": [1, 0.25],
        "Mshtakan": [0.9167, 0.25],
        "Mshtakan Bold": [0.9167, 0.25],
        "Mshtakan BoldOblique": [0.9167, 0.25],
        "Mshtakan Oblique": [0.9167, 0.25],
        "Muna Black": [0.75, 0.3333],
        "Muna Bold": [0.75, 0.3333],
        "Muna Regular": [0.75, 0.3333],
        "Myanmar MN": [1, 0.4167],
        "Myanmar MN Bold": [1, 0.4167],
        "Myanmar Sangam MN": [0.9167, 0.4167],
        "Nadeem Regular": [0.9167, 0.4167],
        "Nanum Brush Script": [0.9167, 0.25],
        "Nanum Pen Script": [0.9167, 0.25],
        "NanumGothic": [0.9167, 0.25],
        "NanumGothic Bold": [0.9167, 0.25],
        "NanumGothic ExtraBold": [0.9167, 0.25],
        "NanumMyeongjo": [0.9167, 0.25],
        "NanumMyeongjo Bold": [0.9167, 0.25],
        "NanumMyeongjo ExtraBold": [0.9167, 0.25],
        "New Peninim MT": [0.75, 0.3333],
        "New Peninim MT Bold": [0.75, 0.3333],
        "New Peninim MT Bold Inclined": [0.75, 0.3333],
        "New Peninim MT Inclined": [0.75, 0.3333],
        "Noteworthy Bold": [1.25, 0.3333],
        "Noteworthy Light": [1.25, 0.3333],
        "Optima Bold": [0.9167, 0.25],
        "Optima Bold Italic": [0.9167, 0.25],
        "Optima ExtraBlack": [1, 0.25],
        "Optima Italic": [0.9167, 0.25],
        "Optima Regular": [0.9167, 0.25],
        "Oriya MN": [0.9167, 0.25],
        "Oriya MN Bold": [0.9167, 0.25],
        "Oriya Sangam MN": [0.8333, 0.4167],
        "Oriya Sangam MN Bold": [0.8333, 0.4167],
        "Osaka": [1, 0.25],
        "Osaka-Mono": [0.8333, 0.1667],
        "Palatino": [0.8333, 0.25],
        "Palatino Bold": [0.8333, 0.25],
        "Palatino Bold Italic": [0.8333, 0.25],
        "Palatino Italic": [0.8333, 0.25],
        "Papyrus": [0.9167, 0.5833],
        "Papyrus Condensed": [0.9167, 0.5833],
        "PCMyungjo Regular": [0.8333, 0.25],
        "Phosphate Inline": [0.9167, 0.25],
        "Phosphate Solid": [0.9167, 0.25],
        "PilGi Regular": [0.8333, 0.25],
        "Plantagenet Cherokee": [0.6667, 0.25],
        "PT Mono": [0.9167, 0.25],
        "PT Mono Bold": [0.9167, 0.25],
        "PT Sans": [0.9167, 0.25],
        "PT Sans Bold": [0.9167, 0.25],
        "PT Sans Bold Italic": [0.9167, 0.25],
        "PT Sans Caption": [0.9167, 0.25],
        "PT Sans Caption Bold": [0.9167, 0.25],
        "PT Sans Italic": [0.9167, 0.25],
        "PT Sans Narrow": [0.9167, 0.25],
        "PT Sans Narrow Bold": [0.9167, 0.25],
        "PT Serif": [1, 0.25],
        "PT Serif Bold": [1, 0.25],
        "PT Serif Bold Italic": [1, 0.25],
        "PT Serif Caption": [1, 0.25],
        "PT Serif Caption Italic": [1, 0.25],
        "PT Serif Italic": [1, 0.25],
        "Raanana": [0.75, 0.25],
        "Raanana Bold": [0.75, 0.25],
        "Sana Regular": [0.75, 0.25],
        "Sathu": [0.9167, 0.3333],
        "Savoye LET Plain CC.:1.0": [1.0833, 0.75],
        "Savoye LET Plain:1.0": [0.6667, 0.5],
        "Seravek": [0.9167, 0.3333],
        "Seravek Bold": [0.9167, 0.3333],
        "Seravek Bold Italic": [0.9167, 0.3333],
        "Seravek ExtraLight": [0.9167, 0.3333],
        "Seravek ExtraLight Italic": [0.9167, 0.3333],
        "Seravek Italic": [0.9167, 0.3333],
        "Seravek Light": [0.9167, 0.3333],
        "Seravek Light Italic": [0.9167, 0.3333],
        "Seravek Medium": [0.9167, 0.3333],
        "Seravek Medium Italic": [0.9167, 0.3333],
        "Shree Devanagari 714": [0.9167, 0.4167],
        "Shree Devanagari 714 Bold": [0.9167, 0.4167],
        "Shree Devanagari 714 Bold Italic": [0.9167, 0.4167],
        "Shree Devanagari 714 Italic": [0.9167, 0.4167],
        "SignPainter-HouseScript": [0.6667, 0.1667],
        "Silom": [1, 0.3333],
        "Sinhala MN": [0.9167, 0.25],
        "Sinhala MN Bold": [0.9167, 0.25],
        "Sinhala Sangam MN": [1.1667, 0.3333],
        "Sinhala Sangam MN Bold": [1.1667, 0.3333],
        "Skia Black": [0.75, 0.25],
        "Skia Black Condensed": [0.75, 0.25],
        "Skia Black Extended": [0.75, 0.25],
        "Skia Bold": [0.75, 0.25],
        "Skia Condensed": [0.75, 0.25],
        "Skia Extended": [0.75, 0.25],
        "Skia Light": [0.75, 0.25],
        "Skia Light Condensed": [0.75, 0.25],
        "Skia Light Extended": [0.75, 0.25],
        "Skia Regular": [0.75, 0.25],
        "Snell Roundhand": [0.9167, 0.3333],
        "Snell Roundhand Black": [0.9167, 0.3333],
        "Snell Roundhand Bold": [0.9167, 0.3333],
        "Songti SC Black": [1.0833, 0.3333],
        "Songti SC Bold": [1.0833, 0.3333],
        "Songti SC Light": [1.0833, 0.3333],
        "Songti SC Regular": [1.0833, 0.3333],
        "Songti TC Bold": [1.0833, 0.3333],
        "Songti TC Light": [1.0833, 0.3333],
        "Songti TC Regular": [1.0833, 0.3333],
        "STFangsong": [0.8333, 0.1667],
        "STHeiti": [0.8333, 0.1667],
        "STIXGeneral-Bold": [1.0833, 0.4167],
        "STIXGeneral-BoldItalic": [1.0833, 0.4167],
        "STIXGeneral-Italic": [1.0833, 0.4167],
        "STIXGeneral-Regular": [1.0833, 0.4167],
        "STIXIntegralsD-Bold": [2.1667, 0.4167],
        "STIXIntegralsD-Regular": [2.1667, 0.4167],
        "STIXIntegralsSm-Bold": [1.0833, 0.4167],
        "STIXIntegralsSm-Regular": [1.0833, 0.4167],
        "STIXIntegralsUp-Bold": [1.0833, 0.4167],
        "STIXIntegralsUp-Regular": [1.0833, 0.4167],
        "STIXIntegralsUpD-Bold": [2.1667, 0.4167],
        "STIXIntegralsUpD-Regular": [2.1667, 0.4167],
        "STIXIntegralsUpSm-Bold": [1.0833, 0.4167],
        "STIXIntegralsUpSm-Regular": [1.0833, 0.4167],
        "STIXNonUnicode-Bold": [1.4167, 0.5833],
        "STIXNonUnicode-BoldItalic": [1.4167, 0.5833],
        "STIXNonUnicode-Italic": [1.4167, 0.5833],
        "STIXNonUnicode-Regular": [1.4167, 0.5833],
        "STIXSizeFiveSym-Regular": [1, 0.4167],
        "STIXSizeFourSym-Bold": [2.5833, 0.5],
        "STIXSizeFourSym-Regular": [2.5833, 0.5],
        "STIXSizeOneSym-Bold": [1.5833, 0.3333],
        "STIXSizeOneSym-Regular": [1.5833, 0.3333],
        "STIXSizeThreeSym-Bold": [2.5833, 0.5],
        "STIXSizeThreeSym-Regular": [2.5833, 0.5],
        "STIXSizeTwoSym-Bold": [2.0833, 0.4167],
        "STIXSizeTwoSym-Regular": [2.0833, 0.4167],
        "STIXVariants-Bold": [1.0833, 0.4167],
        "STIXVariants-Regular": [1.0833, 0.4167],
        "STKaiti": [0.8333, 0.1667],
        "STSong": [0.8333, 0.1667],
        "STXihei": [0.8333, 0.1667],
        "Sukhumvit Set Bold": [1.0833, 0.5],
        "Sukhumvit Set Light": [1.0833, 0.5],
        "Sukhumvit Set Medium": [1.0833, 0.5],
        "Sukhumvit Set Semi Bold": [1.0833, 0.5],
        "Sukhumvit Set Text": [1.0833, 0.5],
        "Sukhumvit Set Thin": [1.0833, 0.5],
        "Superclarendon Black": [1, 0.25],
        "Superclarendon Black Italic": [1, 0.25],
        "Superclarendon Bold": [1, 0.25],
        "Superclarendon Bold Italic": [1, 0.25],
        "Superclarendon Italic": [1, 0.25],
        "Superclarendon Light": [1, 0.25],
        "Superclarendon Light Italic": [1, 0.25],
        "Superclarendon Regular": [1, 0.25],
        "Symbol": [0.6667, 0.3333],
        "System Font Bold": [1, 0.25],
        "System Font Bold Italic": [1, 0.25],
        "System Font Heavy": [1, 0.25],
        "System Font Italic": [1, 0.25],
        "System Font Light": [1, 0.25],
        "System Font Medium Italic P4": [1, 0.25],
        "System Font Medium P4": [1, 0.25],
        "System Font Regular": [1, 0.25],
        "System Font Thin": [1, 0.25],
        "System Font UltraLight": [1, 0.25],
        "Tahoma": [1, 0.1667],
        "Tahoma Negreta": [1, 0.1667],
        "Tamil MN": [0.9167, 0.25],
        "Tamil MN Bold": [0.9167, 0.25],
        "Tamil Sangam MN": [0.75, 0.25],
        "Tamil Sangam MN Bold": [0.75, 0.25],
        "Telugu MN": [0.9167, 0.25],
        "Telugu MN Bold": [0.9167, 0.25],
        "Telugu Sangam MN": [1, 0.5833],
        "Telugu Sangam MN Bold": [1, 0.5833],
        "Thonburi": [1.0833, 0.25],
        "Thonburi Bold": [1.0833, 0.25],
        "Thonburi Light": [1.0833, 0.25],
        "Times Bold": [0.75, 0.25],
        "Times Bold Italic": [0.75, 0.25],
        "Times Italic": [0.75, 0.25],
        "Times New Roman": [0.9167, 0.25],
        "Times New Roman Bold": [0.9167, 0.25],
        "Times New Roman Bold Italic": [0.9167, 0.25],
        "Times New Roman Italic": [0.9167, 0.25],
        "Times Roman": [0.75, 0.25],
        "Trattatello": [1.1667, 0.6667],
        "Trebuchet MS": [0.9167, 0.25],
        "Trebuchet MS Bold": [0.9167, 0.25],
        "Trebuchet MS Bold Italic": [0.9167, 0.25],
        "Trebuchet MS Italic": [0.9167, 0.25],
        "Verdana": [1, 0.25],
        "Verdana Bold": [1, 0.25],
        "Verdana Bold Italic": [1, 0.25],
        "Verdana Italic": [1, 0.25],
        "Waseem Light": [0.9167, 0.5833],
        "Waseem Regular": [0.9167, 0.5833],
        "Wawati SC Regular": [1.0833, 0.3333],
        "Wawati TC Regular": [1.0833, 0.3333],
        "Webdings": [0.8333, 0.1667],
        "Weibei SC Bold": [1.0833, 0.3333],
        "Weibei TC Bold": [1.0833, 0.3333],
        "Wingdings": [0.9167, 0.25],
        "Wingdings 2": [0.8333, 0.25],
        "Wingdings 3": [0.9167, 0.25],
        "Xingkai SC Bold": [1.0833, 0.3333],
        "Xingkai SC Light": [1.0833, 0.3333],
        "Yuanti SC Bold": [1.0833, 0.3333],
        "Yuanti SC Light": [1.0833, 0.3333],
        "Yuanti SC Regular": [1.0833, 0.3333],
        "YuGothic Bold": [0.9167, 0.0833],
        "YuGothic Medium": [0.9167, 0.0833],
        "YuMincho Demibold": [0.9167, 0.0833],
        "YuMincho Medium": [0.9167, 0.0833],
        "Yuppy SC Regular": [1.0833, 0.3333],
        "Yuppy TC Regular": [1.0833, 0.3333],
        "Zapf Dingbats": [0.8333, 0.1667],
        "Zapfino": [1.9167, 1.5]
      };
      // Measurements taken on a freshly installed Ubuntu Linux 12.04.5 (Precise Pangolin).
      this.DEVICE_FONT_METRICS_LINUX = {
        __proto__: this.DEVICE_FONT_METRICS_BUILTIN,
        "KacstFarsi": [1.0417, 0.5208],
        "Meera": [0.651, 0.4557],
        "FreeMono": [0.7812, 0.1953],
        "Loma": [1.1719, 0.4557],
        "Century Schoolbook L": [0.9766, 0.3255],
        "KacstTitleL": [1.0417, 0.5208],
        "Garuda": [1.3021, 0.5859],
        "Rekha": [1.1068, 0.2604],
        "Purisa": [1.1068, 0.5208],
        "DejaVu Sans Mono": [0.9115, 0.2604],
        "Vemana2000": [0.9115, 0.8464],
        "KacstOffice": [1.0417, 0.5208],
        "Umpush": [1.237, 0.651],
        "OpenSymbol": [0.7812, 0.1953],
        "Sawasdee": [1.1068, 0.4557],
        "URW Palladio L": [0.9766, 0.3255],
        "FreeSerif": [0.9115, 0.3255],
        "KacstDigital": [1.0417, 0.5208],
        "Ubuntu Condensed": [0.9115, 0.1953],
        "mry_KacstQurn": [1.4323, 0.7161],
        "URW Gothic L": [0.9766, 0.2604],
        "Dingbats": [0.8464, 0.1953],
        "URW Chancery L": [0.9766, 0.3255],
        "Phetsarath OT": [1.1068, 0.5208],
        "Tlwg Typist": [0.9115, 0.3906],
        "KacstLetter": [1.0417, 0.5208],
        "utkal": [1.1719, 0.651],
        "Norasi": [1.237, 0.5208],
        "KacstOne": [1.237, 0.651],
        "Liberation Sans Narrow": [0.9115, 0.2604],
        "Symbol": [1.0417, 0.3255],
        "NanumMyeongjo": [0.9115, 0.2604],
        "Untitled1": [0.651, 0.5859],
        "Lohit Gujarati": [0.9115, 0.3906],
        "Liberation Mono": [0.8464, 0.3255],
        "KacstArt": [1.0417, 0.5208],
        "Mallige": [0.9766, 0.651],
        "Bitstream Charter": [0.9766, 0.2604],
        "NanumGothic": [0.9115, 0.2604],
        "Liberation Serif": [0.9115, 0.2604],
        "Ubuntu": [0.9115, 0.1953],
        "Courier 10 Pitch": [0.8464, 0.3255],
        "Nimbus Sans L": [0.9766, 0.3255],
        "TakaoPGothic": [0.9115, 0.1953],
        "WenQuanYi Micro Hei Mono": [0.9766, 0.2604],
        "DejaVu Sans": [0.9115, 0.2604],
        "Kedage": [0.9766, 0.651],
        "Kinnari": [1.3021, 0.5208],
        "TlwgMono": [0.8464, 0.3906],
        "Standard Symbols L": [1.0417, 0.3255],
        "Lohit Punjabi": [1.1719, 0.651],
        "Nimbus Mono L": [0.8464, 0.3255],
        "Rachana": [0.651, 0.5859],
        "Waree": [1.237, 0.4557],
        "KacstPoster": [1.0417, 0.5208],
        "Khmer OS": [1.3021, 0.7161],
        "FreeSans": [0.9766, 0.3255],
        "gargi": [0.9115, 0.3255],
        "Nimbus Roman No9 L": [0.9115, 0.3255],
        "DejaVu Serif": [0.9115, 0.2604],
        "WenQuanYi Micro Hei": [0.9766, 0.2604],
        "Ubuntu Light": [0.9115, 0.1953],
        "TlwgTypewriter": [0.9115, 0.3906],
        "KacstPen": [1.0417, 0.5208],
        "Tlwg Typo": [0.9115, 0.3906],
        "Mukti Narrow": [1.237, 0.4557],
        "Ubuntu Mono": [0.8464, 0.1953],
        "Lohit Bengali": [0.9766, 0.4557],
        "Liberation Sans": [0.9115, 0.2604],
        "KacstDecorative": [1.1068, 0.5208],
        "Khmer OS System": [1.237, 0.5859],
        "Saab": [0.9766, 0.651],
        "KacstTitle": [1.0417, 0.5208],
        "Mukti Narrow Bold": [1.237, 0.4557],
        "Lohit Hindi": [0.9766, 0.5208],
        "KacstQurn": [1.0417, 0.5208],
        "URW Bookman L": [0.9766, 0.3255],
        "KacstNaskh": [1.0417, 0.5208],
        "KacstScreen": [1.0417, 0.5208],
        "Pothana2000": [0.9115, 0.8464],
        "Lohit Tamil": [0.8464, 0.3906],
        "KacstBook": [1.0417, 0.5208],
        "Sans": [0.9115, 0.2604],
        "Times": [0.9115, 0.3255],
        "Monospace": [0.9115, 0.2604]
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
        font.leading = metrics[2] || 0;
      }
      return font;
    }

    static getDefaultFont(): Font {
      return this.getByNameAndStyle(this.DEFAULT_FONT_SANS, FontStyle.REGULAR);
    }

    // JS -> AS Bindings
    private _fontName: string;
    _fontFamily: string;
    private _fontStyle: string;
    private _fontType: string;

    _id: number;

    ascent: number;
    descent: number;
    leading: number;
    advances: number[];

    // AS -> JS Bindings
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
}
