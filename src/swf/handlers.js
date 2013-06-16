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
/*global DEFINE_BITMAP, DEFINE_BUTTON, DEFINE_FONT, DEFINE_FONT2, DEFINE_IMAGE,
         DEFINE_JPEG_TABLES, DEFINE_LABEL, DEFINE_SCALING_GRID, DEFINE_SCENE,
         DEFINE_SHAPE, DEFINE_SOUND, DEFINE_TEXT, DO_ABC, DO_ACTION,
         FILE_ATTRIBUTES, FRAME_LABEL, PLACE_OBJECT, REMOVE_OBJECT,
         SET_BACKGROUND_COLOR, SOUND_STREAM_BLOCK, SOUND_STREAM_HEAD,
         START_SOUND, SYMBOL_CLASS */

var tagHandler = {
  /* End */                            0: undefined,
  /* ShowFrame */                      1: undefined,
  /* DefineShape */                    2: DEFINE_SHAPE,
  /* PlaceObject */                    4: PLACE_OBJECT,
  /* RemoveObject */                   5: REMOVE_OBJECT,
  /* DefineBits */                     6: DEFINE_IMAGE,
  /* DefineButton */                   7: DEFINE_BUTTON,
  /* JPEGTables */                     8: DEFINE_JPEG_TABLES,
  /* SetBackgroundColor */             9: SET_BACKGROUND_COLOR,
  /* DefineFont */                    10: DEFINE_FONT,
  /* DefineText */                    11: DEFINE_LABEL,
  /* DoAction */                      12: DO_ACTION,
  /* DefineFontInfo */                13: undefined,
  /* DefineSound */                   14: DEFINE_SOUND,
  /* StartSound */                    15: START_SOUND,
  /* DefineButtonSound */             17: undefined,
  /* SoundStreamHead */               18: SOUND_STREAM_HEAD,
  /* SoundStreamBlock */              19: SOUND_STREAM_BLOCK,
  /* DefineBitsLossless */            20: DEFINE_BITMAP,
  /* DefineBitsJPEG2 */               21: DEFINE_IMAGE,
  /* DefineShape2 */                  22: DEFINE_SHAPE,
  /* DefineButtonCxform */            23: undefined,
  /* Protect */                       24: undefined,
  /* PlaceObject2 */                  26: PLACE_OBJECT,
  /* RemoveObject2 */                 28: REMOVE_OBJECT,
  /* DefineShape3 */                  32: DEFINE_SHAPE,
  /* DefineText2 */                   33: DEFINE_LABEL,
  /* DefineButton2 */                 34: DEFINE_BUTTON,
  /* DefineBitsJPEG3 */               35: DEFINE_IMAGE,
  /* DefineBitsLossless2 */           36: DEFINE_BITMAP,
  /* DefineEditText */                37: DEFINE_TEXT,
  /* DefineSprite */                  39: undefined,
  /* FrameLabel */                    43: FRAME_LABEL,
  /* SoundStreamHead2 */              45: SOUND_STREAM_HEAD,
  /* DefineMorphShape */              46: DEFINE_SHAPE,
  /* DefineFont2 */                   48: DEFINE_FONT2,
  /* ExportAssets */                  56: undefined,
  /* ImportAssets */                  57: undefined,
  /* EnableDebugger */                58: undefined,
  /* DoInitAction */                  59: DO_ACTION,
  /* DefineVideoStream */             60: undefined,
  /* VideoFrame */                    61: undefined,
  /* DefineFontInfo2 */               62: undefined,
  /* EnableDebugger2 */               64: undefined,
  /* ScriptLimits */                  65: undefined,
  /* SetTabIndex */                   66: undefined,
  /* FileAttributes */                69: FILE_ATTRIBUTES,
  /* PlaceObject3 */                  70: PLACE_OBJECT,
  /* ImportAssets2 */                 71: undefined,
  /* DoABC (undoc) */                 72: DO_ABC,
  /* DefineFontAlignZones */          73: undefined,
  /* CSMTextSettings */               74: undefined,
  /* DefineFont3 */                   75: DEFINE_FONT2,
  /* SymbolClass */                   76: SYMBOL_CLASS,
  /* Metadata */                      77: undefined,
  /* DefineScalingGrid */             78: DEFINE_SCALING_GRID,
  /* DoABC */                         82: DO_ABC,
  /* DefineShape4 */                  83: DEFINE_SHAPE,
  /* DefineMorphShape2 */             84: DEFINE_SHAPE,
  /* DefineSceneAndFrameLabelData */  86: DEFINE_SCENE,
  /* DefineBinaryData */              87: undefined,
  /* DefineFontName */                88: undefined,
  /* StartSound2 */                   89: START_SOUND,
  /* DefineBitsJPEG4 */               90: DEFINE_IMAGE,
  /* DefineFont4 */                   91: undefined
};
