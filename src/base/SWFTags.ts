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
  export const enum SwfTagCode {
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

  var SwfTagCodeNames = ["CODE_END","CODE_SHOW_FRAME","CODE_DEFINE_SHAPE","CODE_FREE_CHARACTER","CODE_PLACE_OBJECT","CODE_REMOVE_OBJECT","CODE_DEFINE_BITS","CODE_DEFINE_BUTTON","CODE_JPEG_TABLES","CODE_SET_BACKGROUND_COLOR","CODE_DEFINE_FONT","CODE_DEFINE_TEXT","CODE_DO_ACTION","CODE_DEFINE_FONT_INFO","CODE_DEFINE_SOUND","CODE_START_SOUND","CODE_STOP_SOUND","CODE_DEFINE_BUTTON_SOUND","CODE_SOUND_STREAM_HEAD","CODE_SOUND_STREAM_BLOCK","CODE_DEFINE_BITS_LOSSLESS","CODE_DEFINE_BITS_JPEG2","CODE_DEFINE_SHAPE2","CODE_DEFINE_BUTTON_CXFORM","CODE_PROTECT","CODE_PATHS_ARE_POSTSCRIPT","CODE_PLACE_OBJECT2","INVALID","CODE_REMOVE_OBJECT2","CODE_SYNC_FRAME","INVALID","CODE_FREE_ALL","CODE_DEFINE_SHAPE3","CODE_DEFINE_TEXT2","CODE_DEFINE_BUTTON2","CODE_DEFINE_BITS_JPEG3","CODE_DEFINE_BITS_LOSSLESS2","CODE_DEFINE_EDIT_TEXT","CODE_DEFINE_VIDEO","CODE_DEFINE_SPRITE","CODE_NAME_CHARACTER","CODE_PRODUCT_INFO","CODE_DEFINE_TEXT_FORMAT","CODE_FRAME_LABEL","CODE_DEFINE_BEHAVIOUR","CODE_SOUND_STREAM_HEAD2","CODE_DEFINE_MORPH_SHAPE","CODE_GENERATE_FRAME","CODE_DEFINE_FONT2","CODE_GEN_COMMAND","CODE_DEFINE_COMMAND_OBJECT","CODE_CHARACTER_SET","CODE_EXTERNAL_FONT","CODE_DEFINE_FUNCTION","CODE_PLACE_FUNCTION","CODE_GEN_TAG_OBJECTS","CODE_EXPORT_ASSETS","CODE_IMPORT_ASSETS","CODE_ENABLE_DEBUGGER","CODE_DO_INIT_ACTION","CODE_DEFINE_VIDEO_STREAM","CODE_VIDEO_FRAME","CODE_DEFINE_FONT_INFO2","CODE_DEBUG_ID","CODE_ENABLE_DEBUGGER2","CODE_SCRIPT_LIMITS","CODE_SET_TAB_INDEX","CODE_DEFINE_SHAPE4","INVALID","CODE_FILE_ATTRIBUTES","CODE_PLACE_OBJECT3","CODE_IMPORT_ASSETS2","CODE_DO_ABC_DEFINE","CODE_DEFINE_FONT_ALIGN_ZONES","CODE_CSM_TEXT_SETTINGS","CODE_DEFINE_FONT3","CODE_SYMBOL_CLASS","CODE_METADATA","CODE_DEFINE_SCALING_GRID","INVALID","INVALID","INVALID","CODE_DO_ABC","CODE_DEFINE_SHAPE4","CODE_DEFINE_MORPH_SHAPE2","INVALID","CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA","CODE_DEFINE_BINARY_DATA","CODE_DEFINE_FONT_NAME","CODE_START_SOUND2","CODE_DEFINE_BITS_JPEG4","CODE_DEFINE_FONT4","CODE_TELEMETRY"];

  export function getSwfTagCodeName(tagCode: SwfTagCode) {
    return release ? "SwfTagCode: " + tagCode : SwfTagCodeNames[tagCode];
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
    CODE_DEFINE_VIDEO_STREAM               = 60,
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
    CODE_VIDEO_FRAME                       = 61
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
  
  export interface ColorTransform {
    redMultiplier: number;
    greenMultiplier: number;
    blueMultiplier: number;
    alphaMultiplier: number;
    redOffset: number;
    greenOffset: number;
    blueOffset: number;
    alphaOffset: number;
  }
  
  export interface SwfTag {
    code: number;
  }

  export interface DefinitionTag extends SwfTag {
    id: number;
  }

  export interface DisplayListTag extends SwfTag {
    depth: number;
  }

  export interface PlaceObjectTag extends DisplayListTag {
    actionBlocksPrecedence?: number;
    symbolId?: number;
    flags: number;
    matrix?: Matrix;
    cxform?: ColorTransform;
    className?: string;
    ratio?: number;
    name?: string;
    clipDepth?: number;
    filters?: any[];
    blendMode?: number;
    bmpCache?: number;
    visibility?: boolean;
    backgroundColor?: number;
    events?: ClipEvents[];
  }
  
  export const enum PlaceObjectFlags {
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
  
  export const enum AVM1ClipEvents {
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
  
  export interface ClipEvents {
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
    preserveAlpha: boolean;
  }
  
  export interface ColorMatrixFilter extends Filter {
     matrix: number[];
  }
  
  export interface RemoveObjectTag extends DisplayListTag {
    depth: number;
    symbolId?: number;
  }

  export interface ImageTag extends DefinitionTag {
    deblock?: number;
    imgData: Uint8Array;
    alphaData?: Uint8Array;
    mimeType: string;
    jpegTables?: { data: Uint8Array };
  }
  
  export interface ButtonTag extends DefinitionTag {
    characters?: ButtonCharacter[];
    actionsData?: Uint8Array;
    trackAsMenu?: boolean;
    buttonActions?: ButtonCondAction[];
  }
 
  export interface ButtonCharacter {
    flags: number;
    symbolId?: number;
    depth?: number;
    matrix?: Matrix;
    cxform?: ColorTransform;
    filters?: Filter[];
    blendMode?: number;
    buttonActions?: ButtonCondAction[];
  }
  
  export const enum ButtonCharacterFlags {
    StateUp       = 0x01,
    StateOver     = 0x02,
    StateDown     = 0x04,
    StateHitTest  = 0x08,
    HasFilterList = 0x10,
    HasBlendMode  = 0x20
  }
  
  export interface ButtonCondAction {
    keyCode: number;
    stateTransitionFlags: number;
    actionsData: Uint8Array;
  }
  
  export interface BinaryDataTag extends DefinitionTag {
    data: Uint8Array;
  }

  export interface FontTag extends DefinitionTag {
    flags: number;
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
  
  export const enum FontFlags {
    Bold              = 0x01,
    Italic            = 0x02,
    WideOrHasFontData = 0x04,
    WideOffset        = 0x08,
    Ansi              = 0x10,
    SmallText         = 0x20,
    ShiftJis          = 0x40,
    HasLayout         = 0x80
  }
  
  export type Glyph = ShapeRecord[];
  
  export interface StaticTextTag extends DefinitionTag {
    bbox: Bbox;
    matrix: Matrix;
    records: TextRecord[];
  }
  
  export interface TextRecord {
    flags: number;
    fontId?: number;
    color?: number;
    moveX?: number;
    moveY?: number;
    fontHeight?: number;
    glyphCount?: number;
    entries?: TextEntry[];
  }
  
  export const enum TextRecordFlags {
    HasMoveX = 0x01,
    HasMoveY = 0x02,
    HasColor = 0x04,
    HasFont =  0x08
  }
  
  export interface TextEntry {
    glyphIndex: number;
    advance: number;
  }
  
  export interface SoundTag extends DefinitionTag {
    soundFormat: number;
    soundRate: number;
    soundSize: number;
    soundType: number;
    samplesCount: number;
    soundData: Uint8Array;
  }
  
  export interface StartSoundTag extends SwfTag {
    soundId?: number;
    soundClassName?: string;
    soundInfo: SoundInfo;
  }
  
  export interface SoundInfo {
    flags: number;
    inPoint?: number;
    outPoint?: number;
    loopCount?: number;
    envelopes?: SoundEnvelope[];
  }
  
  export const enum SoundInfoFlags {
    HasInPoint  = 0x01,
    HasOutPoint = 0x02,
    HasLoops    = 0x04,
    HasEnvelope = 0x08,
    NoMultiple  = 0x10,
    Stop        = 0x20
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

  export interface BitmapTag extends DefinitionTag {
    format: number;
    width: number;
    height: number;
    hasAlpha: boolean;
    // Number of color table entries - 1, not size in bytes.
    colorTableSize?: number;
    bmpData: Uint8Array;
  }
  
  export interface TextTag extends DefinitionTag {
    bbox: Bbox;
    flags: number;
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
  
  export const enum TextFlags {
    HasFont      = 0x0001,
    HasMaxLength = 0x0002,
    HasColor     = 0x0004,
    ReadOnly     = 0x0008,
    Password     = 0x0010,
    Multiline    = 0x0020,
    WordWrap     = 0x0040,
    HasText      = 0x0080,
    UseOutlines  = 0x0100,
    Html         = 0x0200,
    WasStatic    = 0x0400,
    Border       = 0x0800,
    NoSelect     = 0x1000,
    HasLayout    = 0x2000,
    AutoSize     = 0x4000,
    HasFontClass = 0x8000
  }
  
  export interface Kerning {
    code1: number;
    code2: number;
    adjustment: number;
  }
  
  export interface ScalingGridTag extends SwfTag {
    symbolId: number;
    splitter: Bbox;
  }
  
  export interface SceneTag extends SwfTag {
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
  
  export interface ShapeTag extends DefinitionTag {
    lineBounds: Bbox;
    lineBoundsMorph?: Bbox;
    fillBounds?: Bbox;
    fillBoundsMorph?: Bbox;
    flags: number;
    fillStyles: FillStyle[];
    lineStyles: LineStyle[];
    records: ShapeRecord[];
    recordsMorph?: ShapeRecord[];
  }
  
  export const enum ShapeFlags {
    UsesScalingStrokes    = 0x01,
    UsesNonScalingStrokes = 0x02,
    UsesFillWindingRule   = 0x04,
    IsMorph               = 0x08
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
    flags: number;
    deltaX?: number;
    deltaY?: number;
    controlDeltaX?: number;
    controlDeltaY?: number;
    anchorDeltaX?: number;
    anchorDeltaY?: number;
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
  
  export const enum ShapeRecordFlags {
    Move = 0x01,
    HasFillStyle0 = 0x02,
    HasFillStyle1 = 0x04,
    HasLineStyle = 0x08,
    HasNewStyles = 0x10,
    IsStraight = 0x20,
    IsGeneral = 0x40,
    IsVertical = 0x80
  }
  
  export interface VideoStreamTag extends DefinitionTag {
    numFrames: number;
    width: number;
    height: number;
    deblocking: number;
    smoothing: boolean;
    codecId: number;
  }
  
  export interface VideoFrameTag extends SwfTag {
    streamId: number;
    frameNum: number;
    videoData: Uint8Array;
  }
}
