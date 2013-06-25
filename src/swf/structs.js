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
          SI16, UI32 */

var RGB = {
  red: UI8,
  green: UI8,
  blue: UI8,
  alpha: '255'
};
var RGBA = {
  red: UI8,
  green: UI8,
  blue: UI8,
  alpha: UI8
};
var ARGB = {
  alpha: UI8,
  red: UI8,
  green: UI8,
  blue: UI8
};
var RECT = {
  $$0: ALIGN,
  $$bits: UB(5),
  $$xMin: SB('bits'),
  $$xMax: SB('bits'),
  $$yMin: SB('bits'),
  $$yMax: SB('bits'),
  left: 'xMin/20',
  right: 'xMax/20',
  top: 'yMin/20',
  bottom: 'yMax/20',
  $$1: ALIGN
};
var MATRIX = {
  $$0: ALIGN,
  $$hasScale: UB(1),
  $0: ['hasScale', [
    {
      $$bits: UB(5),
      a: FB('bits'),
      d: FB('bits')
    },
    {
      a: '1',
      d: '1'
    }
  ]],
  $$hasRotate: UB(1),
  $1: ['hasRotate', [
    {
      $$bits: UB(5),
      b: FB('bits'),
      c: FB('bits')
    },
    {
      b: '0',
      c: '0'
    }
  ]],
  $$bits: UB(5),
  $$e: SB('bits'),
  $$f: SB('bits'),
  tx: 'e/20',
  ty: 'f/20',
  $$1: ALIGN
};
var CXFORM = {
  $$0: ALIGN,
  $$hasOffsets: UB(1),
  $$hasMultipliers: UB(1),
  $$bits: UB(4),
  $0: ['hasMultipliers', [
    {
      redMultiplier: SB('bits'),
      greenMultiplier: SB('bits'),
      blueMultiplier: SB('bits'),
      alphaMultiplier: ['tagCode>4', [SB('bits'), '256']]
    },
    {
      redMultiplier: '256',
      greenMultiplier: '256',
      blueMultiplier: '256',
      alphaMultiplier: '256'
    }
  ]],
  $1: ['hasOffsets', [
    {
      redOffset: SB('bits'),
      greenOffset: SB('bits'),
      blueOffset: SB('bits'),
      alphaOffset: ['tagCode>4', [SB('bits'), '0']]
    },
    {
      redOffset: '0',
      greenOffset: '0',
      blueOffset: '0',
      alphaOffset: '0'
    }
  ]],
  $$1: ALIGN
};
var MOVIE_HEADER = {
  bbox: RECT,
  $$reserved: UI8,
  frameRate: UI8,
  frameCount: UI16
};
var EVENT = {
  $$flags: ['swfVersion>=6', [UI32, UI16]],
  $eoe: '!flags',
  onKeyUp: 'flags>>7&1',
  onKeyDown: 'flags>>6&1',
  onMouseUp: 'flags>>5&1',
  onMouseDown: 'flags>>4&1',
  onMouseMove: 'flags>>3&1',
  onUnload: 'flags>>2&1',
  onEnterFrame: 'flags>>1&1',
  onLoad: 'flags&1',
  $0: ['swfVersion>=6', [
    {
      onDragOver: 'flags>>15&1',
      onRollOut: 'flags>>14&1',
      onRollOver: 'flags>>13&1',
      onReleaseOutside: 'flags>>12&1',
      onRelease: 'flags>>11&1',
      onPress: 'flags>>10&1',
      onInitialize: 'flags>>9&1',
      onData: 'flags>>8&1',
      onConstruct: ['swfVersion>=7', ['flags>>18&1', '0']],
      $keyPress: 'flags>>17&1',
      onDragOut: 'flags>>16&1'
    }
  ]],
  $1: ['!eoe', [{
    $length: UI32,
    keyCode: ['keyPress', [UI8, null]],
    actionsData: BINARY('length - (keyPress ? 1 : 0)')
  }]]
};
var FILTER_GLOW = {
  $$count: ['type===4||type===7', [UI8, '1']],
  colors: {
    $: RGBA,
    count: 'count'
  },
  higlightColor: ['type===3', [RGBA]],
  $0: ['type===4||type===7', [{
    ratios: {
      $: UI8,
      count: 'count'
    }
  }]],
  blurX: FIXED,
  blurY: FIXED,
  $1: ['type!==2', [{
    angle: FIXED,
    distance: FIXED
  }]],
  strength: FIXED8,
  innerShadow: UB(1),
  knockout: UB(1),
  compositeSource: UB(1),
  $3: ['type===3', [
    { onTop: UB(1) },
    { $$reserved: UB(1) }
  ]],
  $4: ['type===4||type===7', [
    { passes: UB(4) },
    { $$reserved: UB(4) }
  ]]
};
var FILTER_BLUR = {
  blurX: FIXED,
  blurY: FIXED,
  passes: UB(5),
  $$reserved: UB(3)
};
var FILTER_CONVOLUTION = {
  columns: UI8,
  rows: UI8,
  divisor: FLOAT,
  bias: FLOAT,
  weights: {
    $: FLOAT,
    count: 'columns*rows'
  },
  defaultColor: RGBA,
  $$reserved: UB(6),
  clamp: UB(1),
  preserveAlpha: UB(1)
};
var FILTER_COLORMATRIX = {
  matrix: {
    $: FLOAT,
    count: 20
  }
};
var ANY_FILTER = {
  $type: UI8,
  $0: ['type', {
    0: FILTER_GLOW,
    1: FILTER_BLUR,
    2: FILTER_GLOW,
    3: FILTER_GLOW,
    4: FILTER_GLOW,
    5: FILTER_CONVOLUTION,
    6: FILTER_COLORMATRIX,
    7: FILTER_GLOW
  }]
};
var FILL_SOLID = {
  color: ['tagCode>22||isMorph', [RGBA, RGB]],
  colorMorph: ['isMorph', [RGBA]]
};
var GRADIENT_RECORD = {
  ratio: UI8,
  color: ['tagCode>22', [RGBA, RGB]],
  $0: ['isMorph', [{
    ratioMorph: UI8,
    colorMorph: RGBA
  }]]
};
var GRADIENT = {
  $0: ['tagCode===83', [
    {
      spreadMode: UB(2),
      interpolationMode: UB(2)
    },
    { $$pad: UB(4) }
  ]],
  $count: UB(4),
  records: {
    $: GRADIENT_RECORD,
    count: 'count'
  },
  $1: ['type===19', [{
    focalPoint: FIXED8,
    focalPointMorph: ['isMorph', [FIXED8]]
  }]]
};
var FILL_GRADIENT = {
  matrix: MATRIX,
  matrixMorph: ['isMorph', [MATRIX]],
  $0: GRADIENT
};
var FILL_BITMAP = {
  bitmapId: UI16,
  matrix: MATRIX,
  matrixMorph: ['isMorph', [MATRIX]],
  condition: 'type===64||type===67'
};
var FILL_STYLE = {
  $type: UI8,
  $0: ['type', {
    0: FILL_SOLID,
    16: FILL_GRADIENT,
    18: FILL_GRADIENT,
    19: FILL_GRADIENT,
    64: FILL_BITMAP,
    65: FILL_BITMAP,
    66: FILL_BITMAP,
    67: FILL_BITMAP
  }]
};
var FILL_STYLE_ARRAY = {
  $$tmp: UI8,
  $$count: ['tagCode>2&&tmp===255', [UI16, 'tmp']],
  fillStyles: {
    $: FILL_STYLE,
    count: 'count'
  }
};
var LINE_STYLE = {
  width: UI16,
  widthMorph: ['isMorph', [UI16]],
  $0: ['hasStrokes', [
    {
      $$: ALIGN,
      startCapStyle: UB(2),
      $joinStyle: UB(2),
      $hasFill: UB(1),
      noHscale: UB(1),
      noVscale: UB(1),
      pixelHinting: UB(1),
      $$reserved: UB(5),
      noClose: UB(1),
      endCapStyle: UB(2),
      miterLimitFactor: ['joinStyle===2', [FIXED8]],
      $1: ['hasFill', [
        { fillStyle: FILL_STYLE },
        {
          color: RGBA,
          colorMorph: ['isMorph', [RGBA]]
        }
      ]]
    },
    {
      color: ['tagCode>22', [RGBA, RGB]],
      colorMorph: ['isMorph', [RGBA]]
    }
  ]]
};
var LINE_STYLE_ARRAY = {
  $$tmp: UI8,
  $$count: ['tagCode>2&&tmp===255', [UI16, 'tmp']],
  lineStyles: {
    $: LINE_STYLE,
    count: 'count'
  }
};
var STYLE_BITS = {
  $$: ALIGN,
  $$fillBits: UB(4),
  $$lineBits: UB(4)
};
var STYLES = {
  $0: FILL_STYLE_ARRAY,
  $1: LINE_STYLE_ARRAY,
  $2: STYLE_BITS
};
var SHAPE_RECORD_SETUP = {
  $hasNewStyles: ['tagCode>2', ['flags>>4', '0']],
  $hasLineStyle: 'flags>>3&1',
  $hasFillStyle1: 'flags>>2&1',
  $hasFillStyle0: 'flags>>1&1',
  $move: 'flags&1',
  $0: ['move', [{
    $$bits: UB(5),
    moveX: SB('bits'),
    moveY: SB('bits')
  }]],
  fillStyle0: ['hasFillStyle0', [UB('fillBits')]],
  fillStyle1: ['hasFillStyle1', [UB('fillBits')]],
  lineStyle: ['hasLineStyle', [UB('lineBits')]],
  $1: ['hasNewStyles', [STYLES]]
};
var SHAPE_RECORD_EDGE = {
  $isStraight: 'flags>>4',
  $$tmp: 'flags&0x0f',
  $$bits: 'tmp+2',
  $0: ['isStraight', [
    {
      $isGeneral: UB(1),
      $1: ['isGeneral', [
        {
          deltaX: SB('bits'),
          deltaY: SB('bits')
        },
        {
          $isVertical: UB(1),
          $2: ['isVertical', [
            { deltaY: SB('bits') },
            { deltaX: SB('bits') }
          ]]
        }
      ]]
    },
    {
      controlDeltaX: SB('bits'),
      controlDeltaY: SB('bits'),
      anchorDeltaX: SB('bits'),
      anchorDeltaY: SB('bits')
    }
  ]]
};
var SHAPE_RECORD = {
  $type: UB(1),
  $$flags: UB(5),
  $eos: '!(type||flags)',
  $0: ['type', [SHAPE_RECORD_EDGE, SHAPE_RECORD_SETUP]]
};
var SHAPE = {
  $0: STYLE_BITS,
  records: {
    $: SHAPE_RECORD,
    condition: '!eos'
  }
};
var SHAPE_WITH_STYLE = {
  $0: STYLES,
  records: {
    $: SHAPE_RECORD,
    condition: '!eos'
  }
};
var MORPH_SHAPE_WITH_STYLE = {
  $0: STYLES,
  records: {
    $: SHAPE_RECORD,
    condition: '!eos'
  },
  $1: STYLE_BITS,
  recordsMorph: {
    $: SHAPE_RECORD,
    condition: '!eos'
  }
};
var KERNING = {
  $0: ['wide', [
    {
      code1: UI16,
      code2: UI16
    },
    {
      code1: UI8,
      code2: UI8
    }
  ]],
  adjustment: UI16
};
var TEXT_ENTRY = {
  glyphIndex: UB('glyphBits'),
  advance: SB('advanceBits')
};
var TEXT_RECORD_SETUP = {
  $hasFont: 'flags>>3&1',
  $hasColor: 'flags>>2&1',
  $hasMoveY: 'flags>>1&1',
  $hasMoveX: 'flags&1',
  fontId: ['hasFont', [UI16]],
  $0: ['hasColor', [{ color: ['tagCode===33', [RGBA, RGB]] }]],
  moveX: ['hasMoveX', [SI16]],
  moveY: ['hasMoveY', [SI16]],
  fontHeight: ['hasFont', [UI16]]
};
var TEXT_RECORD = {
  $$: ALIGN,
  $$flags: UB(8),
  $eot: '!flags',
  $0: TEXT_RECORD_SETUP,
  $1: ['!eot', [{
    $$tmp: UI8,
    $glyphCount: ['swfVersion>6', ['tmp', 'tmp&0x7f']],
    entries: {
      $: TEXT_ENTRY,
      count: 'glyphCount'
    }
  }]]
};
var SOUND_ENVELOPE = {
  pos44: UI32,
  volumeLeft: UI16,
  volumeRight: UI16
};
var SOUND_INFO = {
  $$reserved: UB(2),
  stop: UB(1),
  noMultiple: UB(1),
  $hasEnvelope: UB(1),
  $hasLoops: UB(1),
  $hasOutPoint: UB(1),
  $hasInPoint: UB(1),
  inPoint: ['hasInPoint', [UI32]],
  outPoint: ['hasOutPoint', [UI32]],
  loopCount: ['hasLoops', [UI16]],
  $0: ['hasEnvelope', [{
    $envelopeCount: UI8,
    envelopes: {
      $: SOUND_ENVELOPE,
      count: 'envelopeCount'
    }
  }]]
};
var BUTTON = {
  $$flags: UI8,
  $eob: '!flags',
  $0: ['swfVersion>=8', [
    {
      $blend: 'flags>>5&1',
      $hasFilters: 'flags>>4&1'
    },
    {
      $blend: '0',
      $hasFilters: '0'
    }
  ]],
  stateHitTest: 'flags>>3&1',
  stateDown: 'flags>>2&1',
  stateOver: 'flags>>1&1',
  stateUp: 'flags&1',
  $1: ['!eob', [{
    symbolId: UI16,
    depth: UI16,
    matrix: MATRIX,
    cxform: ['tagCode===34', [CXFORM]],
    $2: ['hasFilters', [{
      filterCount: UI8,
      filters: ANY_FILTER
    }]],
    blendMode: ['blend', [UI8]]
  }]]
};
var BUTTONCONDACTION = {
  $$buttonCondSize: UI16,
  $$buttonConditions: UI16,
  idleToOverDown: 'buttonConditions>>7&1',
  outDownToIdle: 'buttonConditions>>6&1',
  outDownToOverDown: 'buttonConditions>>5&1',
  overDownToOutDown: 'buttonConditions>>4&1',
  overDownToOverUp: 'buttonConditions>>3&1',
  overUpToOverDown: 'buttonConditions>>2&1',
  overUpToIdle: 'buttonConditions>>1&1',
  idleToOverUp: 'buttonConditions&1',
  mouseEventFlags: 'buttonConditions&511',
  keyPress: 'buttonConditions>>9&127',
  overDownToIdle: 'buttonConditions>>8&1',
  actionsData: ['!buttonCondSize', [BINARY(0), BINARY('buttonCondSize - 4')]]
};
