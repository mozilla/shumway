/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var DEFINE_BITMAP = {
  type: "'bitmap'",
  id: UI16,
  $format: UI8,
  width: UI16,
  height: UI16,
  hasAlpha: 'tag===36',
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
var DEFINE_FONT_INFO = {
  type: '"font"',
  id: UI16,
  $$nameLength: UI8,
  name: STRING('nameLength'),
  $$reserved: UB(2),
  smallText: UB(1),
  shiftJis: UB(1),
  ansi: UB(1),
  italic: UB(1),
  bold: UB(1),
  $wide: UB(1),
  $0: ['tag===62', [
    { language: UI8 },
    { language: '0' }
  ]],
  $1: ['wide', [
    {
      codes: {
        $: UI16,
        length: '$stream.remaining()'
      }
    },
    {
      codes: {
        $: UI8,
        length: '$stream.remaining()'
      }
    }
  ]],
  incomplete: '1'
};
var DEFINE_FONT2 = {
  type: '"font"',
  id: UI16,
  $hasLayout: UB(1),
  $0: ['version>5', [
    { shiftJis: UB(1) },
    { $$reserved: UB(1) }
  ]],
  smallText: UB(1),
  ansi: UB(1),
  $wideOffset: UB(1),
  $wide: UB(1),
  italic: UB(1),
  bold: UB(1),
  $1: ['version>5', [
    { language: UI8 },
    {
      $$reserved: UI8,
      language: '0'
    }
  ]],
  $$nameLength: UI8,
  name: STRING('nameLength'),
  resolution: ['tag===75', ['20']],
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
    bounds: {
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
  type: '"image"',
  id: UI16,
  $0: ['tag>21', [
    {
      $$alphaDataOffset: UI32,
      deblock: ['tag===90', [FIXED8]],
      $imgData: BINARY('alphaDataOffset'),
      alphaData: BINARY(0)
    },
    { $imgData: BINARY(0) }
  ]],
    0xffd8: '"image/jpeg"',
    0x8950: '"image/png"',
  }],
  incomplete: ['tag===6', ['1']]
};
var DEFINE_JPEG_TABLES = {
  id: '0',
  imgData: BINARY(0)
};
var DEFINE_SHAPE = {
  type: '"shape"',
  id: UI16,
  bounds: RECT,
  $isMorph: 'tag===46||tag===84',
  boundsMorph: ['isMorph', [RECT]],
  $hasStrokes: 'tag===83||tag===84',
  $0: ['hasStrokes', [{
    strokeBounds: RECT,
    strokeBoundsMorph: ['isMorph', [RECT]],
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
  type: '"text"',
  id: UI16,
  bounds: RECT,
  matrix: MATRIX,
  $glyphBits: UI8,
  $advanceBits: UI8,
  records: {
    $: TEXT_RECORD,
    repeat: '!eot'
  }
};
var DO_ABC = {
  flags: UI32,
  name: STRING(0),
  data: BINARY(0)
};
var DO_ACTION = {
  spriteId: ['tag===59', [UI16]],
  actions: {
    $: ACTION,
    repeat: 'action'
  }
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
var METADATA = {
  metadata: STRING(0)
};
var PLACE_OBJECT = {
  type: '"place"',
  $0: ['tag>4', [
    {
      $1: ['tag===70', [
        {
          $$flags: UI16,
          $hasBackgroundColor: 'flags>>15&1',
          $hasVisibility: 'flags>>14&1',
          $hasImage: 'flags>>12&1',
          $hasClassName: 'flags>>11&1',
          $cache: 'flags>>10&1',
          $blend: 'flags>>9&1',
          $hasFilters: 'flags>>8&1',
        },
        {
          $$flags: UI8,
          $cache: '0',
          $blend: '0',
          $hasFilters: '0'
        }
      ]],
      $hasEvents: 'flags>>7&1',
      $clip: 'flags>>6&1',
      $hasName: 'flags>>5&1',
      $hasRatio: 'flags>>4&1',
      $hasCxform: 'flags>>3&1',
      $hasMatrix: 'flags>>2&1',
      $place: 'flags>>1&1',
      $move: 'flags&1',
      depth: UI16,
      className: ['hasClassName', [STRING(0)]],
      objId: ['place', [UI16]],
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
        $$allFlags: ['version>=6', [UI32, UI16]],
        events: {
          $: EVENT,
          repeat: '!eoe'
        }
      }]],
      backgroundColor: ['hasBackgroundColor', ['ARGB']],
      visibility: ['hasVisibility', [UI8]]
    },
    {
      place: '1',
      objId: UI16,
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
  type: '"remove"',
  objId: ['tag===5', [UI16]],
  depth: UI16
};
var SET_BACKGROUND_COLOR = {
  type: '"background"',
  color: RGB
};
var SHOW_FRAME = {
  type: '"frame"'
};
