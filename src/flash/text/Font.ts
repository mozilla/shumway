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
  import asCoerceString = Shumway.AVMX.asCoerceString;
  import assert = Debug.assert;

  import FontStyle = flash.text.FontStyle;
  import FontType = flash.text.FontType;

  export class Font extends ASObject implements Shumway.Remoting.IRemotable {

    static axClass: typeof Font;

    private static _fonts: Font[];
    private static _fontsBySymbolId: Shumway.Map<Font>;
    private static _fontsByName: Shumway.Map<Font>;

    static DEVICE_FONT_METRICS_WIN: Object;
    static DEVICE_FONT_METRICS_LINUX: Object;
    static DEVICE_FONT_METRICS_MAC: Object;
    static DEVICE_FONT_METRICS_BUILTIN: Object;

    static DEFAULT_FONT_SANS = 'Arial';
    static DEFAULT_FONT_SERIF = 'Times New Roman';
    static DEFAULT_FONT_TYPEWRITER = 'Courier New';

    static classInitializer: any = function () {
      Font._fonts = [];
      Font._fontsBySymbolId = Shumway.ObjectUtilities.createMap<Font>();
      Font._fontsByName = Shumway.ObjectUtilities.createMap<Font>();

      Font.DEVICE_FONT_METRICS_BUILTIN = {
        "_sans": [0.9, 0.22, 0.08],
        "_serif": [0.88, 0.26, 0.08],
        "_typewriter": [0.86, 0.24, 0.08]
      };

      // Measurements taken on a freshly installed Windows 7 (Ultimate).
      Font.DEVICE_FONT_METRICS_WIN = {
        __proto__: Font.DEVICE_FONT_METRICS_BUILTIN,
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
      Font.DEVICE_FONT_METRICS_MAC = {
        __proto__: Font.DEVICE_FONT_METRICS_BUILTIN,
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
      Font.DEVICE_FONT_METRICS_LINUX = {
        __proto__: Font.DEVICE_FONT_METRICS_BUILTIN,
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
        Font._deviceFontMetrics = Font.DEVICE_FONT_METRICS_WIN;
      } else if (/(Macintosh|iPad|iPhone|iPod|Android)/.test(userAgent)) {
        Font._deviceFontMetrics = this.DEVICE_FONT_METRICS_MAC;
        Font.DEFAULT_FONT_SANS = 'Helvetica';
        Font.DEFAULT_FONT_SERIF = 'Times Roman';
        Font.DEFAULT_FONT_TYPEWRITER = 'Courier';
      } else {
        Font._deviceFontMetrics = this.DEVICE_FONT_METRICS_LINUX;
        Font.DEFAULT_FONT_SANS = 'Sans';
        Font.DEFAULT_FONT_SERIF = 'Times';
        Font.DEFAULT_FONT_TYPEWRITER = 'Monospace';
      }

      var metrics = Font._deviceFontMetrics;
      for (var fontName in metrics) {
        metrics[fontName.toLowerCase()] = metrics[fontName];
      }
    };

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    _symbol: FontSymbol;
    applySymbol() {
      release || Debug.assert(this._symbol);
      var symbol = this._symbol;
      release || Debug.assert(symbol.syncId);
      this._initializeFields();

      this._id = symbol.syncId;
      this._fontName = symbol.name;
      this._fontFamily = Font.resolveFontName(symbol.name);
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

      var fontProp = Object.getOwnPropertyDescriptor(Font._fontsBySymbolId, symbol.syncId + '');
      // Define mapping or replace lazy getter with value.
      if (!fontProp || !fontProp.value) {
        // Keeping resolverProp.configurable === true, some old movies might
        // have fonts with non-unique names.
        var resolverProp = {
          value: this,
          configurable: true
        };
        Object.defineProperty(Font._fontsBySymbolId, symbol.syncId + '', resolverProp);
        Object.defineProperty(Font._fontsByName, symbol.name.toLowerCase() + this._fontStyle, resolverProp);
        if (this._fontType === FontType.EMBEDDED) {
          Object.defineProperty(Font._fontsByName, 'swffont' + symbol.syncId + this._fontStyle, resolverProp);
        }
      }
    }

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
        return Font.DEFAULT_FONT_SANS;
      } else if (name === '_serif') {
        return Font.DEFAULT_FONT_SERIF;
      } else if (name === '_typewriter') {
        return Font.DEFAULT_FONT_TYPEWRITER;
      }
      return name;
    }

    constructor() {
      super();
      release || assert(!this._symbol);
      this._initializeFields();
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
        var font = new Font();
        font._fontName = names[0];
        font._fontFamily = Font.resolveFontName(names[0].toLowerCase());
        font._fontStyle = style;
        font._fontType = FontType.DEVICE;
        this._fontsByName[key] = font;
      }
      if (font._fontType === FontType.DEVICE) {
        var metrics = Font._getFontMetrics(font._fontName, font._fontStyle);
        if (!metrics) {
          Shumway.Debug.warning(
            'Font metrics for "' + font._fontName + '" unknown. Fallback to default.');
          metrics = Font._getFontMetrics(Font.DEFAULT_FONT_SANS, font._fontStyle);
          font._fontFamily = Font.DEFAULT_FONT_SANS;
        }
        font.ascent = metrics[0];
        font.descent = metrics[1];
        font.leading = metrics[2];
      }
      return font;
    }

    static getDefaultFont(): Font {
      return Font.getByNameAndStyle(Font.DEFAULT_FONT_SANS, FontStyle.REGULAR);
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
    static enumerateFonts(enumerateDeviceFonts: boolean = false): any [] {
      //TODO: support iterating device fonts, perhaps?
      somewhatImplemented("public flash.text.Font::static enumerateFonts");
      return Font._fonts.slice();
    }

    static registerFont(font: ASClass): void {
      somewhatImplemented('Font.registerFont');
    }

    /**
     * Registers an embedded font as available in the system.
     *
     * Firefox decodes fonts synchronously, allowing us to do the decoding upon first actual use.
     * All we need to do here is let the system know about the family name and ID, so that both
     * TextFields/Labels referring to the font's symbol ID as well as HTML text specifying a font
     * face can resolve the font.
     *
     * For all other browsers, the decoding has been triggered by the Loader at this point.
     */
    static registerEmbeddedFont(fontMapping: {name: string; style: string; id: number},
                                loaderInfo: flash.display.LoaderInfo): void {
      var syncId = flash.display.DisplayObject.getNextSyncID();
      var resolverProp = {
        get: Font.resolveEmbeddedFont.bind(Font, loaderInfo, fontMapping.id, syncId),
        configurable: true
      };
      Object.defineProperty(Font._fontsByName, fontMapping.name.toLowerCase() + fontMapping.style,
                            resolverProp);
      Object.defineProperty(Font._fontsByName, 'swffont' + syncId + fontMapping.style,
                            resolverProp);
      Object.defineProperty(Font._fontsBySymbolId, syncId + '', resolverProp);
    }

    static resolveEmbeddedFont(loaderInfo: flash.display.LoaderInfo, id: number, syncId: number) {
      // Force font resolution and installation in _fontsByName and _fontsBySymbolId.
      var symbol = <FontSymbol>loaderInfo.getSymbolById(id);
      symbol.syncId = syncId;
      return Font._fontsBySymbolId[id];
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

  export class FontSymbol extends Timeline.Symbol implements Timeline.EagerlyResolvedSymbol {
    name: string;
    bold: boolean;
    italic: boolean;
    codes: number[];
    originalSize: boolean;
    metrics: any;
    syncId: number;

    constructor(data: Timeline.SymbolData, securityDomain: ISecurityDomain) {
      super(data, securityDomain.flash.text.Font.axClass);
    }

    static FromData(data: any, loaderInfo: display.LoaderInfo): FontSymbol {
      var symbol = new FontSymbol(data, loaderInfo.securityDomain);
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
