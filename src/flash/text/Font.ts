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

    static DEVICE_FONT_METRICS_WIN: Object;
    static DEVICE_FONT_METRICS_LINUX: Object;
    static DEVICE_FONT_METRICS_MAC: Object;

    static DEFAULT_FONT_SANS = 'Times New Roman';
    static DEFAULT_FONT_SERIF = 'Arial';
    static DEFAULT_FONT_TYPEWRITER = 'Courier New';

    static classInitializer: any = function () {
      Font._fonts = [];
      Font._fontsBySymbolId = Shumway.ObjectUtilities.createMap<Font>();
      Font._fontsByName = Shumway.ObjectUtilities.createMap<Font>();

      // Measurements taken on a freshly installed Windows 7 (Ultimate).
      Font.DEVICE_FONT_METRICS_WIN = {
        "aharoni": [0.7349, 0.2651, 0],
        "andalus": [1.105, 0.4214, 0],
        "angsana new": [0.9233, 0.2393, 0],
        "angsanaupc": [0.9229, 0.2393, 0],
        "aparajita": [0.7568, 0.4248, 0],
        "arabic typesetting": [0.7007, 0.4375, 0.0088],
        "arabic transparent": [0.8496, 0.3262, 0],
        "arial": [1.1006, 0.3096, 0],
        "arial baltic": [1.1006, 0.3096, 0],
        "arial black": [1.1006, 0.3096, 0],
        "arial ce": [1.1006, 0.3096, 0],
        "arial cyr": [1.1006, 0.3096, 0],
        "arial greek": [1.1006, 0.3096, 0],
        "arial tur": [1.1006, 0.3096, 0],
        "batang": [0.8584, 0.1416, 0.1484],
        "batangche": [0.8584, 0.1416, 0.1484],
        "browallia new": [0.8394, 0.2949, 0],
        "browalliaupc": [0.8394, 0.2949, 0],
        "calibri": [0.75, 0.25, 0.2207],
        "cambria": [0.9502, 0.2222, 0],
        "cambria math": [0.9502, 0.2222, 0],
        "candara": [0.7246, 0.2754, 0.2207],
        "comic sans ms": [1.1021, 0.2915, 0],
        "consolas": [0.7427, 0.2573, 0.1709],
        "constantia": [0.751, 0.249, 0.2207],
        "corbel": [0.7437, 0.2563, 0.2075],
        "cordia new": [0.8931, 0.2539, 0],
        "cordiaupc": [0.833, 0.2617, 0],
        "courier new": [0.8325, 0.3003, 0],
        "courier new baltic": [0.8325, 0.3003, 0],
        "courier new ce": [0.8325, 0.3003, 0],
        "courier new cyr": [0.8325, 0.3003, 0],
        "courier new greek": [0.8325, 0.3003, 0],
        "courier new tur": [0.8325, 0.3003, 0],
        "daunpenh": [0.6821, 0.6592, 0.0156],
        "david": [0.7349, 0.2651, 0],
        "dfkai-sb": [0.8008, 0.1992, 0.1992],
        "dilleniaupc": [0.4709, 0.1289, 0],
        "dokchampa": [0.9761, 0.271, 0],
        "dotum": [0.8584, 0.1416, 0.1484],
        "dotumche": [0.8584, 0.1416, 0.1484],
        "ebrima": [1.0039, 0.2432, 0.0288],
        "estrangelo edessa": [0.8042, 0.314, 0],
        "eucrosiaupc": [0.449, 0.1428, 0],
        "euphemia": [1.0923, 0.2212, 0.041],
        "fangsong": [0.8594, 0.1406, 0.1406],
        "franklin gothic medium": [0.9165, 0.2173, 0],
        "frankruehl": [0.7349, 0.2651, 0],
        "freesiaupc": [0.4561, 0.1309, 0],
        "gabriola": [0.6836, 0.3164, 0.7],
        "gautami": [0.9238, 0.8125, 0.1699],
        "georgia": [0.917, 0.2192, 0],
        "gisha": [0.9272, 0.2446, 0],
        "gulim": [0.8584, 0.1416, 0.1484],
        "gulimche": [0.8584, 0.1416, 0.1484],
        "gungsuh": [0.8584, 0.1416, 0.1484],
        "gungsuhche": [0.8584, 0.1416, 0.1484],
        "impact": [1.0088, 0.2109, 0],
        "irisupc": [0.479, 0.1389, 0],
        "iskoola pota": [0.9126, 0.2422, 0.0254],
        "jasmineupc": [0.481, 0.1318, 0],
        "kaiti": [0.8594, 0.1406, 0.1406],
        "kalinga": [0.9961, 0.4883, 0.0977],
        "kartika": [0.9829, 0.4434, 0],
        "khmer ui": [0.9219, 0.21, 0],
        "kodchiangupc": [0.4939, 0.1348, 0],
        "kokila": [0.7344, 0.4185, 0],
        "lao ui": [1.0791, 0.251, 0],
        "latha": [1, 0.6602, 0],
        "leelawadee": [0.957, 0.2388, 0],
        "levenim mt": [0.9443, 0.4556, 0],
        "lilyupc": [0.698, 0.2549, 0],
        "lucida console": [0.7891, 0.2109, 0],
        "lucida sans unicode": [1.0967, 0.4399, 0],
        "malgun gothic": [1.0884, 0.2417, 0],
        "mangal": [1.2412, 0.4385, 0],
        "marlett": [0.9375, 0, 0],
        "meiryo": [1.0601, 0.4399, 0],
        "meiryo ui": [1.0601, 0.21, 0],
        "microsoft himalaya": [0.5918, 0.4082, 0],
        "microsoft jhenghei": [1.0757, 0.2544, 0],
        "microsoft new tai lue": [0.9272, 0.3809, 0],
        "microsoft phagspa": [0.9277, 0.2441, 0.0977],
        "microsoft sans serif": [0.9219, 0.21, 0],
        "microsoft tai le": [0.9272, 0.3442, 0],
        "microsoft uighur": [0.6836, 0.3164, 0.0811],
        "microsoft yahei": [1.0581, 0.2617, 0],
        "microsoft yi baiti": [0.8594, 0.1416, 0.0259],
        "mingliu": [0.8008, 0.1992, 0.1992],
        "mingliu-extb": [0.8008, 0.1992, 0.1992],
        "mingliu_hkscs": [0.8008, 0.1992, 0.1992],
        "mingliu_hkscs-extb": [0.8008, 0.1992, 0.1992],
        "miriam": [0.7549, 0.2651, 0],
        "miriam fixed": [0.7373, 0.2651, 0],
        "mongolian baiti": [0.8442, 0.2192, 0],
        "moolboran": [0.6821, 0.6592, 0.0156],
        "ms gothic": [0.8594, 0.1406, 0],
        "ms mincho": [0.8594, 0.1406, 0],
        "ms pgothic": [0.8594, 0.1406, 0],
        "ms pmincho": [0.8594, 0.1406, 0],
        "ms ui gothic": [0.8594, 0.1406, 0],
        "mv boli": [1.1392, 0.4722, 0],
        "narkisim": [0.7349, 0.2651, 0],
        "nsimsun": [0.8594, 0.1406, 0.1406],
        "nyala": [0.75, 0.1699, 0.125],
        "palatino linotype": [0.7319, 0.2842, 0.333],
        "plantagenet cherokee": [0.9541, 0.3149, 0.0488],
        "pmingliu": [0.8008, 0.1992, 0.1992],
        "pmingliu-extb": [0.8008, 0.1992, 0.1992],
        "raavi": [1, 0.6602, 0.125],
        "rod": [0.7349, 0.2651, 0],
        "sakkal majalla": [0.8838, 0.5127, 0],
        "segoe print": [1.2476, 0.4951, 0.0225],
        "segoe script": [1.0889, 0.4951, 0],
        "segoe ui": [1.0791, 0.251, 0],
        "segoe ui light": [1.0791, 0.251, 0],
        "segoe ui semibold": [1.0791, 0.251, 0],
        "segoe ui symbol": [1.0791, 0.251, 0],
        "shonar bangla": [0.8403, 0.4775, 0],
        "shruti": [1.0176, 0.6602, 0.1563],
        "simhei": [0.8594, 0.1406, 0.1406],
        "simplified arabic": [1.1797, 0.478, 0],
        "simplified arabic fixed": [0.7998, 0.292, 0],
        "simsun": [0.8594, 0.1406, 0.1406],
        "simsun-extb": [0.8594, 0.1406, 0],
        "sylfaen": [0.7373, 0.2813, 0.2983],
        "symbol": [1.0054, 0.2197, 0],
        "tahoma": [1.0005, 0.2065, 0],
        "times new roman": [0.8911, 0.2163, 0.0425],
        "times new roman baltic": [0.8911, 0.2163, 0.0425],
        "times new roman ce": [0.8911, 0.2163, 0.0425],
        "times new roman cyr": [0.8911, 0.2163, 0.0425],
        "times new roman greek": [0.8911, 0.2163, 0.0425],
        "times new roman tur": [0.8911, 0.2163, 0.0425],
        "traditional arabic": [0.9941, 0.5005, 0],
        "trebuchet ms": [0.939, 0.2222, 0],
        "tunga": [1, 0.6602, 0.1094],
        "utsaah": [0.7412, 0.3779, 0],
        "vani": [0.9424, 0.7417, 0],
        "verdana": [1.0054, 0.21, 0],
        "vijaya": [0.7139, 0.293, 0],
        "vrinda": [0.9849, 0.3799, 0.041],
        "webdings": [0.7998, 0.2002, 0],
        "wingdings": [0.8989, 0.2109, 0]
      };
      // Measurements taken on a freshly installed Mac OS X 10.10 (Yosemite).
      Font.DEVICE_FONT_METRICS_MAC = {
        "al bayan plain": [0.991, 0.509, 0],
        "al nile": [0.83, 0.535, 0],
        "al tarikh regular": [0.5542, 0.4458, 0],
        "american typewriter": [0.904, 0.25, 0],
        "andale mono": [0.9072, 0.2178, 0],
        "apple braille": [0.7813, 0.25, 0.0835],
        "apple braille outline 6 dot": [0.7813, 0.25, 0.0835],
        "apple braille outline 8 dot": [0.7813, 0.25, 0.0835],
        "apple braille pinpoint 6 dot": [0.7813, 0.25, 0.0835],
        "apple braille pinpoint 8 dot": [0.7813, 0.25, 0.0835],
        "apple chancery": [1.1177, 0.4648, 0],
        "apple color emoji": [1, 0.3125, 0],
        "apple sd gothic neo bold": [0.9, 0.3, 0],
        "apple sd gothic neo heavy": [0.9, 0.3, 0],
        "apple sd gothic neo light": [0.9, 0.3, 0],
        "apple sd gothic neo medium": [0.9, 0.3, 0],
        "apple sd gothic neo regular": [0.9, 0.3, 0],
        "apple sd gothic neo semibold": [0.9, 0.3, 0],
        "apple sd gothic neo thin": [0.9, 0.3, 0],
        "apple sd gothic neo ultralight": [0.9, 0.3, 0],
        "apple sd gothicneo extrabold": [0.9, 0.3, 0],
        "apple symbols": [0.6665, 0.25, 0.0835],
        "applegothic regular": [0.891, 0.325, 0],
        "applemyungjo regular": [0.8693, 0.318, 0],
        "arial": [0.9053, 0.2119, 0.0327],
        "arial black": [1.1006, 0.3096, 0],
        "arial bold": [0.9053, 0.2119, 0.0327],
        "arial bold italic": [0.9053, 0.2119, 0.0327],
        "arial hebrew": [0.73, 0.335, 0],
        "arial italic": [0.9053, 0.2119, 0.0327],
        "arial narrow": [0.9355, 0.2119, 0],
        "arial narrow bold": [0.9355, 0.2119, 0],
        "arial narrow bold italic": [0.9355, 0.2119, 0],
        "arial narrow italic": [0.9355, 0.2119, 0],
        "arial rounded mt bold": [0.9463, 0.2109, 0],
        "arial unicode ms": [1.0688, 0.271, 0],
        "athelas regular": [0.88, 0.24, 0],
        "avenir book": [1, 0.366, 0],
        "avenir next bold": [1, 0.366, 0],
        "avenir next condensed bold": [1, 0.366, 0],
        "ayuthaya": [1.0671, 0.321, 0],
        "baghdad regular": [0.918, 0.4463, 0],
        "bangla mn": [1.0528, 0.7767, 0],
        "bangla sangam mn": [0.9244, 0.4267, 0.1333],
        "baoli sc regular": [1.06, 0.34, 0],
        "baskerville": [0.8965, 0.2549, 0],
        "baskerville bold": [0.8965, 0.2549, 0],
        "beirut regular": [0.7666, 0.2749, 0],
        "big caslon medium": [0.934, 0.257, 0.018],
        "bodoni 72 book": [0.936, 0.266, 0],
        "bodoni 72 oldstyle book": [0.936, 0.266, 0],
        "bodoni 72 smallcaps book": [0.936, 0.262, 0],
        "bodoni ornaments": [0.81, 0.191, 0],
        "bradley hand bold": [0.85, 0.399, 0],
        "brush script mt italic": [0.8887, 0.3379, 0],
        "chalkboard": [0.9801, 0.2829, 0.0133],
        "chalkboard se light": [1.1315, 0.2829, 0.0133],
        "chalkduster": [0.9801, 0.2829, 0.0133],
        "charter roman": [0.98, 0.2402, 0],
        "cochin": [0.897, 0.25, 0],
        "comic sans ms": [1.1021, 0.2915, 0],
        "comic sans ms bold": [1.1021, 0.2915, 0],
        "copperplate": [0.763, 0.248, 0.019],
        "corsiva hebrew": [0.625, 0.3076, 0],
        "courier": [0.7539, 0.2461, 0],
        "courier new": [0.8325, 0.3003, 0],
        "courier new bold": [0.8325, 0.3003, 0],
        "courier new bold italic": [0.8325, 0.3003, 0],
        "courier new italic": [0.8325, 0.3003, 0],
        "damascus regular": [0.5801, 0.4199, 0.0215],
        "decotype naskh regular": [1.1752, 0.6391, 0],
        "devanagari mt": [0.9253, 0.6826, 0],
        "devanagari sangam mn": [0.9244, 0.4267, 0.1333],
        "didot": [0.941, 0.299, 0.024],
        "din alternate bold": [0.938, 0.2261, 0],
        "din condensed bold": [0.712, 0.288, 0.2],
        "diwan kufi regular": [1.3916, 0.4883, 0],
        "diwan thuluth regular": [1.0112, 0.7026, 0],
        "euphemia ucas": [1.0923, 0.2275, 0.041],
        "farah regular": [0.7544, 0.2456, 0],
        "farisi regular": [1.105, 0.9766, 0],
        "futura medium": [1.0386, 0.2598, 0.0298],
        "geeza pro regular": [0.8951, 0.3309, 0.1356],
        "geneva": [1, 0.25, 0.0835],
        "georgia": [0.917, 0.2192, 0],
        "georgia bold": [0.917, 0.2192, 0],
        "georgia bold italic": [0.917, 0.2192, 0],
        "georgia italic": [0.917, 0.2192, 0],
        "gill sans": [0.918, 0.2305, 0],
        "gujarati mt": [0.9082, 0.6323, 0],
        "gujarati mt bold": [0.9082, 0.6323, 0],
        "gujarati sangam mn": [0.8125, 0.375, 0.1172],
        "gungseo regular": [0.799, 0.2088, 0],
        "gurmukhi mn": [0.8911, 0.2808, 0.0425],
        "gurmukhi mt": [0.8643, 0.4395, 0],
        "gurmukhi sangam mn": [0.95, 0.35, 0],
        "hannotate sc regular": [1.06, 0.34, 0],
        "hanzipen sc regular": [1.06, 0.34, 0],
        "headlinea regular": [0.7998, 0.208, 0],
        "heiti tc light": [0.86, 0.14, 0.03],
        "heiti tc medium": [0.86, 0.14, 0.03],
        "helvetica": [0.77, 0.23, 0],
        "helvetica neue": [0.975, 0.217, 0.029],
        "helvetica neue bold": [0.975, 0.217, 0.029],
        "herculanum": [0.795, 0.205, 0],
        "hiragino kaku gothic pro w3": [0.88, 0.12, 0.5],
        "hiragino kaku gothic pro w6": [0.88, 0.12, 0.5],
        "hiragino kaku gothic pron w3": [0.88, 0.12, 0.5],
        "hiragino kaku gothic pron w6": [0.88, 0.12, 0.5],
        "hiragino kaku gothic std w8": [0.88, 0.12, 0.5],
        "hiragino kaku gothic stdn w8": [0.88, 0.12, 0.5],
        "hiragino maru gothic pro w4": [0.88, 0.12, 0.5],
        "hiragino maru gothic pron w4": [0.88, 0.12, 0.5],
        "hiragino mincho pro w3": [0.88, 0.12, 0.5],
        "hiragino mincho pro w6": [0.88, 0.12, 0.5],
        "hiragino mincho pron w3": [0.88, 0.12, 0.5],
        "hiragino mincho pron w6": [0.88, 0.12, 0.5],
        "hiragino sans gb w3": [0.88, 0.12, 0.5],
        "hiragino sans gb w6": [0.88, 0.12, 0.5],
        "hoefler text": [0.721, 0.279, 0],
        "hoefler text ornaments": [0.8065, 0.208, 0],
        "impact": [1.0088, 0.2109, 0],
        "inaimathi": [0.85, 0.4, 0],
        "iowan old style black": [1.0361, 0.3291, 0],
        "itf devanagari book": [1.05, 0.35, 0.1],
        "kailasa regular": [1.0718, 0.5708, 0],
        "kaiti sc black": [1.06, 0.34, 0],
        "kannada mn": [0.8911, 0.2808, 0.0425],
        "kannada sangam mn": [0.9868, 0.62, 0.0137],
        "kefa regular": [0.9316, 0.2246, 0],
        "khmer mn": [0.9863, 0.8267, 0],
        "khmer sangam mn": [1.12, 0.863, 0],
        "kohinoor devanagari book": [1.05, 0.35, 0.1],
        "kokonor regular": [1.0438, 0.6138, 0.0162],
        "krungthep": [1.0105, 0.2625, 0],
        "kufistandardgk regular": [0.9434, 0.4668, 0],
        "lantinghei sc demibold": [1.0273, 0.3633, 0],
        "lao mn": [0.8911, 0.4395, 0.0425],
        "lao sangam mn": [1, 0.3, 0],
        "libian sc regular": [1.06, 0.34, 0],
        "lihei pro": [0.86, 0.14, 0],
        "lisong pro": [0.86, 0.14, 0],
        "lucida grande": [0.9668, 0.2109, 0],
        "luminari": [0.983, 0.356, 0],
        "malayalam mn": [1, 0.3867, 0.0234],
        "malayalam sangam mn": [0.8125, 0.375, 0.1172],
        "marion regular": [0.7, 0.3, 0.051],
        "marker felt thin": [0.868, 0.218, 0],
        "menlo regular": [0.9282, 0.2358, 0],
        "microsoft sans serif": [0.9219, 0.21, 0],
        "mishafi gold regular": [0.7847, 0.6621, 0],
        "mishafi regular": [0.7847, 0.6621, 0],
        "monaco": [1, 0.25, 0.0835],
        "mshtakan": [0.8911, 0.2163, 0.0425],
        "mshtakan bold": [0.8911, 0.2163, 0.0425],
        "mshtakan boldoblique": [0.8911, 0.2163, 0.0425],
        "mshtakan oblique": [0.8911, 0.2163, 0.0425],
        "muna regular": [0.7363, 0.335, 0],
        "myanmar mn": [0.9766, 0.4395, 0],
        "myanmar sangam mn": [0.93, 0.42, 0],
        "nadeem regular": [0.918, 0.4531, 0],
        "nanum brush script": [0.92, 0.23, 0],
        "nanumgothic": [0.92, 0.23, 0],
        "nanummyeongjo": [0.9199, 0.2305, 0],
        "new peninim mt": [0.7271, 0.2964, 0],
        "noteworthy light": [1.28, 0.32, 0.015],
        "optima regular": [0.919, 0.268, 0.025],
        "oriya mn": [0.8911, 0.2808, 0.0425],
        "oriya sangam mn": [0.8125, 0.375, 0.1172],
        "osaka": [0.8555, 0.1914, 0],
        "osaka-mono": [0.8555, 0.1914, 0],
        "palatino": [0.8228, 0.2773, 0],
        "papyrus": [0.9399, 0.603, 0],
        "papyrus condensed": [0.9399, 0.603, 0],
        "pcmyungjo regular": [0.7998, 0.209, 0],
        "phosphate inline": [0.94, 0.26, 0.05],
        "pilgi regular": [0.7998, 0.209, 0],
        "plantagenet cherokee": [0.697, 0.285, 0.074],
        "pt mono": [0.885, 0.235, 0],
        "pt mono bold": [0.885, 0.235, 0],
        "pt sans": [0.9, 0.276, 0.119],
        "pt serif": [1.018, 0.276, 0],
        "pt serif caption": [1.018, 0.276, 0],
        "raanana": [0.7158, 0.2842, 0],
        "sana regular": [0.7461, 0.2539, 0],
        "sathu": [0.9035, 0.3171, 0],
        "savoye let plain:1.0": [0.6885, 0.5, 0],
        "seravek": [0.925, 0.302, 0],
        "shree devanagari 714": [0.9242, 0.4273, 0.1329],
        "signpainter-housescript": [0.7, 0.2, 0.068],
        "silom": [0.959, 0.316, 0],
        "sinhala mn": [0.8911, 0.2808, 0],
        "sinhala sangam mn": [1.1327, 0.3413, 0],
        "snell roundhand": [0.937, 0.324, 0],
        "songti sc black": [1.06, 0.34, 0],
        "stfangsong": [0.86, 0.14, 0],
        "stheiti": [0.86, 0.14, 0],
        "stixgeneral-bold": [1.055, 0.455, 0],
        "stixgeneral-bolditalic": [1.042, 0.455, 0],
        "stixgeneral-italic": [1.055, 0.455, 0],
        "stixgeneral-regular": [1.055, 0.455, 0],
        "stixintegralsd-bold": [2.182, 0.451, 0],
        "stixintegralsd-regular": [2.182, 0.451, 0],
        "stixintegralssm-bold": [1.055, 0.455, 0],
        "stixintegralssm-regular": [1.055, 0.455, 0],
        "stixintegralsup-bold": [1.055, 0.455, 0],
        "stixintegralsup-regular": [1.055, 0.455, 0],
        "stixintegralsupd-bold": [2.182, 0.451, 0],
        "stixintegralsupd-regular": [2.182, 0.451, 0],
        "stixintegralsupsm-bold": [1.055, 0.455, 0],
        "stixintegralsupsm-regular": [1.055, 0.455, 0],
        "stixnonunicode-bold": [1.45, 0.552, 0],
        "stixnonunicode-bolditalic": [1.45, 0.552, 0],
        "stixnonunicode-italic": [1.45, 0.552, 0],
        "stixnonunicode-regular": [1.45, 0.552, 0],
        "stixsizefivesym-regular": [0.96, 0.454, 0],
        "stixsizefoursym-bold": [2.604, 0.51, 0],
        "stixsizefoursym-regular": [2.604, 0.51, 0],
        "stixsizeonesym-bold": [1.588, 0.363, 0],
        "stixsizeonesym-regular": [1.588, 0.363, 0],
        "stixsizethreesym-bold": [2.604, 0.51, 0],
        "stixsizethreesym-regular": [2.604, 0.51, 0],
        "stixsizetwosym-bold": [2.095, 0.404, 0],
        "stixsizetwosym-regular": [2.095, 0.404, 0],
        "stixvariants-bold": [1.055, 0.455, 0],
        "stixvariants-regular": [1.055, 0.455, 0],
        "stxihei": [0.86, 0.14, 0],
        "sukhumvit set thin": [1.103, 0.474, 0.01],
        "superclarendon regular": [0.98, 0.225, 0.056],
        "symbol": [0.7012, 0.2988, 0],
        "system font regular": [0.9665, 0.2114, 0],
        "tahoma": [1.0005, 0.2065, 0],
        "tahoma negreta": [1.0005, 0.2065, 0],
        "tamil mn": [0.8911, 0.2808, 0.0425],
        "tamil sangam mn": [0.75, 0.25, 0],
        "telugu mn": [0.8911, 0.2808, 0.0425],
        "telugu sangam mn": [0.9868, 0.62, 0.0137],
        "thonburi": [1.0816, 0.2281, 0.0668],
        "times new roman": [0.8911, 0.2163, 0.0425],
        "times new roman bold": [0.8911, 0.2163, 0.0425],
        "times new roman bold italic": [0.8911, 0.2163, 0.0425],
        "times new roman italic": [0.8911, 0.2163, 0.0425],
        "times roman": [0.75, 0.25, 0],
        "trattatello": [1.15, 0.662, 0],
        "trebuchet ms": [0.939, 0.2222, 0],
        "trebuchet ms bold": [0.939, 0.2222, 0],
        "trebuchet ms bold italic": [0.939, 0.2222, 0],
        "trebuchet ms italic": [0.939, 0.2222, 0],
        "verdana": [1.0054, 0.21, 0],
        "verdana bold": [1.0054, 0.21, 0],
        "verdana bold italic": [1.0054, 0.21, 0],
        "verdana italic": [1.0054, 0.21, 0],
        "waseem regular": [0.8921, 0.5522, 0],
        "wawati sc regular": [1.06, 0.34, 0],
        "wawati tc regular": [1.06, 0.34, 0],
        "webdings": [0.7998, 0.2002, 0],
        "weibei sc bold": [1.06, 0.34, 0],
        "weibei tc bold": [1.06, 0.34, 0],
        "wingdings": [0.8989, 0.2109, 0],
        "wingdings 2": [0.8433, 0.2109, 0],
        "wingdings 3": [0.9277, 0.2109, 0],
        "xingkai sc bold": [1.06, 0.34, 0],
        "yuanti sc bold": [1.06, 0.34, 0],
        "yugothic bold": [0.88, 0.12, 1],
        "yugothic medium": [0.88, 0.12, 1],
        "yumincho demibold": [0.88, 0.12, 1],
        "yumincho medium": [0.88, 0.12, 1],
        "yuppy sc regular": [1.06, 0.34, 0],
        "yuppy tc regular": [1.06, 0.34, 0],
        "zapf dingbats": [0.814, 0.1768, 0],
        "zapfino": [1.875, 1.5025, 0]
      };
      // Measurements taken on a freshly installed Ubuntu Linux 12.04.5 (Precise Pangolin).
      Font.DEVICE_FONT_METRICS_LINUX = {
        "kacstfarsi": [0.7813, 0.293, 0.0288],
        "meera": [0.6611, 0.439, 0],
        "freemono": [0.8, 0.2, 0.09],
        "loma": [1.146, 0.4404, 0],
        "kacsttitlel": [1.0562, 0.4878, 0],
        "garuda": [1.284, 0.591, 0],
        "rekha": [1.1025, 0.3438, 0.0879],
        "purisa": [1.12, 0.52, 0.113],
        "dejavu sans mono": [0.9282, 0.2358, 0],
        "vemana2000": [0.88, 0.84, 0],
        "kacstoffice": [0.7813, 0.293, 0.0288],
        "umpush": [1.2305, 0.5903, 0],
        "opensymbol": [0.917, 0.313, 0],
        "sawasdee": [1.0825, 0.374, 0.0898],
        "freeserif": [0.9, 0.3, 0.09],
        "kacstdigital": [0.7813, 0.293, 0.0288],
        "ubuntu condensed": [0.932, 0.189, 0.028],
        "mry_kacstqurn": [0.6299, 0.1138, 0.2002],
        "phetsarath ot": [1.0742, 0.4883, 0.0181],
        "tlwg typist": [0.875, 0.364, 0.09],
        "kacstletter": [0.7813, 0.293, 0.0288],
        "utkal": [1.1929, 0.6299, 0],
        "norasi": [1.216, 0.488, 0],
        "kacstone": [0.9766, 0.3418, 0.0288],
        "liberation sans narrow": [0.9355, 0.2119, 0],
        "nanummyeongjo": [0.9082, 0.2148, 0],
        "untitled1": [0.666, 0.545, 0.09],
        "lohit gujarati": [0.9244, 0.3673, 0.2401],
        "liberation mono": [0.8335, 0.3003, 0],
        "kacstart": [0.7813, 0.293, 0.0288],
        "mallige": [1, 0.6602, 0.1094],
        "nanumgothic": [0.92, 0.23, 0],
        "liberation serif": [0.8911, 0.2163, 0.0425],
        "ubuntu": [0.932, 0.189, 0.028],
        "takaopgothic": [0.8799, 0.1201, 0],
        "dejavu sans": [0.9282, 0.2358, 0],
        "kedage": [1, 0.6602, 0.1094],
        "kinnari": [1.286, 0.496, 0],
        "tlwgmono": [0.887, 0.379, 0.09],
        "lohit punjabi": [1.1704, 0.6489, 0.2601],
        "rachana": [0.667, 0.5371, 0],
        "waree": [1.2402, 0.5151, 0],
        "kacstposter": [0.7813, 0.293, 0.0288],
        "khmer os": [1.2695, 0.7324, 0.0181],
        "freesans": [1, 0.3, 0.09],
        "gargi": [1.0078, 0.4463, 0.1162],
        "dejavu serif": [0.939, 0.2358, 0],
        "wenquanyi micro hei": [0.9365, 0.2358, 0],
        "ubuntu light": [0.932, 0.189, 0.028],
        "tlwgtypewriter": [0.938, 0.368, 0.09],
        "kacstpen": [0.7813, 0.293, 0.0288],
        "tlwg typo": [0.875, 0.364, 0.09],
        "mukti narrow": [1.2412, 0.4385, 0],
        "ubuntu mono": [0.83, 0.17, 0],
        "lohit bengali": [0.9883, 0.4226, 0.2601],
        "liberation sans": [0.9053, 0.2119, 0.0327],
        "kacstdecorative": [0.8262, 0.3198, 0.0288],
        "khmer os system": [1.123, 0.6348, 0.0181],
        "saab": [1, 0.6602, 0.125],
        "kacsttitle": [0.7813, 0.293, 0.0288],
        "mukti narrow bold": [1.2412, 0.4385, 0],
        "lohit hindi": [0.999, 0.5029, 0.2598],
        "kacstqurn": [1.0562, 0.4883, 0],
        "kacstnaskh": [0.7813, 0.293, 0.0288],
        "kacstscreen": [0.7813, 0.293, 0.0288],
        "pothana2000": [0.88, 0.84, 0],
        "lohit tamil": [0.8451, 0.096, 0.2401],
        "kacstbook": [0.7813, 0.293, 0.0288]
      };
      Font.DEVICE_FONT_METRICS_MAC.__proto__ = Font.DEVICE_FONT_METRICS_WIN;
      Font.DEVICE_FONT_METRICS_LINUX.__proto__ = Font.DEVICE_FONT_METRICS_MAC;
    };

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    static initializer: any = function (symbol: Shumway.Timeline.FontSymbol) {
      var self: Font = this;

      // TODO: give fonts proper inter-SWF IDs, so multiple SWFs' fonts don't collide.
      self._id = symbol.data.id;

      self._fontName = null;
      self._fontFamily = null;
      self._fontStyle = null;
      self._fontType = null;

      self.ascent = 0;
      self.descent = 0;
      self.leading = 0;
      self.advances = null;

      if (symbol) {
        self._symbol = symbol;
        self._fontName = symbol.name;
        self._fontFamily = Font.resolveFontName(symbol.name);
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
        self._fontType = metrics ? FontType.EMBEDDED : FontType.DEVICE;

        var fontProp = Object.getOwnPropertyDescriptor(Font._fontsBySymbolId, symbol.id + '');
        // Define mapping or replace lazy getter with value.
        if (!fontProp || !fontProp.value) {
          Object.defineProperty(Font._fontsBySymbolId, symbol.id + '', {value: self});
          Object.defineProperty(Font._fontsByName, symbol.name.toLowerCase(), {value: self});
          if (self._fontType === FontType.EMBEDDED) {
            Object.defineProperty(Font._fontsByName, 'swffont' + symbol.id, {value: self});
          }
        }
      }
    };

    private static _deviceFontMetrics: Object;

    private static _getFontMetrics(name: string) {
      if (!this._deviceFontMetrics) {
        var userAgent = self.navigator.userAgent;
        if (userAgent.indexOf("Windows") > -1) {
          this._deviceFontMetrics = Font.DEVICE_FONT_METRICS_WIN;
        } else if (/(Macintosh|iPad|iPhone|iPod|Android)/.test(userAgent)) {
          this._deviceFontMetrics = this.DEVICE_FONT_METRICS_MAC;
          this.DEFAULT_FONT_SANS = 'Helvetica';
          this.DEFAULT_FONT_SERIF = 'Times Roman';
          this.DEFAULT_FONT_TYPEWRITER = 'Courier';
        } else {
          this._deviceFontMetrics = this.DEVICE_FONT_METRICS_LINUX;
        }
      }
      return this._deviceFontMetrics[Font.resolveFontName(name)];
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
      false && super();
    }

    static getBySymbolId(id: number): Font {
      return this._fontsBySymbolId[id];
    }

    static getByName(name: string): Font {
      name = this.resolveFontName(name).toLowerCase();
      var font = this._fontsByName[name];
      if (!font) {
        var font = new Font();
        font._fontName = name;
        font._fontFamily = Font.resolveFontName(name);
        font._fontStyle = FontStyle.REGULAR;
        font._fontType = FontType.DEVICE;
        this._fontsByName[name] = font;
      }
      if (font._fontType === FontType.DEVICE) {
        var metrics = Font._getFontMetrics(font._fontFamily);
        if (!metrics) {
          Shumway.Debug.warning(
            'Font metrics for "' + name + '" unknown. Fallback to default.');
          metrics = Font._getFontMetrics(Font.DEFAULT_FONT_SANS);
          font._fontFamily = Font.DEFAULT_FONT_SANS;
        }
        font.ascent = metrics[0];
        font.descent = metrics[1];
        font.leading = metrics[2];
      }
      return font;
    }

    static getDefaultFont(): Font {
      return Font.getByName(Font.DEFAULT_FONT_SANS);
    }

    // JS -> AS Bindings
    private _fontName: string;
    _fontFamily: string;
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

    /**
     * Registers an embedded font as available in the system without it being decoded.
     *
     * Firefox decodes fonts synchronously, allowing us to do the decoding upon first actual use.
     * All we need to do here is let the system know about the family name and ID, so that both
     * TextFields/Labels referring to the font's symbol ID as well as HTML text specifying a font
     * face can resolve the font.
     */
    static registerLazyFont(fontMapping: {name: string; id: number},
                            loaderInfo: flash.display.LoaderInfo): void {
      var resolverProp = {
        get: loaderInfo.getSymbolById.bind(loaderInfo, fontMapping.id),
        configurable: true
      };
      Object.defineProperty(Font._fontsByName, fontMapping.name.toLowerCase(), resolverProp);
      Object.defineProperty(Font._fontsByName, 'swffont' + fontMapping.id, resolverProp);
      Object.defineProperty(Font._fontsBySymbolId, fontMapping.id + '', resolverProp);
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
