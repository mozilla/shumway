/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
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

var SWF_TAG_CODE_CSM_TEXT_SETTINGS                 = 74;
var SWF_TAG_CODE_DEFINE_BINARY_DATA                = 87;
var SWF_TAG_CODE_DEFINE_BITS                       =  6;
var SWF_TAG_CODE_DEFINE_BITS_JPEG2                 = 21;
var SWF_TAG_CODE_DEFINE_BITS_JPEG3                 = 35;
var SWF_TAG_CODE_DEFINE_BITS_JPEG4                 = 90;
var SWF_TAG_CODE_DEFINE_BITS_LOSSLESS              = 20;
var SWF_TAG_CODE_DEFINE_BITS_LOSSLESS2             = 36;
var SWF_TAG_CODE_DEFINE_BUTTON                     =  7;
var SWF_TAG_CODE_DEFINE_BUTTON2                    = 34;
var SWF_TAG_CODE_DEFINE_BUTTON_CXFORM              = 23;
var SWF_TAG_CODE_DEFINE_BUTTON_SOUND               = 17;
var SWF_TAG_CODE_DEFINE_EDIT_TEXT                  = 37;
var SWF_TAG_CODE_DEFINE_FONT                       = 10;
var SWF_TAG_CODE_DEFINE_FONT2                      = 48;
var SWF_TAG_CODE_DEFINE_FONT3                      = 75;
var SWF_TAG_CODE_DEFINE_FONT4                      = 91;
var SWF_TAG_CODE_DEFINE_FONT_ALIGN_ZONES           = 73;
var SWF_TAG_CODE_DEFINE_FONT_INFO                  = 13;
var SWF_TAG_CODE_DEFINE_FONT_INFO2                 = 62;
var SWF_TAG_CODE_DEFINE_FONT_NAME                  = 88;
var SWF_TAG_CODE_DEFINE_MORPH_SHAPE                = 46;
var SWF_TAG_CODE_DEFINE_MORPH_SHAPE2               = 84;
var SWF_TAG_CODE_DEFINE_SCALING_GRID               = 78;
var SWF_TAG_CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA = 86;
var SWF_TAG_CODE_DEFINE_SHAPE                      =  2;
var SWF_TAG_CODE_DEFINE_SHAPE2                     = 22;
var SWF_TAG_CODE_DEFINE_SHAPE3                     = 32;
var SWF_TAG_CODE_DEFINE_SHAPE4                     = 83;
var SWF_TAG_CODE_DEFINE_SOUND                      = 14;
var SWF_TAG_CODE_DEFINE_SPRITE                     = 39;
var SWF_TAG_CODE_DEFINE_TEXT                       = 11;
var SWF_TAG_CODE_DEFINE_TEXT2                      = 33;
var SWF_TAG_CODE_DEFINE_VIDEO_STREAM               = 60;
var SWF_TAG_CODE_DO_ABC                            = 82;
var SWF_TAG_CODE_DO_ABC_                           = 72;
var SWF_TAG_CODE_DO_ACTION                         = 12;
var SWF_TAG_CODE_DO_INIT_ACTION                    = 59;
var SWF_TAG_CODE_ENABLE_DEBUGGER                   = 58;
var SWF_TAG_CODE_ENABLE_DEBUGGER2                  = 64;
var SWF_TAG_CODE_END                               =  0;
var SWF_TAG_CODE_EXPORT_ASSETS                     = 56;
var SWF_TAG_CODE_FILE_ATTRIBUTES                   = 69;
var SWF_TAG_CODE_FRAME_LABEL                       = 43;
var SWF_TAG_CODE_IMPORT_ASSETS                     = 57;
var SWF_TAG_CODE_IMPORT_ASSETS2                    = 71;
var SWF_TAG_CODE_JPEG_TABLES                       =  8;
var SWF_TAG_CODE_METADATA                          = 77;
var SWF_TAG_CODE_PLACE_OBJECT                      =  4;
var SWF_TAG_CODE_PLACE_OBJECT2                     = 26;
var SWF_TAG_CODE_PLACE_OBJECT3                     = 70;
var SWF_TAG_CODE_PROTECT                           = 24;
var SWF_TAG_CODE_REMOVE_OBJECT                     =  5;
var SWF_TAG_CODE_REMOVE_OBJECT2                    = 28;
var SWF_TAG_CODE_SCRIPT_LIMITS                     = 65;
var SWF_TAG_CODE_SET_BACKGROUND_COLOR              =  9;
var SWF_TAG_CODE_SET_TAB_INDEX                     = 66;
var SWF_TAG_CODE_SHOW_FRAME                        =  1;
var SWF_TAG_CODE_SOUND_STREAM_BLOCK                = 19;
var SWF_TAG_CODE_SOUND_STREAM_HEAD                 = 18;
var SWF_TAG_CODE_SOUND_STREAM_HEAD2                = 45;
var SWF_TAG_CODE_START_SOUND                       = 15;
var SWF_TAG_CODE_START_SOUND2                      = 89;
var SWF_TAG_CODE_SYMBOL_CLASS                      = 76;
var SWF_TAG_CODE_VIDEO_FRAME                       = 61;

self.SWF = { };
