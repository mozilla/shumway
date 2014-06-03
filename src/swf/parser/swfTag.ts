/* -*- Mode: js, js-indent-level: 2, indent-tabs-mode: nil, tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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
/*global self */

/// <reference path='references.ts'/>
module Shumway.SWF.Parser {
  export enum SwfTag {
    CODE_CSM_TEXT_SETTINGS                 = 74,
    CODE_DEFINE_BINARY_DATA                = 87,
    CODE_DEFINE_BITS                       = 6,
    CODE_DEFINE_BITS_JPEG2                 = 21,
    CODE_DEFINE_BITS_JPEG3                 = 35,
    CODE_DEFINE_BITS_JPEG4                 = 90,
    CODE_DEFINE_BITS_LOSSLESS              = 20,
    CODE_DEFINE_BITS_LOSSLESS2             = 36,
    CODE_DEFINE_BUTTON                     = 7,
    CODE_DEFINE_BUTTON2                    = 34,
    CODE_DEFINE_BUTTON_CXFORM              = 23,
    CODE_DEFINE_BUTTON_SOUND               = 17,
    CODE_DEFINE_EDIT_TEXT                  = 37,
    CODE_DEFINE_FONT                       = 10,
    CODE_DEFINE_FONT2                      = 48,
    CODE_DEFINE_FONT3                      = 75,
    CODE_DEFINE_FONT4                      = 91,
    CODE_DEFINE_FONT_ALIGN_ZONES           = 73,
    CODE_DEFINE_FONT_INFO                  = 13,
    CODE_DEFINE_FONT_INFO2                 = 62,
    CODE_DEFINE_FONT_NAME                  = 88,
    CODE_DEFINE_MORPH_SHAPE                = 46,
    CODE_DEFINE_MORPH_SHAPE2               = 84,
    CODE_DEFINE_SCALING_GRID               = 78,
    CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA = 86,
    CODE_DEFINE_SHAPE                      = 2,
    CODE_DEFINE_SHAPE2                     = 22,
    CODE_DEFINE_SHAPE3                     = 32,
    CODE_DEFINE_SHAPE4                     = 83,
    CODE_DEFINE_SOUND                      = 14,
    CODE_DEFINE_SPRITE                     = 39,
    CODE_DEFINE_TEXT                       = 11,
    CODE_DEFINE_TEXT2                      = 33,
    CODE_DEFINE_VIDEO_STREAM               = 60,
    CODE_DO_ABC                            = 82,
    CODE_DO_ABC_                           = 72,
    CODE_DO_ACTION                         = 12,
    CODE_DO_INIT_ACTION                    = 59,
    CODE_ENABLE_DEBUGGER                   = 58,
    CODE_ENABLE_DEBUGGER2                  = 64,
    CODE_END                               = 0,
    CODE_EXPORT_ASSETS                     = 56,
    CODE_FILE_ATTRIBUTES                   = 69,
    CODE_FRAME_LABEL                       = 43,
    CODE_IMPORT_ASSETS                     = 57,
    CODE_IMPORT_ASSETS2                    = 71,
    CODE_JPEG_TABLES                       = 8,
    CODE_METADATA                          = 77,
    CODE_PLACE_OBJECT                      = 4,
    CODE_PLACE_OBJECT2                     = 26,
    CODE_PLACE_OBJECT3                     = 70,
    CODE_PROTECT                           = 24,
    CODE_REMOVE_OBJECT                     = 5,
    CODE_REMOVE_OBJECT2                    = 28,
    CODE_SCRIPT_LIMITS                     = 65,
    CODE_SET_BACKGROUND_COLOR              = 9,
    CODE_SET_TAB_INDEX                     = 66,
    CODE_SHOW_FRAME                        = 1,
    CODE_SOUND_STREAM_BLOCK                = 19,
    CODE_SOUND_STREAM_HEAD                 = 18,
    CODE_SOUND_STREAM_HEAD2                = 45,
    CODE_START_SOUND                       = 15,
    CODE_START_SOUND2                      = 89,
    CODE_SYMBOL_CLASS                      = 76,
    CODE_VIDEO_FRAME                       = 61
  }

  export interface ISwfTagData {
    code: SwfTag;
    type?: string;
    id?: number;
    frameCount?: number;
    repeat?: number;
    tags?: Array<ISwfTagData>;
    finalTag?: boolean;
  }
}
