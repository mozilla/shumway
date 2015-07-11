/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License"),
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module Shumway.SWF.Parser {
  export enum SwfTag {
    CODE_END                               = 0,
    CODE_SHOW_FRAME                        = 1,
    CODE_DEFINE_SHAPE                      = 2,
    CODE_FREE_CHARACTER                    = 3,
    CODE_PLACE_OBJECT                      = 4,
    CODE_REMOVE_OBJECT                     = 5,
    CODE_DEFINE_BITS                       = 6,
    CODE_DEFINE_BUTTON                     = 7,
    CODE_JPEG_TABLES                       = 8,
    CODE_SET_BACKGROUND_COLOR              = 9,
    CODE_DEFINE_FONT                       = 10,
    CODE_DEFINE_TEXT                       = 11,
    CODE_DO_ACTION                         = 12,
    CODE_DEFINE_FONT_INFO                  = 13,
    CODE_DEFINE_SOUND                      = 14,
    CODE_START_SOUND                       = 15,
    CODE_STOP_SOUND                        = 16,
    CODE_DEFINE_BUTTON_SOUND               = 17,
    CODE_SOUND_STREAM_HEAD                 = 18,
    CODE_SOUND_STREAM_BLOCK                = 19,
    CODE_DEFINE_BITS_LOSSLESS              = 20,
    CODE_DEFINE_BITS_JPEG2                 = 21,
    CODE_DEFINE_SHAPE2                     = 22,
    CODE_DEFINE_BUTTON_CXFORM              = 23,
    CODE_PROTECT                           = 24,
    CODE_PATHS_ARE_POSTSCRIPT              = 25,
    CODE_PLACE_OBJECT2                     = 26,
    // INVALID                             = 27,
    CODE_REMOVE_OBJECT2                    = 28,
    CODE_SYNC_FRAME                        = 29,
    // INVALID                             = 30,
    CODE_FREE_ALL                          = 31,
    CODE_DEFINE_SHAPE3                     = 32,
    CODE_DEFINE_TEXT2                      = 33,
    CODE_DEFINE_BUTTON2                    = 34,
    CODE_DEFINE_BITS_JPEG3                 = 35,
    CODE_DEFINE_BITS_LOSSLESS2             = 36,
    CODE_DEFINE_EDIT_TEXT                  = 37,
    CODE_DEFINE_VIDEO                      = 38,
    CODE_DEFINE_SPRITE                     = 39,
    CODE_NAME_CHARACTER                    = 40,
    CODE_PRODUCT_INFO                      = 41,
    CODE_DEFINE_TEXT_FORMAT                = 42,
    CODE_FRAME_LABEL                       = 43,
    CODE_DEFINE_BEHAVIOUR                  = 44,
    CODE_SOUND_STREAM_HEAD2                = 45,
    CODE_DEFINE_MORPH_SHAPE                = 46,
    CODE_GENERATE_FRAME                    = 47,
    CODE_DEFINE_FONT2                      = 48,
    CODE_GEN_COMMAND                       = 49,
    CODE_DEFINE_COMMAND_OBJECT             = 50,
    CODE_CHARACTER_SET                     = 51,
    CODE_EXTERNAL_FONT                     = 52,
    CODE_DEFINE_FUNCTION                   = 53,
    CODE_PLACE_FUNCTION                    = 54,
    CODE_GEN_TAG_OBJECTS                   = 55,
    CODE_EXPORT_ASSETS                     = 56,
    CODE_IMPORT_ASSETS                     = 57,
    CODE_ENABLE_DEBUGGER                   = 58,
    CODE_DO_INIT_ACTION                    = 59,
    CODE_DEFINE_VIDEO_STREAM               = 60,
    CODE_VIDEO_FRAME                       = 61,
    CODE_DEFINE_FONT_INFO2                 = 62,
    CODE_DEBUG_ID                          = 63,
    CODE_ENABLE_DEBUGGER2                  = 64,
    CODE_SCRIPT_LIMITS                     = 65,
    CODE_SET_TAB_INDEX                     = 66,
    // CODE_DEFINE_SHAPE4                  = 67,
    // INVALID                             = 68,
    CODE_FILE_ATTRIBUTES                   = 69,
    CODE_PLACE_OBJECT3                     = 70,
    CODE_IMPORT_ASSETS2                    = 71,
    CODE_DO_ABC_DEFINE                     = 72,
    CODE_DEFINE_FONT_ALIGN_ZONES           = 73,
    CODE_CSM_TEXT_SETTINGS                 = 74,
    CODE_DEFINE_FONT3                      = 75,
    CODE_SYMBOL_CLASS                      = 76,
    CODE_METADATA                          = 77,
    CODE_DEFINE_SCALING_GRID               = 78,
    // INVALID                             = 79,
    // INVALID                             = 80,
    // INVALID                             = 81,
    CODE_DO_ABC                            = 82,
    CODE_DEFINE_SHAPE4                     = 83,
    CODE_DEFINE_MORPH_SHAPE2               = 84,
    // INVALID                             = 85,
    CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA = 86,
    CODE_DEFINE_BINARY_DATA                = 87,
    CODE_DEFINE_FONT_NAME                  = 88,
    CODE_START_SOUND2                      = 89,
    CODE_DEFINE_BITS_JPEG4                 = 90,
    CODE_DEFINE_FONT4                      = 91,
    CODE_TELEMETRY                         = 93
  }

  export enum DefinitionTags {
    CODE_DEFINE_SHAPE                      = 2,
    CODE_DEFINE_BITS                       = 6,
    CODE_DEFINE_BUTTON                     = 7,
    CODE_DEFINE_FONT                       = 10,
    CODE_DEFINE_TEXT                       = 11,
    CODE_DEFINE_SOUND                      = 14,
    CODE_DEFINE_BITS_LOSSLESS              = 20,
    CODE_DEFINE_BITS_JPEG2                 = 21,
    CODE_DEFINE_SHAPE2                     = 22,
    CODE_DEFINE_SHAPE3                     = 32,
    CODE_DEFINE_TEXT2                      = 33,
    CODE_DEFINE_BUTTON2                    = 34,
    CODE_DEFINE_BITS_JPEG3                 = 35,
    CODE_DEFINE_BITS_LOSSLESS2             = 36,
    CODE_DEFINE_EDIT_TEXT                  = 37,
    CODE_DEFINE_SPRITE                     = 39,
    CODE_DEFINE_MORPH_SHAPE                = 46,
    CODE_DEFINE_FONT2                      = 48,
    // We don't support DefineVideoStream tags for now so leave the next line commented to make the
    // parser log a message if such a tag is encountered.
    // CODE_DEFINE_VIDEO_STREAM            = 60,
    CODE_DEFINE_FONT3                      = 75,
    CODE_DEFINE_SHAPE4                     = 83,
    CODE_DEFINE_MORPH_SHAPE2               = 84,
    CODE_DEFINE_BINARY_DATA                = 87,
    CODE_DEFINE_BITS_JPEG4                 = 90,
    CODE_DEFINE_FONT4                      = 91
  }

  export enum ImageDefinitionTags {
    CODE_DEFINE_BITS                       = 6,
    CODE_DEFINE_BITS_JPEG2                 = 21,
    CODE_DEFINE_BITS_JPEG3                 = 35,
    CODE_DEFINE_BITS_JPEG4                 = 90
  }

  export enum FontDefinitionTags {
    CODE_DEFINE_FONT                       = 10,
    CODE_DEFINE_FONT2                      = 48,
    CODE_DEFINE_FONT3                      = 75,
    CODE_DEFINE_FONT4                      = 91
  }

  export enum ControlTags {
    CODE_PLACE_OBJECT                      = 4,
    CODE_PLACE_OBJECT2                     = 26,
    CODE_PLACE_OBJECT3                     = 70,
    CODE_REMOVE_OBJECT                     = 5,
    CODE_REMOVE_OBJECT2                    = 28,
    CODE_START_SOUND                       = 15,
    CODE_START_SOUND2                      = 89,
    // We don't support VideoFrame tags for now so leave the next line commented to make the
    // parser log a message if such a tag is encountered.
    // CODE_VIDEO_FRAME                       = 61,
  }

  export enum PlaceObjectFlags {
    Move              = 0x0001,
    HasCharacter      = 0x0002,
    HasMatrix         = 0x0004,
    HasColorTransform = 0x0008,
    HasRatio          = 0x0010,
    HasName           = 0x0020,
    HasClipDepth      = 0x0040,
    HasClipActions    = 0x0080,
    HasFilterList     = 0x0100,
    HasBlendMode      = 0x0200,
    HasCacheAsBitmap  = 0x0400,
    HasClassName      = 0x0800,
    HasImage          = 0x1000,
    HasVisible        = 0x2000,
    OpaqueBackground  = 0x4000,
    Reserved          = 0x8000
  }
  
  export enum AVM1ClipEvents {
    Load =            0x00001,
    EnterFrame =      0x00002,
    Unload =          0x00004,
    MouseMove =       0x00008,
    MouseDown =       0x00010,
    MouseUp =         0x00020,
    KeyDown =         0x00040,
    KeyUp =           0x00080,
    Data =            0x00100,
    Initialize =      0x00200,
    Press =           0x00400,
    Release =         0x00800,
    ReleaseOutside =  0x01000,
    RollOver =        0x02000,
    RollOut =         0x04000,
    DragOver =        0x08000,
    DragOut =         0x10000,
    KeyPress =        0x20000,
    Construct =       0x40000
  }
  
  export interface Bbox {
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
  }
  
  export interface Matrix {
    a: number;
    b: number;
    c: number;
    d: number;
    tx: number;
    ty: number;
  }
  
  export interface Cxform {
    redMultiplier: number;
    greenMultiplier: number;
    blueMultiplier: number;
    alphaMultiplier: number;
    redOffset: number;
    greenOffset: number;
    blueOffset: number;
    alphaOffset: number;
  }
  
  export interface Tag {
    code: number;
  }

  export interface DisplayListTag extends Tag {
    depth: number;
  }

  export interface PlaceObjectTag extends DisplayListTag {
    actionBlocksPrecedence?: number;
    symbolId?: number;
    depth: number;
    flags: number;
    matrix?: Matrix;
    cxform?: Cxform;
    className?: string;
    ratio?: number;
    name?: string;
    clipDepth?: number;
    filters?: any[];
    blendMode?: number;
    bmpCache?: number;
    visibility?: boolean;
    backgroundColor?: number;
    events?: Events[];
  }
  
  export interface Events {
    flags: number;
    keyCode?: number;
    actionsBlock: Uint8Array;
  }
  
  export interface Filter {
    type: number;
  }
  
  export interface GlowFilter extends Filter {
    colors: number[];
    ratios?: number[];
    blurX: number;
    blurY: number;
    angle?: number;
    distance?: number;
    strength: number;
    inner: boolean;
    knockout: boolean;
    compositeSource: boolean;
    onTop?: boolean;
    quality: number;
  }
  
  export interface BlurFilter extends Filter {
    blurX: number;
    blurY: number;
    quality: number;
  }
  
  export interface ConvolutionFilter extends Filter {
    matrixX: number;
    matrixY: number;
    divisor: number;
    bias: number;
    matrix: number[];
    color: number;
    clamp: boolean;
    preserverAlpha: boolean;
  }
  
  export interface ColorMatrixFilter extends Filter {
     matrix: number[];
  }
  
  export interface RemoveObjectTag extends DisplayListTag {
    symbolId?: number;
    depth: number;
  }

  export interface ImageTag extends Tag {
    id: number;
    deblock?: number;
    imgData: Uint8Array;
    alphaData?: Uint8Array;
    mimeType: string;
    jpegTables?: { data: Uint8Array };
  }
  
  export interface ButtonTag extends Tag {
    id: number;
    characters?: ButtonCharacter[];
    actionsData?: Uint8Array;
    trackAsMenu?: boolean;
    buttonActions?: ButtonCondAction[];
  }
 
  export interface ButtonCharacter {
    flags: number;
    stateHitTest: boolean;
    stateDown: boolean;
    stateOver: boolean;
    stateUp: boolean;
    symbolId?: number;
    depth?: number;
    matrix?: Matrix;
    cxform?: Cxform;
    filters?: Filter[];
    buttonActions?: ButtonCondAction[];
  }
  
  export interface ButtonCondAction {
    keyCode: number;
    stateTransitionFlags: number;
    actionsData: Uint8Array;
  }
  
  export interface BinaryDataTag extends Tag {
    id: number;
    data: Uint8Array;
  }

  export interface FontTag extends Tag {
    id: number;
    // TODO: Turn all these boolean fields into flags.
    hasLayout?: boolean;
    shiftJis?: boolean;
    smallText?: boolean;
    ansi?: boolean;
    italic?: boolean;
    bold?: boolean;
    language?: number;
    name?: string;
    copyright?: string;
    resolution?: number;
    offsets?: number[];
    mapOffset?: number;
    glyphs?: Glyph[];
    codes?: number[];
    ascent?: number;
    descent?: number;
    leading?: number;
    advance?: number[];
    bbox?: Bbox[];
    kerning?: Kerning[];
    data?: Uint8Array;
  }
  
  export interface Glyph {
    records: ShapeRecord[];
  }
  
  export interface StaticTextTag extends Tag {
    id: number;
    bbox: Bbox;
    matrix: Matrix;
    records: TextRecord[];
  }
  
  export interface TextRecord {
    flags: number;
    // TODO: Turn all these boolean fields into flags.
    hasFont: boolean;
    hasColor: boolean;
    hasMoveY: boolean;
    hasMoveX: boolean;
    fontId?: number;
    color?: number;
    moveX?: number;
    moveY?: number;
    fontHeight?: number;
    glyphCount?: number;
    entries?: TextEntry[];
  }
  
  export interface TextEntry {
    glyphIndex: number;
    advance: number;
  }
  
  export interface SoundTag extends Tag {
    id: number;
    soundFormat: number;
    soundRate: number;
    soundSize: number;
    soundType: number;
    samplesCount: number;
    soundData: Uint8Array;
  }
  
  export interface StartSoundTag extends Tag {
    soundId?: number;
    soundClassName?: string;
    soundInfo: SoundInfo;
  }
  
  export interface SoundInfo {
    // TODO: Turn all these boolean fields into flags.
    stop: boolean;
    noMultiple: boolean;
    hasEnvelope: boolean;
    hasLoops: boolean;
    hasOutPoint: boolean;
    hasInPoint: boolean;
    inPoint?: number;
    outPoint?: number;
    loopCount?: number;
    envelopes?: SoundEnvelope[];
  }
  
  export interface SoundEnvelope {
    pos44: number;
    volumeLeft: number;
    volumeRight: number;
  }
  
  export interface SoundStreamHeadTag {
    playbackRate: number;
    playbackSize: number;
    playbackType: number;
    streamCompression: number;
    streamRate: number;
    streamSize: number;
    streamType: number;
    samplesCount: number;
    latencySeek?: number;
  }

  export interface BitmapTag extends Tag {
    id: number;
    format: number;
    width: number;
    height: number;
    hasAlpha: boolean;
    // Number of color table entries - 1, not size in bytes.
    colorTableSize?: number;
    bmpData: Uint8Array;
  }
  
  export interface TextTag extends Tag {
    id: number;
    bbox: Bbox;
    // TODO: Turn all these boolean fields into flags.
    hasText: boolean;
    wordWrap: boolean;
    multiline: boolean;
    password: boolean;
    readonly: boolean;
    hasColor: boolean;
    hasMaxLength: boolean;
    hasFont: boolean;
    hasFontClass: boolean;
    autoSize: boolean;
    hasLayout: boolean;
    noSelect: boolean;
    border: boolean;
    wasStatic: boolean;
    html: boolean;
    useOutlines: boolean;
    fontId?: number;
    fontClass?: string;
    fontHeight?: number;
    color?: number;
    maxLength?: number;
    align?: number;
    leftMargin?: number;
    rightMargin?: number;
    indent?: number;
    leading?: number;
    variableName: string;
    initialText?: string;
  }
  
  export interface Kerning {
    code1: number;
    code2: number;
    adjustment: number;
  }
  
  export interface ScalingGridTag extends Tag {
    symbolId: number;
    splitter: Bbox;
  }
  
  export interface SceneTag extends Tag {
    scenes: Scene[];
    labels: Label[];
  }
  
  export interface Scene {
    offset: number;
    name: string;
  }
  
  export interface Label {
    frame: number;
    name: string;
  }
  
  export interface ShapeTag extends Tag {
    id: number;
    lineBounds: Bbox;
    isMorph: boolean;
    lineBoundsMorph?: Bbox;
    canHaveStrokes: boolean;
    fillBounds?: Bbox;
    fillBoundsMorph?: Bbox;
    flags?: number;
    fillStyles: FillStyle[];
    lineStyles: LineStyle[];
    records: ShapeRecord[];
    recordsMorph?: ShapeRecord[];
  }
  
  export interface FillStyle {
    type: number;
  }
  
  export interface SolidFill extends FillStyle {
    color: number;
    colorMorph?: number;
  }
  
  export interface GradientFill extends FillStyle {
    matrix: Matrix;
    matrixMorph?: Matrix;
    spreadMode?: number;
    interpolationMode?: number;
    records: GradientRecord[];
    focalPoint?: number;
    focalPointMorph?: number;
  }
  
  export interface GradientRecord {
    ratio: number;
    color: number;
    ratioMorph?: number;
    colorMorph?: number;
  }

  export interface BitmapFill extends FillStyle {
    bitmapId: number;
    condition: boolean;
    matrix: Matrix;
    matrixMorph?: Matrix;
  }
  
  export interface LineStyle {
    width: number;
    widthMorph?: number;
    startCapsStyle?: number;
    jointStyle?: number;
    hasFill?: number;
    noHscale?: boolean;
    noVscale?: boolean;
    pixelHinting?: boolean;
    noClose?: boolean;
    endCapsStyle?: number;
    miterLimitFactor?: number;
    fillStyle?: FillStyle;
    color?: number;
    colorMorph?: number;
  }
  
  export interface ShapeRecord {
    type: number;
  }
  
  export interface ShapeEdgeRecord extends ShapeRecord {
    isStraight?: boolean;
    isGeneral?: boolean;
    deltaX?: number;
    deltaY?: number;
    controlDeltaX?: number;
    controlDeltaY?: number;
    anchorDeltaX?: number;
    anchorDeltaY?: number;
  }
  
  export interface ShapeSetupRecord extends ShapeRecord {
    hasNewStyles: boolean;
    hasLineStyle: boolean;
    hasFillStyle1: boolean;
    hasFillStyle0: boolean;
    move: boolean;
    bits?: number;
    moveX?: number;
    moveY?: number;
    fillStyle0?: number;
    fillStyle1?: number;
    lineStyle?: number;
    fillStyles?: FillStyle[];
    lineStyles?: LineStyle[];
    lineBits?: number;
    fillBits?: number;
  }
}
