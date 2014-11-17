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
    CODE_DEFINE_FONT4                      = 91
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
    CODE_VIDEO_FRAME                       = 61,
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
}
