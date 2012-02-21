/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

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
  xMin: SB('bits'),
  xMax: SB('bits'),
  yMin: SB('bits'),
  yMax: SB('bits'),
  $$1: ALIGN
};
var MATRIX = {
  $$0: ALIGN,
  $$hasScale: UB(1),
  $0: ['hasScale', [
    {
      $$bits: UB(5),
      scaleX: FB('bits'),
      scaleY: FB('bits')
    },
    {
      scaleX: '1',
      scaleY: '1'
    }
  ]],
  $$hasRotate: UB(1),
  $1: ['hasRotate', [
    {
      $$bits: UB(5),
      skew0: FB('bits'),
      skew1: FB('bits')
    },
    {
      skew0: '0',
      skew1: '0'
    }
  ]],
  $$bits: UB(5),
  translateX: SB('bits'),
  translateY: SB('bits'),
  $$1: ALIGN
};
var CXFORM = {
  $$0: ALIGN,
  $$hasAdd: UB(1),
  $$hasMult: UB(1),
  $$bits: UB(4),
  $0: ['hasMult', [
    {
      redMult: FB('bits'),
      greenMult: FB('bits'),
      blueMult: FB('bits'),
      alphaMult: ['tag>4', [FB('bits'), '1']]
    },
    {
      redMult: '1',
      greenMult: '1',
      blueMult: '1',
      alphaMult: '1'
    }
  ]],
  $1: ['hasAdd', [
    {
      redAdd: FB('bits'),
      greenAdd: FB('bits'),
      blueAdd: FB('bits'),
      alphaAdd: ['tag>4', [FB('bits'), '0']]
    },
    {
      redAdd: '0',
      greenAdd: '0',
      blueAdd: '0',
      alphaAdd: '0'
    }
  ]],
  $$1: ALIGN
};
var MOVIE_HEADER = {
  bounds: RECT,
  $$reserved: UI8,
  frameRate: UI8,
  frameCount: UI16
};
var ACTION_GOTO_FRAME = {
  frameNum: UI16
};
var ACTION_GET_URL = {
  url: STRING(0),
  target: STRING(0)
};
var ACTION_STORE_REGISTER = {
  register: UI8
};
var ACTION_CONSTANT_POOL = {
  $$count: UI16,
  constants: {
    $: STRING(0),
    count: 'count'
  }
};
var ACTION_WAIT_FOR_FRAME = {
  frameNum: UI16,
  skip: UI8
};
var ACTION_SET_TARGET = {
  target: STRING(0)
};
var ACTION_GOTO_LABEL = {
  label: STRING(0)
};
var ACTION_DEFINE_FUNCTION2 = {
  name: STRING(0),
  $$paramCount: UI16,
  $regCount: UI8,
  $$flags: UI16,
  preloadGlobal: 'flags>>8&1',
  preloadParent: 'flags>>7&1',
  preloadRoot: 'flags>>6&1',
  suppressSuper: 'flags>>5&1',
  preloadSuper: 'flags>>4&1',
  suppressArguments: 'flags>>3&1',
  preloadArguments: 'flags>>2&1',
  suppressThis: 'flags>>1&1',
  preloadThis: 'flags&1',
  params: {
    $: STRING(0),
    count: 'paramCount'
  },
  length: UI16
};
var ACTION_TRY = {
  $$reserved: UB(5),
  $catchInRegister: UB(1),
  hasFinally: UB(1),
  hasCatch: UB(1),
  trySize: UI16,
  catchSize: UI16,
  finallySize: UI16,
  $0: ['catchInRegister', [
    { catchRegister: UI8 },
    { catchName: STRING(0) }
  ]]
};
var ACTION_WITH = {
  length: UI16
};
var ACTION_PUSH = {
  $0: {
    $: {
      $type: UI8,
      value: ['type', {
        0: STRING(0),
        1: FLOAT,
        2: 'null',
        3: 'undefined',
        4: UI8,
        5: BOOL,
        6: DOUBLE,
        7: SI32,
        8: UI8,
        9: UI16
      }]
    },
    length: 'length'
  }
};
var ACTION_JUMP = {
  offset: SI16
};
var ACTION_GET_URL2 = {
  sendVarsMethod: UB(2),
  $$reserved: UB(4),
  loadTarget: UB(1),
  loadVariables: UB(1)
};
var ACTION_DEFINE_FUNCTION = {
  name: STRING(0),
  $$paramCount: UI16,
  params: {
    $: STRING(0),
    count: 'paramCount'
  },
  length: UI16
};
var ACTION_IF = {
  offset: SI16
};
var ACTION_GOTO_FRAME2 = {
  $$reserved: UB(6),
  $hasSceneBias: UB(1),
  play: UB(1),
  sceneBias: ['hasSceneBias', [UI16]]
};
var ACTION_RECORD = {
  $action: UI8,
  $hasData: 'action>>7',
  $0: ['hasData', [{
    $$length: UI16,
    $1: ['action', {
      129: ACTION_GOTO_FRAME,
      131: ACTION_GET_URL,
      135: ACTION_STORE_REGISTER,
      136: ACTION_CONSTANT_POOL,
      138: ACTION_WAIT_FOR_FRAME,
      139: ACTION_SET_TARGET,
      140: ACTION_GOTO_LABEL,
      142: ACTION_DEFINE_FUNCTION2,
      143: ACTION_TRY,
      148: ACTION_WITH,
      150: ACTION_PUSH,
      153: ACTION_JUMP,
      154: ACTION_GET_URL2,
      155: ACTION_DEFINE_FUNCTION,
      157: ACTION_IF,
      unknown: BINARY('length')
    }]
  }]]
};
var EVENT = {
  $$flags: ['version>=6', [UI32, UI16]],
  $eoe: '!flags',
  $0: ['version>=6', [
    {
      construct: ['version>=7', ['flags>>18&1', '0']],
      keyPress: 'flags>>17&1',
      dragOut: 'flags>>16&1',
      dragOver: 'flags>>15&1',
      rollOut: 'flags>>14&1',
      rollOver: 'flags>>13&1',
      releaseOutside: 'flags>>12&1',
      release: 'flags>>11&1',
      press: 'flags>>10&1',
      initialize: 'flags>>9&1',
    }
  ]],
  data: 'flags>>8&1',
  keyUp: 'flags>>7&1',
  keyDown: 'flags>>6&1',
  mouseUp: 'flags>>5&1',
  mouseDown: 'flags>>4&1',
  mouseMove: 'flags>>3&1',
  unload: 'flags>>2&1',
  enterFrame: 'flags>>1&1',
  onload: 'flags&1',
  $1: ['!eoe', [{
    $length: UI32,
    actions: {
      $: ACTION_RECORD,
      length: 'length'
    }
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
  strength: UB(1),
  innerShadow: UB(1),
  knockout: UB(1),
  $2: ['type===3', [
    { onTop: UB(1) },
    { $$reserved: UB(1) }
  ]],
  $3: ['type===4||type===7', [
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
var EXTERNAL = {
  objectId: UI16,
  symbolName: STRING
};
var PARAMS = {
  register: UI8,
  name: STRING
};
var FILL_SOLID = {
  color: ['tag>22||isMorph', [RGBA, RGB]],
  colorMorph: ['isMorph', [RGBA]]
};
var GRADIENT_RECORD = {
  ratio: UI8,
  color: ['tag>22', [RGBA, RGB]],
  $0: ['isMorph', [{
    ratioMorph: UI8,
    colorMorph: RGBA
  }]]
};
var GRADIENT = {
  $0: ['tag===83', [
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
  focalPoint: ['type===19', [FIXED8]]
};
var FILL_GRADIENT = {
  matrix: MATRIX,
  matrixMorph: ['isMorph', [MATRIX]],
  $0: GRADIENT
};
var FILL_BITMAP = {
  bitmapId: UI16,
  matrix: MATRIX,
  matrixMorph: ['isMorph', [MATRIX]]
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
  $$count: ['tag>2&&tmp===255', [UI16, 'tmp']],
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
      color: ['tag>22', [RGBA, RGB]],
      colorMorph: ['isMorph', [RGBA]]
    }
  ]]
};
var LINE_STYLE_ARRAY = {
  $$tmp: UI8,
  $$count: ['tag>2&&tmp===255', [UI16, 'tmp']],
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
  $hasNewStyles: ['tag>2', ['flags>>4', '0']],
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
    repeat: '!eos'
  }
};
var SHAPE_WITH_STYLE = {
  $0: STYLES,
  records: {
    $: SHAPE_RECORD,
    repeat: '!eos'
  }
};
var XRGB = {
  $$pad: UI8,
  red: UI8,
  green: UI8,
  blue: UI8
};
var MORPH_SHAPE_WITH_STYLE = {
  $0: STYLES,
  records: {
    $: SHAPE_RECORD,
    repeat: '!eos'
  },
  $1: STYLE_BITS,
  recordsMorph: {
    $: SHAPE_RECORD,
    repeat: '!eos'
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
  $hasMoveX: 'flags>>1&1',
  $hasMoveY: 'flags&1',
  fontId: ['hasFont', [UI16]],
  $0: ['hasColor', [{ color: ['tag===33', [RGBA, RGB]] }]],
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
    $glyphCount: ['version>6', ['tmp', 'tmp&0x7f']],
    entries: {
      $: TEXT_ENTRY,
      count: 'glyphCount'
    }
  }]]
};
var ZONE_DATA = {
  coord: FLOAT16,
  range: FLOAT16
};
var ZONE_ARRAY = {
  $count: UI8,
  data: {
    $: ZONE_DATA,
    count: 'count'
  },
  $$reserved: UB(6),
  zoneY: UB(1),
  zoneX: UB(1)
};
var ENVELOPE = {
  pos: UI32,
  volumeLeft: UI16,
  volumeRight: UI16
};
var SOUND_INFO = {
  soundId: UI16,
  $$reserved: UB(2),
  stop: UB(1),
  noMultiple: UB(1),
  $hasEnvelope: UB(1),
  $hasLoops: UB(1),
  $hasOutPoint: UB(1),
  $hasInPoint: UB(1),
  inPoint: ['hasInPoint', [UI32]],
  outPoint: ['hasInPoint', [UI32]],
  loopCount: ['hasLoopCount', [UI16]],
  $0: ['hasEnvelope', [{
    $envelopeCount: UI8,
    envelopes: {
      $: ENVELOPE,
      count: 'envelopeCount'
    }
  }]]
};
var BUTTON = {
  $$flags: UI8,
  $eob: '!flags',
  $0: ['version>=8', [
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
  $1: ['!eob', {
    buttonId: UI16,
    depth: UI16,
    matrix: MATRIX,
    cxform: ['tag===34', [CXFORM]],
    $2: ['hasFilters', [{
      filterCount: UI8,
      filters: ANY_FILTER
    }]],
    blendMode: ['blend', [UI8]]
  }]
};
var CONDITION = {
  length: UI16,
  key: UB(7),
  menuLeave: UB(1),
  menuEnter: UB(1),
  releaseOutside: UB(1),
  dragEnter: UB(1),
  dragLeave: UB(1),
  releaseInside: UB(1),
  push: UB(1),
  leave: UB(1),
  enter: UB(1),
  actions: {
    $: ACTION_RECORD,
    repeat: 'action'
  }
};
