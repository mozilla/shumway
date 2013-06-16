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
/*globals UI8, UI16, SB, UB, FB, ALIGN, BINARY, STRING, FIXED, FLOAT, FIXED8,
          SI16, UI32, RECT, SHAPE, MATRIX, RGBA, CXFORM, BUTTON, KERNING, RGB,
          BUTTONCONDACTION, ANY_FILTER, TEXT_RECORD, SOUND_INFO, EVENT,
          SHAPE_WITH_STYLE, MORPH_SHAPE_WITH_STYLE, EncodedU32 */

var DEFINE_BITMAP = {
  id: UI16,
  $format: UI8,
  width: UI16,
  height: UI16,
  hasAlpha: 'tagCode===36',
  colorTableSize: ['format===3', [UI8]],
  bmpData: BINARY(0)
};
var DEFINE_FONT = {
  id: UI16,
  $$firstOffset: UI16,
  $glyphCount: 'firstOffset/2',
  $$restOffsets: {
    $: UI16,
    count: 'glyphCount-1'
  },
  offsets: '[firstOffset].concat(restOffsets)',
  glyphs: {
    $: SHAPE,
    count: 'glyphCount'
  }
};
var DEFINE_FONT2 = {
  id: UI16,
  $hasLayout: UB(1),
  $0: ['swfVersion>5', [
    { shiftJis: UB(1) },
    { $$reserved: UB(1) }
  ]],
  smallText: UB(1),
  ansi: UB(1),
  $wideOffset: UB(1),
  $wide: UB(1),
  italic: UB(1),
  bold: UB(1),
  $1: ['swfVersion>5', [
    { language: UI8 },
    {
      $$reserved: UI8,
      language: '0'
    }
  ]],
  $$nameLength: UI8,
  name: STRING('nameLength'),
  resolution: ['tagCode===75', ['20']],
  $glyphCount: UI16,
  $2: ['wideOffset', [
    {
      offsets: {
        $: UI32,
        count: 'glyphCount'
      },
      mapOffset: UI32
    },
    {
      offsets: {
        $: UI16,
        count: 'glyphCount'
      },
      mapOffset: UI16
    }
  ]],
  glyphs: {
    $: SHAPE,
    count: 'glyphCount'
  },
  $3: ['wide', [
    {
      codes: {
        $: UI16,
        count: 'glyphCount'
      }
    },
    {
      codes: {
        $: UI8,
        count: 'glyphCount'
      }
    }
  ]],
  $4: ['hasLayout', [{
    ascent: UI16,
    descent: UI16,
    leading: SI16,
    advance: {
      $: SI16,
      count: 'glyphCount'
    },
    bbox: {
      $: RECT,
      count: 'glyphCount'
    },
    $$kerningCount: UI16,
    kerning: {
      $: KERNING,
      count: 'kerningCount'
    }
  }]]
};
var DEFINE_IMAGE = {
  id: UI16,
  $0: ['tagCode>21', [
    {
      $$alphaDataOffset: UI32,
      deblock: ['tagCode===90', [FIXED8]],
      $imgData: BINARY('alphaDataOffset'),
      alphaData: BINARY(0)
    },
    { $imgData: BINARY(0) }
  ]],
  mimeType: ['imgData[0]<<8|imgData[1]', {
    0xffd8: '"image/jpeg"',
    0xffd9: '"image/jpeg"',
    0x8950: '"image/png"',
    0x4749: '"image/gif"',
    unknown: '"application/octet-stream"'
  }],
  incomplete: ['tagCode===6', ['1']]
};
var DEFINE_JPEG_TABLES = {
  id: '0',
  imgData: BINARY(0),
  mimeType: '"application/octet-stream"'
};
var DEFINE_LABEL = {
  id: UI16,
  bbox: RECT,
  matrix: MATRIX,
  $glyphBits: UI8,
  $advanceBits: UI8,
  records: {
    $: TEXT_RECORD,
    condition: '!eot'
  }
};
var DEFINE_SHAPE = {
  id: UI16,
  bbox: RECT,
  $isMorph: 'tagCode===46||tagCode===84',
  bboxMorph: ['isMorph', [RECT]],
  $hasStrokes: 'tagCode===83||tagCode===84',
  $0: ['hasStrokes', [{
    strokeBbox: RECT,
    strokeBboxMorph: ['isMorph', [RECT]],
    $$reserved: UB(5),
    fillWinding: UB(1),
    nonScalingStrokes: UB(1),
    scalingStrokes: UB(1)
  }]],
  $1: ['isMorph', [
    {
      offsetMorph: UI32,
      $2: MORPH_SHAPE_WITH_STYLE
    },
    { $2: SHAPE_WITH_STYLE }
  ]]
};
var DEFINE_TEXT = {
  id: UI16,
  bbox: RECT,
  $$flags: UI16,
  $hasText: 'flags>>7&1',
  wordWrap: 'flags>>6&1',
  multiline: 'flags>>5&1',
  password: 'flags>>4&1',
  readonly: 'flags>>3&1',
  $hasColor: 'flags>>2&1',
  $hasMaxLength: 'flags>>1&1',
  $hasFont: 'flags&1',
  $hasFontClass: 'flags>>15&1',
  autoSize: 'flags>>14&1',
  $hasLayout: 'flags>>13&1',
  noSelect: 'flags>>12&1',
  border: 'flags>>11&1',
  wasStatic: 'flags>>10&1',
  html: 'flags>>9&1',
  useOutlines: 'flags>>8&1',
  fontId: ['hasFont', [UI16]],
  fontClass: ['hasFontClass', [STRING(0)]],
  fontHeight: ['hasFont', [UI16]],
  color: ['hasColor', [RGBA]],
  maxLength: ['hasMaxLength', [UI16]],
  $0: ['hasLayout', [{
    align: UI8,
    leftMargin: UI16,
    rightMargin: UI16,
    indent: SI16,
    leading: SI16
  }]],
  variableName: STRING(0),
  initialText: ['hasText', [STRING(0)]]
};
var DEFINE_BUTTON = {
  id: UI16,
  $0: ['tagCode==7', [{
    characters: {
      $: BUTTON,
      condition: '!eob'
    },
    actionsData: BINARY(0)
  }, {
    $$trackFlags: UI8,
    trackAsMenu: 'trackFlags>>7&1',
    $$actionOffset: UI16,
    characters: {
      $: BUTTON,
      condition: '!eob'
    },
    $1: ['!!actionOffset', [{
      buttonActions: {
        $: BUTTONCONDACTION,
        condition: '$stream.remaining() > 0'
      }
    }]]
  }]]
};
var DO_ABC = {
  flags: ['tagCode===82', [UI32, '0']],
  name: ['tagCode===82', [STRING(0), '""']],
  data: BINARY(0)
};
var DO_ACTION = {
  spriteId: ['tagCode===59', [UI16]],
  actionsData: BINARY(0)
};
var FILE_ATTRIBUTES = {
  $$reserved: UB(1),
  useDirectBlit: UB(1),
  useGpu: UB(1),
  hasMetadata: UB(1),
  doAbc: UB(1),
  noCrossDomainCaching: UB(1),
  relativeUrls: UB(1),
  network: UB(1),
  $$pad: UB(24)
};
var PLACE_OBJECT = {
  $0: ['tagCode>4', [
    {
      $$flags: ['tagCode>26', [UI16, UI8]],
      $hasEvents: 'flags>>7&1',
      $clip: 'flags>>6&1',
      $hasName: 'flags>>5&1',
      $hasRatio: 'flags>>4&1',
      $hasCxform: 'flags>>3&1',
      $hasMatrix: 'flags>>2&1',
      $place: 'flags>>1&1',
      $move: 'flags&1',
      $1: ['tagCode===70', [
        {
          $hasBackgroundColor: 'flags>>15&1',
          $hasVisibility: 'flags>>14&1',
          $hasImage: 'flags>>12&1',
          $hasClassName: 'flags>>11&1',
          $cache: 'flags>>10&1',
          $blend: 'flags>>9&1',
          $hasFilters: 'flags>>8&1',
        },
        {
          $cache: '0',
          $blend: '0',
          $hasFilters: '0'
        }
      ]],
      depth: UI16,
      className: ['hasClassName', [STRING(0)]],
      symbolId: ['place', [UI16]],
      matrix: ['hasMatrix', [MATRIX]],
      cxform: ['hasCxform', [CXFORM]],
      ratio: ['hasRatio', [UI16]],
      name: ['hasName', [STRING(0)]],
      clipDepth: ['clip', [UI16]],
      $2: ['hasFilters', [{
        $$count: UI8,
        filters: {
          $: ANY_FILTER,
          count: 'count'
        }
      }]],
      blendMode: ['blend', [UI8]],
      bmpCache: ['cache', [UI8]],
      $3: ['hasEvents', [{
        $$reserved: UI16,
        $$allFlags: ['swfVersion>=6', [UI32, UI16]],
        events: {
          $: EVENT,
          condition: '!eoe'
        }
      }]],
      backgroundColor: ['hasBackgroundColor', ['ARGB']],
      visibility: ['hasVisibility', [UI8]]
    },
    {
      place: '1',
      symbolId: UI16,
      depth: UI16,
      hasMatrix: '1',
      matrix: MATRIX,
      $1: ['$stream.remaining()', [{
        hasCxform: '1',
        cxform: CXFORM
      }]]
    }
  ]]
};
var REMOVE_OBJECT = {
  symbolId: ['tagCode===5', [UI16]],
  depth: UI16
};
var SET_BACKGROUND_COLOR = {
  color: RGB
};
var SYMBOL_CLASS = {
  $$symbolCount: UI16,
  exports: {
    $: {
      symbolId: UI16,
      className: STRING(0)
    },
    count: 'symbolCount'
  }
};
var FRAME_LABEL = {
  name: STRING(0)
};
var DEFINE_SOUND = {
  id: UI16,
  $$soundFlags: UI8,
  soundFormat: 'soundFlags>>4&15',
  soundRate: 'soundFlags>>2&3',
  soundSize: 'soundFlags>>1&1',
  soundType: 'soundFlags&1',
  samplesCount: UI32,
  soundData: BINARY(0)
};
var START_SOUND = {
  soundId: ['tagCode == 15', [UI16]],
  soundClassName: ['tagCode == 89', [STRING(0)]],
  soundInfo: SOUND_INFO
};
var SOUND_STREAM_HEAD = {
  $$playbackFlags: UI8,
  playbackRate: 'playbackFlags>>2&3',
  playbackSize: 'playbackFlags>>1&1',
  playbackType: 'playbackFlags&1',
  $$streamFlags: UI8,
  $streamCompression: 'streamFlags>>4&15',
  streamRate: 'streamFlags>>2&3',
  streamSize: 'streamFlags>>1&1',
  streamType: 'streamFlags&1',
  samplesCount: UI32,
  latencySeek: ['streamCompression == 2', [SI16]]
};
var SOUND_STREAM_BLOCK = {
  data: BINARY(0)
};
var DEFINE_SCENE = {
  $$sceneCount: EncodedU32,
  scenes: {
    $: {
      offset: EncodedU32,
      name: STRING(0)
    },
    count: 'sceneCount'
  },
  $$labelCount: EncodedU32,
  labels: {
    $: {
      frame: EncodedU32,
      name: STRING(0)
    },
    count: 'labelCount'
  }
};
var DEFINE_SCALING_GRID = {
  symbolId: UI16,
  splitter: RECT
};
