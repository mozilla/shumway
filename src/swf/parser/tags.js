/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

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
var DO_ACTION = {
  spriteId: ['tag===59', [UI16]],
  actions: {
    $: ACTION_RECORD,
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
      className: ['hasClassName||(place&&hasImage)', [STRING(0)]],
      objectId: ['place', [UI16]],
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
      }]]
    },
    {
      place: '1',
      objectId: UI16,
      depth: UI16,
      hasMatrix: '1',
      matrix: MATRIX,
      $1: ['$stream.remain()', [{
        hasCxform: '1',
        cxform: CXFORM
      }]]
    }
  ]]
};
var REMOVE_OBJECT = {
  type: '"remove"',
  objectId: ['tag===5', [UI16]],
  depth: UI16
};
var SHOW_FRAME = {
  type: '"frame"'
};
