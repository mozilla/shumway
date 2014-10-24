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

/// <reference path='references.ts'/>
module Shumway.SWF.Parser.LowLevel {
  function defineShape($bytes, $stream, output, swfVersion, tagCode) {
    output || (output = {});
    output.id = readUi16($bytes, $stream);
    var lineBounds = output.lineBounds = {};
    bbox($bytes, $stream, lineBounds, swfVersion, tagCode);
    var isMorph = output.isMorph = tagCode === 46 || tagCode === 84;
    if (isMorph) {
      var lineBoundsMorph = output.lineBoundsMorph = {};
      bbox($bytes, $stream, lineBoundsMorph, swfVersion, tagCode);
    }
    var canHaveStrokes = output.canHaveStrokes = tagCode === 83 || tagCode === 84;
    if (canHaveStrokes) {
      var fillBounds = output.fillBounds = {};
      bbox($bytes, $stream, fillBounds, swfVersion, tagCode);
      if (isMorph) {
        var fillBoundsMorph = output.fillBoundsMorph = {};
        bbox($bytes, $stream, fillBoundsMorph, swfVersion, tagCode);
      }
      output.flags = readUi8($bytes, $stream);
    }
    if (isMorph) {
      output.offsetMorph = readUi32($bytes, $stream);
      morphShapeWithStyle($bytes, $stream, output, swfVersion, tagCode, isMorph, canHaveStrokes);
    } else {
      shapeWithStyle($bytes, $stream, output, swfVersion, tagCode, isMorph, canHaveStrokes);
    }
    return output;
  }

  function placeObject($bytes, $stream, $, swfVersion, tagCode, tagEnd) {
    var flags;
    $ || ($ = {});
    if (tagCode === SwfTag.CODE_PLACE_OBJECT) {
      $.symbolId = readUi16($bytes, $stream);
      $.depth = readUi16($bytes, $stream);
      $.flags |= PlaceObjectFlags.HasMatrix;
      $.matrix = matrix($bytes, $stream);
      if ($stream.pos < tagEnd) {
        $.flags |= PlaceObjectFlags.HasColorTransform;
        var $31 = $.cxform = {};
        cxform($bytes, $stream, $31, tagCode);
      }
      return $;
    }
    flags = $.flags = tagCode > SwfTag.CODE_PLACE_OBJECT2 ?
                      readUi16($bytes, $stream) :
                      readUi8($bytes, $stream);
    $.depth = readUi16($bytes, $stream);
    if (flags & PlaceObjectFlags.HasClassName) {
      $.className = readString($bytes, $stream, 0);
    }
    if (flags & PlaceObjectFlags.HasCharacter) {
      $.symbolId = readUi16($bytes, $stream);
    }
    if (flags & PlaceObjectFlags.HasMatrix) {
      $.matrix = matrix($bytes, $stream);
    }
    if (flags & PlaceObjectFlags.HasColorTransform) {
      var $1 = $.cxform = {};
      cxform($bytes, $stream, $1, tagCode);
    }
    if (flags & PlaceObjectFlags.HasRatio) {
      $.ratio = readUi16($bytes, $stream);
    }
    if (flags & PlaceObjectFlags.HasName) {
      $.name = readString($bytes, $stream, 0);
    }
    if (flags & PlaceObjectFlags.HasClipDepth) {
      $.clipDepth = readUi16($bytes, $stream);
    }
    if (flags & PlaceObjectFlags.HasFilterList) {
      var count = readUi8($bytes, $stream);
      var $2 = $.filters = [];
      var $3 = count;
      while ($3--) {
        var $4 = {};
        anyFilter($bytes, $stream, $4);
        $2.push($4);
      }
    }
    if (flags & PlaceObjectFlags.HasBlendMode) {
      $.blendMode = readUi8($bytes, $stream);
    }
    if (flags & PlaceObjectFlags.HasCacheAsBitmap) {
      $.bmpCache = readUi8($bytes, $stream);
    }
    if (flags & PlaceObjectFlags.HasVisible) {
      $.visibility = readUi8($bytes, $stream);
    }
    if (flags & PlaceObjectFlags.OpaqueBackground) {
      $.backgroundColor = argb($bytes, $stream);
    }
    if (flags & PlaceObjectFlags.HasClipActions) {
      var reserved = readUi16($bytes, $stream);
      if (swfVersion >= 6) {
        var allFlags = readUi32($bytes, $stream);
      }
      else {
        var allFlags = readUi16($bytes, $stream);
      }
      var $28 = $.events = [];
      do {
        var $29 = {};
        if (events($bytes, $stream, $29, swfVersion)) {
          break;
        }
        if ($stream.pos > tagEnd) {
          Debug.warning('PlaceObject handler attempted to read clip events beyond tag end');
          $stream.pos = tagEnd;
          break;
        }
        $28.push($29);
      } while (true);
    }
    return $;
  }

  function removeObject($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    if (tagCode === 5) {
      $.symbolId = readUi16($bytes, $stream);
    }
    $.depth = readUi16($bytes, $stream);
    return $;
  }

  export function defineImage($bytes: Uint8Array, $stream: Stream, $, swfVersion, tagCode: number,
                              tagEnd: number, jpegTables: Uint8Array) {
    var imgData;
    var tag: any = $ || {};
    tag.id = readUi16($bytes, $stream);
    if (tagCode > 21) {
      var alphaDataOffset = readUi32($bytes, $stream);
      if (tagCode === 90) {
        tag.deblock = readFixed8($bytes, $stream);
      }
      alphaDataOffset += $stream.pos;
      imgData = tag.imgData = $bytes.subarray($stream.pos, alphaDataOffset);
      tag.alphaData = $bytes.subarray(alphaDataOffset, tagEnd);
      $stream.pos = tagEnd;
    }
    else {
      imgData = tag.imgData = $bytes.subarray($stream.pos, tagEnd);
      $stream.pos = tagEnd;
    }
    switch (imgData[0] << 8 | imgData[1]) {
      case 65496:
      case 65497:
        tag.mimeType = "image/jpeg";
        break;
      case 35152:
        tag.mimeType = "image/png";
        break;
      case 18249:
        tag.mimeType = "image/gif";
        break;
      default:
        tag.mimeType = "application/octet-stream";
    }
    tag.jpegTables = tagCode === 6 ? jpegTables : null;
    return tag;
  }

  function defineButton($bytes, $stream, $, swfVersion, tagCode, tagEnd) {
    var eob: boolean;
    $ || ($ = {});
    $.id = readUi16($bytes, $stream);
    if (tagCode == SwfTag.CODE_DEFINE_BUTTON) {
      var characters = $.characters = [];
      do {
        var $1 = {};
        var temp = button($bytes, $stream, $1, swfVersion, tagCode);
        eob = temp.eob;
        characters.push($1);
      } while (!eob);
      $.actionsData = $bytes.subarray($stream.pos, tagEnd);
      $stream.pos = tagEnd;
    }
    else {
      var trackFlags = readUi8($bytes, $stream);
      $.trackAsMenu = trackFlags >> 7 & 1;
      var actionOffset = readUi16($bytes, $stream);
      var characters = $.characters = [];
      do {
        var $29: any = {};
        var flags = readUi8($bytes, $stream);
        var eob = $29.eob = !flags;
        if (swfVersion >= 8) {
          $29.flags = (flags >> 5 & 1 ? PlaceObjectFlags.HasBlendMode : 0) |
                      (flags >> 4 & 1 ? PlaceObjectFlags.HasFilterList : 0);
        }
        else {
          $29.flags = 0;
        }
        $29.stateHitTest = flags >> 3 & 1;
        $29.stateDown = flags >> 2 & 1;
        $29.stateOver = flags >> 1 & 1;
        $29.stateUp = flags & 1;
        if (!eob) {
          $29.symbolId = readUi16($bytes, $stream);
          $29.depth = readUi16($bytes, $stream);
          $29.matrix = matrix($bytes, $stream);
          if (tagCode === 34) {
            var $31 = $29.cxform = {};
            cxform($bytes, $stream, $31, tagCode);
          }
          if ($29.flags & PlaceObjectFlags.HasFilterList) {
            var count = readUi8($bytes, $stream);
            var $2 = $.filters = [];
            var $3 = count;
            while ($3--) {
              var $4 = {};
              anyFilter($bytes, $stream, $4);
              $2.push($4);
            }
          }
          if ($29.flags & PlaceObjectFlags.HasBlendMode) {
            $29.blendMode = readUi8($bytes, $stream);
          }
        }
        characters.push($29);
      } while (!eob);
      if (!!actionOffset) {
        var $56 = $.buttonActions = [];
        while ($stream.pos < tagEnd) {
          var $57 = buttonCondAction($bytes, $stream, tagEnd);
          // Ignore actions that exceed the tag length.
          if ($stream.pos <= tagEnd) {
            $56.push($57);
            $stream.pos = tagEnd;
          }
        }
      }
    }
    return $;
  }

  function defineBinaryData($bytes, $stream, $, swfVersion, tagCode, tagEnd) {
    $ || ($ = {});
    $.id = readUi16($bytes, $stream);
    readUi32($bytes, $stream); // Reserved
    $.data = $bytes.subarray($stream.pos, tagEnd);
    $stream.pos = tagEnd;
    return $;
  }

  export function defineFont($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    $.id = readUi16($bytes, $stream);
    var firstOffset = readUi16($bytes, $stream);
    var glyphCount = $.glyphCount = firstOffset / 2;
    var restOffsets = [];
    var $0 = glyphCount - 1;
    while ($0--) {
      restOffsets.push(readUi16($bytes, $stream));
    }
    $.offsets = [firstOffset].concat(restOffsets);
    var $1 = $.glyphs = [];
    var $2 = glyphCount;
    while ($2--) {
      var $3 = {};
      shape($bytes, $stream, $3, swfVersion, tagCode);
      $1.push($3);
    }
    return $;
  }

  function defineLabel($bytes, $stream, $, swfVersion, tagCode) {
    var eot;
    $ || ($ = {});
    $.id = readUi16($bytes, $stream);
    var $0 = $.bbox = {};
    bbox($bytes, $stream, $0, swfVersion, tagCode);
    $.matrix = matrix($bytes, $stream);
    var glyphBits = $.glyphBits = readUi8($bytes, $stream);
    var advanceBits = $.advanceBits = readUi8($bytes, $stream);
    var $2 = $.records = [];
    do {
      var $3 = {};
      var temp = textRecord($bytes, $stream, $3, swfVersion, tagCode, glyphBits, advanceBits);
      eot = temp.eot;
      $2.push($3);
    } while (!eot);
    return $;
  }

  function defineSound($bytes, $stream, $, swfVersion, tagCode, tagEnd) {
    $ || ($ = {});
    $.id = readUi16($bytes, $stream);
    var soundFlags = readUi8($bytes, $stream);
    $.soundFormat = soundFlags >> 4 & 15;
    $.soundRate = soundFlags >> 2 & 3;
    $.soundSize = soundFlags >> 1 & 1;
    $.soundType = soundFlags & 1;
    $.samplesCount = readUi32($bytes, $stream);
    $.soundData = $bytes.subarray($stream.pos, tagEnd);
    $stream.pos = tagEnd;
    return $;
  }

  function startSound($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    if (tagCode == 15) {
      $.soundId = readUi16($bytes, $stream);
    }
    if (tagCode == 89) {
      $.soundClassName = readString($bytes, $stream, 0);
    }
    $.soundInfo = soundInfo($bytes, $stream);
    return $;
  }

  export function soundStreamHead($bytes, $stream) {
    var $: any = {};
    var playbackFlags = readUi8($bytes, $stream);
    $.playbackRate = playbackFlags >> 2 & 3;
    $.playbackSize = playbackFlags >> 1 & 1;
    $.playbackType = playbackFlags & 1;
    var streamFlags = readUi8($bytes, $stream);
    var streamCompression = $.streamCompression = streamFlags >> 4 & 15;
    $.streamRate = streamFlags >> 2 & 3;
    $.streamSize = streamFlags >> 1 & 1;
    $.streamType = streamFlags & 1;
    $.samplesCount = readUi16($bytes, $stream);
    if (streamCompression == 2) {
      $.latencySeek = readSi16($bytes, $stream);
    }
    return $;
  }

  export function defineBitmap(bytes, stream, $, swfVersion, tagCode: number, tagEnd: number) {
    var tag: any = $ || {};
    tag.id = readUi16(bytes, stream);
    var format = tag.format = readUi8(bytes, stream);
    tag.width = readUi16(bytes, stream);
    tag.height = readUi16(bytes, stream);
    tag.hasAlpha = tagCode === 36;
    if (format === 3) {
      tag.colorTableSize = readUi8(bytes, stream);
    }
    tag.bmpData = bytes.subarray(stream.pos, tagEnd);
    stream.pos = tagEnd;
    return tag;
  }

  function defineText($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    $.id = readUi16($bytes, $stream);
    var $0 = $.bbox = {};
    bbox($bytes, $stream, $0, swfVersion, tagCode);
    var flags = readUi16($bytes, $stream);
    var hasText = $.hasText = flags >> 7 & 1;
    $.wordWrap = flags >> 6 & 1;
    $.multiline = flags >> 5 & 1;
    $.password = flags >> 4 & 1;
    $.readonly = flags >> 3 & 1;
    var hasColor = $.hasColor = flags >> 2 & 1;
    var hasMaxLength = $.hasMaxLength = flags >> 1 & 1;
    var hasFont = $.hasFont = flags & 1;
    var hasFontClass = $.hasFontClass = flags >> 15 & 1;
    $.autoSize = flags >> 14 & 1;
    var hasLayout = $.hasLayout = flags >> 13 & 1;
    $.noSelect = flags >> 12 & 1;
    $.border = flags >> 11 & 1;
    $.wasStatic = flags >> 10 & 1;
    $.html = flags >> 9 & 1;
    $.useOutlines = flags >> 8 & 1;
    if (hasFont) {
      $.fontId = readUi16($bytes, $stream);
    }
    if (hasFontClass) {
      $.fontClass = readString($bytes, $stream, 0);
    }
    if (hasFont) {
      $.fontHeight = readUi16($bytes, $stream);
    }
    if (hasColor) {
      $.color = rgba($bytes, $stream);
    }
    if (hasMaxLength) {
      $.maxLength = readUi16($bytes, $stream);
    }
    if (hasLayout) {
      $.align = readUi8($bytes, $stream);
      $.leftMargin = readUi16($bytes, $stream);
      $.rightMargin = readUi16($bytes, $stream);
      $.indent = readSi16($bytes, $stream);
      $.leading = readSi16($bytes, $stream);
    }
    $.variableName = readString($bytes, $stream, 0);
    if (hasText) {
      $.initialText = readString($bytes, $stream, 0);
    }
    return $;
  }

  export function defineFont2($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    $.id = readUi16($bytes, $stream);
    var hasLayout = $.hasLayout = readUb($bytes, $stream, 1);
    var reserved: any;
    if (swfVersion > 5) {
      $.shiftJis = readUb($bytes, $stream, 1);
    } else {
      reserved = readUb($bytes, $stream, 1);
    }
    $.smallText = readUb($bytes, $stream, 1);
    $.ansi = readUb($bytes, $stream, 1);
    var wideOffset = $.wideOffset = readUb($bytes, $stream, 1);
    var wide = $.wide = readUb($bytes, $stream, 1);
    $.italic = readUb($bytes, $stream, 1);
    $.bold = readUb($bytes, $stream, 1);
    if (swfVersion > 5) {
      $.language = readUi8($bytes, $stream);
    } else {
      reserved = readUi8($bytes, $stream);
      $.language = 0;
    }
    var nameLength = readUi8($bytes, $stream);
    $.name = readString($bytes, $stream, nameLength);
    if (tagCode === 75) {
      $.resolution = 20;
    }
    var glyphCount = $.glyphCount = readUi16($bytes, $stream);
    // The SWF format docs don't say that, but the DefineFont{2,3} tag ends here for device fonts.
    if (glyphCount === 0) {
      return $;
    }
    var startpos = $stream.pos;
    if (wideOffset) {
      var $0 = $.offsets = [];
      var $1 = glyphCount;
      while ($1--) {
        $0.push(readUi32($bytes, $stream));
      }
      $.mapOffset = readUi32($bytes, $stream);
    } else {
      var $2 = $.offsets = [];
      var $3 = glyphCount;
      while ($3--) {
        $2.push(readUi16($bytes, $stream));
      }
      $.mapOffset = readUi16($bytes, $stream);
    }
    var $4 = $.glyphs = [];
    var $5 = glyphCount;
    while ($5--) {
      var $6 = {};
      var dist = $.offsets[glyphCount-$5]+startpos-$stream.pos;
      // when just one byte difference between two offsets, just read that and insert a eos record
      if( dist === 1 ) {
        readUi8($bytes,$stream);
        $4.push({"records":[{"type":0,"eos":true,"hasNewStyles":0,"hasLineStyle":0,"hasFillStyle1":0,"hasFillStyle0":0,"move":0}]});
        continue;
      }
      shape($bytes, $stream, $6, swfVersion, tagCode);
      $4.push($6);
    }
    if (wide) {
      var $47 = $.codes = [];
      var $48 = glyphCount;
      while ($48--) {
        $47.push(readUi16($bytes, $stream));
      }
    } else {
      var $49 = $.codes = [];
      var $50 = glyphCount;
      while ($50--) {
        $49.push(readUi8($bytes, $stream));
      }
    }
    if (hasLayout) {
      $.ascent = readUi16($bytes, $stream);
      $.descent = readUi16($bytes, $stream);
      $.leading = readSi16($bytes, $stream);
      var $51 = $.advance = [];
      var $52 = glyphCount;
      while ($52--) {
        $51.push(readSi16($bytes, $stream));
      }
      var $53 = $.bbox = [];
      var $54 = glyphCount;
      while ($54--) {
        var $55 = {};
        bbox($bytes, $stream, $55, swfVersion, tagCode);
        $53.push($55);
      }
      var kerningCount = readUi16($bytes, $stream);
      var $56 = $.kerning = [];
      var $57 = kerningCount;
      while ($57--) {
        var $58 = {};
        kerning($bytes, $stream, $58, wide);
        $56.push($58);
      }
    }
    return $;
  }

  export function defineFont4($bytes, $stream, $, swfVersion, tagCode, tagEnd) {
    $ || ($ = {});
    $.id = readUi16($bytes, $stream);
    var reserved = readUb($bytes, $stream, 5);
    var hasFontData = $.hasFontData = readUb($bytes, $stream, 1);
    $.italic = readUb($bytes, $stream, 1);
    $.bold = readUb($bytes, $stream, 1);
    $.name = readString($bytes, $stream, 0);
    if (hasFontData) {
      $.data = $bytes.subarray($stream.pos, tagEnd);
      $stream.pos = tagEnd;
    }
    return $;
  }

  function defineScalingGrid($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    $.symbolId = readUi16($bytes, $stream);
    var $0 = $.splitter = {};
    bbox($bytes, $stream, $0, swfVersion, tagCode);
    return $;
  }

  export function defineScene($bytes, $stream, $) {
    $ || ($ = {});
    var sceneCount = readEncodedU32($bytes, $stream);
    var $0 = $.scenes = [];
    var $1 = sceneCount;
    while ($1--) {
      var $2: any = {};
      $2.offset = readEncodedU32($bytes, $stream);
      $2.name = readString($bytes, $stream, 0);
      $0.push($2);
    }
    var labelCount = readEncodedU32($bytes, $stream);
    var $3 = $.labels = [];
    var $4 = labelCount;
    while ($4--) {
      var $5: any = {};
      $5.frame = readEncodedU32($bytes, $stream);
      $5.name = readString($bytes, $stream, 0);
      $3.push($5);
    }
    return $;
  }

  function bbox($bytes, $stream, $, swfVersion, tagCode) {
    align($bytes, $stream);
    var bits = readUb($bytes, $stream, 5);
    var xMin = readSb($bytes, $stream, bits);
    var xMax = readSb($bytes, $stream, bits);
    var yMin = readSb($bytes, $stream, bits);
    var yMax = readSb($bytes, $stream, bits);
    $.xMin = xMin;
    $.xMax = xMax;
    $.yMin = yMin;
    $.yMax = yMax;
    align($bytes, $stream);
  }

  export function rgb($bytes, $stream): number {
    return ((readUi8($bytes, $stream) << 24) | (readUi8($bytes, $stream) <<16) |
            (readUi8($bytes, $stream) << 8) | 0xff) >>> 0;
  }

  function rgba($bytes, $stream): number {
    return (readUi8($bytes, $stream) << 24) | (readUi8($bytes, $stream) << 16) |
           (readUi8($bytes, $stream) << 8) | readUi8($bytes, $stream);
  }

  function argb($bytes, $stream) {
    return readUi8($bytes, $stream) | (readUi8($bytes, $stream) << 24) |
           (readUi8($bytes, $stream) << 16) | (readUi8($bytes, $stream) << 8);
  }

  function matrix($bytes, $stream) {
    var $: any = {};
    align($bytes, $stream);
    var hasScale = readUb($bytes, $stream, 1);
    if (hasScale) {
      var bits = readUb($bytes, $stream, 5);
      $.a = readFb($bytes, $stream, bits);
      $.d = readFb($bytes, $stream, bits);
    }
    else {
      $.a = 1;
      $.d = 1;
    }
    var hasRotate = readUb($bytes, $stream, 1);
    if (hasRotate) {
      var bits = readUb($bytes, $stream, 5);
      $.b = readFb($bytes, $stream, bits);
      $.c = readFb($bytes, $stream, bits);
    }
    else {
      $.b = 0;
      $.c = 0;
    }
    var bits = readUb($bytes, $stream, 5);
    var e = readSb($bytes, $stream, bits);
    var f = readSb($bytes, $stream, bits);
    $.tx = e;
    $.ty = f;
    align($bytes, $stream);
    return $;
  }

  function cxform($bytes, $stream, $, tagCode) {
    align($bytes, $stream);
    var hasOffsets = readUb($bytes, $stream, 1);
    var hasMultipliers = readUb($bytes, $stream, 1);
    var bits = readUb($bytes, $stream, 4);
    if (hasMultipliers) {
      $.redMultiplier = readSb($bytes, $stream, bits);
      $.greenMultiplier = readSb($bytes, $stream, bits);
      $.blueMultiplier = readSb($bytes, $stream, bits);
      if (tagCode > 4) {
        $.alphaMultiplier = readSb($bytes, $stream, bits);
      } else {
        $.alphaMultiplier = 256;
      }
    }
    else {
      $.redMultiplier = 256;
      $.greenMultiplier = 256;
      $.blueMultiplier = 256;
      $.alphaMultiplier = 256;
    }
    if (hasOffsets) {
      $.redOffset = readSb($bytes, $stream, bits);
      $.greenOffset = readSb($bytes, $stream, bits);
      $.blueOffset = readSb($bytes, $stream, bits);
      if (tagCode > 4) {
        $.alphaOffset = readSb($bytes, $stream, bits);
      } else {
        $.alphaOffset = 0;
      }
    }
    else {
      $.redOffset = 0;
      $.greenOffset = 0;
      $.blueOffset = 0;
      $.alphaOffset = 0;
    }
    align($bytes, $stream);
  }

  function gradient($bytes, $stream, $, swfVersion, tagCode, isMorph, type) {
    if (tagCode === 83) {
      $.spreadMode = readUb($bytes, $stream, 2);
      $.interpolationMode = readUb($bytes, $stream, 2);
    }
    else {
      var pad = readUb($bytes, $stream, 4);
    }
    var count = $.count = readUb($bytes, $stream, 4);
    var $130 = $.records = [];
    var $131 = count;
    while ($131--) {
      var $132 = {};
      gradientRecord($bytes, $stream, $132, tagCode, isMorph);
      $130.push($132);
    }
    if (type === 19) {
      $.focalPoint = readSi16($bytes, $stream);
      if (isMorph) {
        $.focalPointMorph = readSi16($bytes, $stream);
      }
    }
  }

  function gradientRecord($bytes, $stream, $, tagCode, isMorph) {
    $.ratio = readUi8($bytes, $stream);
    if (tagCode > 22) {
      $.color = rgba($bytes, $stream);
    }
    else {
      $.color = rgb($bytes, $stream);
    }
    if (isMorph) {
      $.ratioMorph = readUi8($bytes, $stream);
      $.colorMorph = rgba($bytes, $stream);
    }
  }

  function morphShapeWithStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
    var eos: boolean, bits: number, temp: any;
    temp = styles($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
    var lineBits = temp.lineBits;
    var fillBits = temp.fillBits;
    var records = $.records = [];
    do {
      var record = {};
      temp = shapeRecord($bytes, $stream, record, swfVersion, tagCode, isMorph,
                         fillBits, lineBits, hasStrokes, bits);
      eos = temp.eos;
      fillBits = temp.fillBits;
      lineBits = temp.lineBits;
      bits = temp.bits;
      records.push(record);
    } while (!eos);
    temp = styleBits($bytes, $stream);
    var fillBits = temp.fillBits;
    var lineBits = temp.lineBits;
    var recordsMorph = $.recordsMorph = [];
    do {
      var morphRecord = {};
      temp = shapeRecord($bytes, $stream, morphRecord, swfVersion, tagCode, isMorph,
                         fillBits, lineBits, hasStrokes, bits);
      eos = temp.eos;
      fillBits = temp.fillBits;
      lineBits = temp.lineBits;
      bits = temp.bits;
      recordsMorph.push(morphRecord);
    } while (!eos);
  }

  function shapeWithStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
    var eos: boolean, bits: number, temp: any;
    temp = styles($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
    var fillBits = temp.fillBits;
    var lineBits = temp.lineBits;
    var $160 = $.records = [];
    do {
      var $161 = {};
      temp = shapeRecord($bytes, $stream, $161, swfVersion, tagCode, isMorph,
                         fillBits, lineBits, hasStrokes, bits);
      eos = temp.eos;
      fillBits = temp.fillBits;
      lineBits = temp.lineBits;
      bits = temp.bits;
      $160.push($161);
    } while (!eos);
  }

  function shapeRecord($bytes, $stream, $, swfVersion, tagCode, isMorph, fillBits, lineBits,
                       hasStrokes, bits: number) {
    var eos: boolean, temp: any;
    var type = $.type = readUb($bytes, $stream, 1);
    var flags = readUb($bytes, $stream, 5);
    eos = $.eos = !(type || flags);
    if (type) {
      temp = shapeRecordEdge($bytes, $stream, $, flags);
      bits = temp.bits;
    } else {
      temp = shapeRecordSetup($bytes, $stream, $, swfVersion, tagCode, flags, isMorph,
        fillBits, lineBits, hasStrokes, bits);
      fillBits = temp.fillBits;
      lineBits = temp.lineBits;
      bits = temp.bits;
    }
    return {
      type: type,
      flags: flags,
      eos: eos,
      fillBits: fillBits,
      lineBits: lineBits,
      bits: bits
    };
  }

  function shapeRecordEdge($bytes, $stream, $, flags) {
    var bits = (flags & 0x0f) + 2;
    var isStraight = $.isStraight = flags >> 4;
    if (isStraight) {
      var isGeneral = $.isGeneral = readUb($bytes, $stream, 1);
      if (isGeneral) {
        $.deltaX = readSb($bytes, $stream, bits);
        $.deltaY = readSb($bytes, $stream, bits);
      } else {
        var isVertical = $.isVertical = readUb($bytes, $stream, 1);
        if (isVertical) {
          $.deltaY = readSb($bytes, $stream, bits);
        } else {
          $.deltaX = readSb($bytes, $stream, bits);
        }
      }
    } else {
      $.controlDeltaX = readSb($bytes, $stream, bits);
      $.controlDeltaY = readSb($bytes, $stream, bits);
      $.anchorDeltaX = readSb($bytes, $stream, bits);
      $.anchorDeltaY = readSb($bytes, $stream, bits);
    }
    return {bits: bits};
  }

  function shapeRecordSetup($bytes, $stream, $, swfVersion, tagCode, flags, isMorph, fillBits: number, lineBits: number, hasStrokes, bits: number) {
    var hasNewStyles = $.hasNewStyles = tagCode > 2 ? flags >> 4 : 0;
    var hasLineStyle = $.hasLineStyle = flags >> 3 & 1;
    var hasFillStyle1 = $.hasFillStyle1 = flags >> 2 & 1;
    var hasFillStyle0 = $.hasFillStyle0 = flags >> 1 & 1;
    var move = $.move = flags & 1;
    if (move) {
      bits = readUb($bytes, $stream, 5);
      $.moveX = readSb($bytes, $stream, bits);
      $.moveY = readSb($bytes, $stream, bits);
    }
    if (hasFillStyle0) {
      $.fillStyle0 = readUb($bytes, $stream, fillBits);
    }
    if (hasFillStyle1) {
      $.fillStyle1 = readUb($bytes, $stream, fillBits);
    }
    if (hasLineStyle) {
      $.lineStyle = readUb($bytes, $stream, lineBits);
    }
    if (hasNewStyles) {
      var temp = styles($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
      lineBits = temp.lineBits;
      fillBits = temp.fillBits;
    }
    return {
      lineBits: lineBits,
      fillBits: fillBits,
      bits: bits
    };
  }

  function styles($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
    fillStyleArray($bytes, $stream, $, swfVersion, tagCode, isMorph);
    lineStyleArray($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
    var temp = styleBits($bytes, $stream);
    var fillBits = temp.fillBits;
    var lineBits = temp.lineBits;
    return {fillBits: fillBits, lineBits: lineBits};
  }

  function fillStyleArray($bytes, $stream, $, swfVersion, tagCode, isMorph) {
    var count;
    var tmp = readUi8($bytes, $stream);
    if (tagCode > 2 && tmp === 255) {
      count = readUi16($bytes, $stream);
    }
    else {
      count = tmp;
    }
    var $4 = $.fillStyles = [];
    var $5 = count;
    while ($5--) {
      var $6 = {};
      fillStyle($bytes, $stream, $6, swfVersion, tagCode, isMorph);
      $4.push($6);
    }
  }

  function lineStyleArray($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
    var count;
    var tmp = readUi8($bytes, $stream);
    if (tagCode > 2 && tmp === 255) {
      count = readUi16($bytes, $stream);
    } else {
      count = tmp;
    }
    var $138 = $.lineStyles = [];
    var $139 = count;
    while ($139--) {
      var $140 = {};
      lineStyle($bytes, $stream, $140, swfVersion, tagCode, isMorph, hasStrokes);
      $138.push($140);
    }
  }

  function styleBits($bytes, $stream) {
    align($bytes, $stream);
    var fillBits = readUb($bytes, $stream, 4);
    var lineBits = readUb($bytes, $stream, 4);
    return {
      fillBits: fillBits,
      lineBits: lineBits
    };
  }

  function fillStyle($bytes, $stream, $, swfVersion, tagCode, isMorph) {
    var type = $.type = readUi8($bytes, $stream);
    switch (type) {
      case 0:
        $.color = tagCode > 22 || isMorph ? rgba($bytes, $stream) : rgb($bytes, $stream);
        if (isMorph) {
          $.colorMorph = rgba($bytes, $stream);
        }
        break;
      case 16:
      case 18:
      case 19:
        $.matrix = matrix($bytes, $stream);
        if (isMorph) {
          $.matrixMorph = matrix($bytes, $stream);
        }
        gradient($bytes, $stream, $, swfVersion, tagCode, isMorph, type);
        break;
      case 64:
      case 65:
      case 66:
      case 67:
        $.bitmapId = readUi16($bytes, $stream);
        $.condition = type === 64 || type === 67;
        $.matrix = matrix($bytes, $stream);
        if (isMorph) {
          $.matrixMorph = matrix($bytes, $stream);
        }
        break;
      default:
    }
  }

  function lineStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
    $.width = readUi16($bytes, $stream);
    if (isMorph) {
      $.widthMorph = readUi16($bytes, $stream);
    }
    if (hasStrokes) {
      align($bytes, $stream);
      $.startCapsStyle = readUb($bytes, $stream, 2);
      var jointStyle = $.jointStyle = readUb($bytes, $stream, 2);
      var hasFill = $.hasFill = readUb($bytes, $stream, 1);
      $.noHscale = readUb($bytes, $stream, 1);
      $.noVscale = readUb($bytes, $stream, 1);
      $.pixelHinting = readUb($bytes, $stream, 1);
      var reserved = readUb($bytes, $stream, 5);
      $.noClose = readUb($bytes, $stream, 1);
      $.endCapsStyle = readUb($bytes, $stream, 2);
      if (jointStyle === 2) {
        $.miterLimitFactor = readFixed8($bytes, $stream);
      }
      if (hasFill) {
        var $141 = $.fillStyle = {};
        fillStyle($bytes, $stream, $141, swfVersion, tagCode, isMorph);
      } else {
        $.color = rgba($bytes, $stream);
        if (isMorph) {
          $.colorMorph = rgba($bytes, $stream);
        }
      }
    }
    else {
      if (tagCode > 22) {
        $.color = rgba($bytes, $stream);
      } else {
        $.color = rgb($bytes, $stream);
      }
      if (isMorph) {
        $.colorMorph = rgba($bytes, $stream);
      }
    }
  }

  function filterGlow($bytes, $stream, $, type) {
    var count;
    if (type === 4 || type === 7) {
      count = readUi8($bytes, $stream);
    }
    else {
      count = 1;
    }
    var $5 = $.colors = [];
    var $6 = count;
    while ($6--) {
      $5.push(rgba($bytes, $stream));
    }
    if (type === 3) {
      $.hightlightColor = rgba($bytes, $stream);
    }
    if (type === 4 || type === 7) {
      var $9 = $.ratios = [];
      var $10 = count;
      while ($10--) {
        $9.push(readUi8($bytes, $stream));
      }
    }
    $.blurX = readFixed($bytes, $stream);
    $.blurY = readFixed($bytes, $stream);
    if (type !== 2) {
      $.angle = readFixed($bytes, $stream);
      $.distance = readFixed($bytes, $stream);
    }
    $.strength = readFixed8($bytes, $stream);
    $.inner = readUb($bytes, $stream, 1);
    $.knockout = readUb($bytes, $stream, 1);
    $.compositeSource = readUb($bytes, $stream, 1);
    if (type === 3 || type === 4 || type === 7) {
      $.onTop = readUb($bytes, $stream, 1);
      $.quality = readUb($bytes, $stream, 4);
    } else {
      $.quality = readUb($bytes, $stream, 5);
    }
  }

  function filterBlur($bytes, $stream, $) {
    $.blurX = readFixed($bytes, $stream);
    $.blurY = readFixed($bytes, $stream);
    $.quality = readUb($bytes, $stream, 5);
    var reserved = readUb($bytes, $stream, 3);
  }

  function filterConvolution($bytes, $stream, $) {
    var matrixX = $.matrixX = readUi8($bytes, $stream);
    var matrixY = $.matrixY = readUi8($bytes, $stream);
    $.divisor = readFloat($bytes, $stream);
    $.bias = readFloat($bytes, $stream);
    var $17 = $.matrix = [];
    var $18 = matrixX * matrixY;
    while ($18--) {
      $17.push(readFloat($bytes, $stream));
    }
    $.color = rgba($bytes, $stream);
    var reserved = readUb($bytes, $stream, 6);
    $.clamp = readUb($bytes, $stream, 1);
    $.preserveAlpha = readUb($bytes, $stream, 1);
  }

  function filterColorMatrix($bytes, $stream, $) {
    var $20 = $.matrix = [];
    var $21 = 20;
    while ($21--) {
      $20.push(readFloat($bytes, $stream));
    }
  }

  function anyFilter($bytes, $stream, $) {
    var type = $.type = readUi8($bytes, $stream);
    switch (type) {
      case 0:
      case 2:
      case 3:
      case 4:
      case 7:
        filterGlow($bytes, $stream, $, type);
        break;
      case 1:
        filterBlur($bytes, $stream, $);
        break;
      case 5:
        filterConvolution($bytes, $stream, $);
        break;
      case 6:
        filterColorMatrix($bytes, $stream, $);
        break;
      default:
    }
  }

  function events($bytes, $stream, $, swfVersion) {
    var flags = $.flags = swfVersion >= 6 ? readUi32($bytes, $stream) : readUi16($bytes, $stream);
    if (!flags) {
      // `true` means this is the EndOfEvents marker.
      return true;
    }
    // The Construct event is only allowed in 7+. It can't be set in < 6, so mask it out for 6.
    if (swfVersion === 6) {
      flags = flags & ~AVM1ClipEvents.Construct;
    }
    var length = $.length = readUi32($bytes, $stream);
    if (flags & AVM1ClipEvents.KeyPress) {
      $.keyCode = readUi8($bytes, $stream);
      length--;
    }
    var end = $stream.pos + length;
    $.actionsData = $bytes.subarray($stream.pos, end);
    $stream.pos = end;
    return false;
  }

  function kerning($bytes, $stream, $, wide) {
    if (wide) {
      $.code1 = readUi16($bytes, $stream);
      $.code2 = readUi16($bytes, $stream);
    }
    else {
      $.code1 = readUi8($bytes, $stream);
      $.code2 = readUi8($bytes, $stream);
    }
    $.adjustment = readUi16($bytes, $stream);
  }

  function textEntry($bytes, $stream, $, glyphBits, advanceBits) {
    $.glyphIndex = readUb($bytes, $stream, glyphBits);
    $.advance = readSb($bytes, $stream, advanceBits);
  }

  function textRecordSetup($bytes, $stream, $, swfVersion, tagCode, flags) {
    var hasFont = $.hasFont = flags >> 3 & 1;
    var hasColor = $.hasColor = flags >> 2 & 1;
    var hasMoveY = $.hasMoveY = flags >> 1 & 1;
    var hasMoveX = $.hasMoveX = flags & 1;
    if (hasFont) {
      $.fontId = readUi16($bytes, $stream);
    }
    if (hasColor) {
      if (tagCode === 33) {
        $.color = rgba($bytes, $stream);
      } else {
        $.color = rgb($bytes, $stream);
      }
    }
    if (hasMoveX) {
      $.moveX = readSi16($bytes, $stream);
    }
    if (hasMoveY) {
      $.moveY = readSi16($bytes, $stream);
    }
    if (hasFont) {
      $.fontHeight = readUi16($bytes, $stream);
    }
  }

  function textRecord($bytes, $stream, $, swfVersion, tagCode, glyphBits, advanceBits) {
    var glyphCount;
    align($bytes, $stream);
    var flags = readUb($bytes, $stream, 8);
    var eot = $.eot = !flags;
    textRecordSetup($bytes, $stream, $, swfVersion, tagCode, flags);
    if (!eot) {
      var tmp = readUi8($bytes, $stream);
      if (swfVersion > 6) {
        glyphCount = $.glyphCount = tmp;
      } else {
        glyphCount = $.glyphCount = tmp; // & 0x7f;
      }
      var $6 = $.entries = [];
      var $7 = glyphCount;
      while ($7--) {
        var $8 = {};
        textEntry($bytes, $stream, $8, glyphBits, advanceBits);
        $6.push($8);
      }
    }
    return {eot: eot};
  }

  function soundEnvelope($bytes, $stream, $) {
    $.pos44 = readUi32($bytes, $stream);
    $.volumeLeft = readUi16($bytes, $stream);
    $.volumeRight = readUi16($bytes, $stream);
  }

  function soundInfo($bytes, $stream) {
    var $: any = {};
    var reserved = readUb($bytes, $stream, 2);
    $.stop = readUb($bytes, $stream, 1);
    $.noMultiple = readUb($bytes, $stream, 1);
    var hasEnvelope = $.hasEnvelope = readUb($bytes, $stream, 1);
    var hasLoops = $.hasLoops = readUb($bytes, $stream, 1);
    var hasOutPoint = $.hasOutPoint = readUb($bytes, $stream, 1);
    var hasInPoint = $.hasInPoint = readUb($bytes, $stream, 1);
    if (hasInPoint) {
      $.inPoint = readUi32($bytes, $stream);
    }
    if (hasOutPoint) {
      $.outPoint = readUi32($bytes, $stream);
    }
    if (hasLoops) {
      $.loopCount = readUi16($bytes, $stream);
    }
    if (hasEnvelope) {
      var envelopeCount = $.envelopeCount = readUi8($bytes, $stream);
      var $1 = $.envelopes = [];
      var $2 = envelopeCount;
      while ($2--) {
        var $3 = {};
        soundEnvelope($bytes, $stream, $3);
        $1.push($3);
      }
    }
    return $;
  }

  function button($bytes, $stream, $, swfVersion, tagCode) {
    var flags = readUi8($bytes, $stream);
    var eob = $.eob = !flags;
    if (swfVersion >= 8) {
      $.flags = (flags >> 5 & 1 ? PlaceObjectFlags.HasBlendMode : 0) |
                (flags >> 4 & 1 ? PlaceObjectFlags.HasFilterList : 0);
    }
    else {
      $.flags = 0;
    }
    $.stateHitTest = flags >> 3 & 1;
    $.stateDown = flags >> 2 & 1;
    $.stateOver = flags >> 1 & 1;
    $.stateUp = flags & 1;
    if (!eob) {
      $.symbolId = readUi16($bytes, $stream);
      $.depth = readUi16($bytes, $stream);
      $.matrix = matrix($bytes, $stream);
      if (tagCode === SwfTag.CODE_DEFINE_BUTTON2) {
        var $3 = $.cxform = {};
        cxform($bytes, $stream, $3, tagCode);
      }
      if ($.flags & PlaceObjectFlags.HasFilterList) {
        $.filterCount = readUi8($bytes, $stream);
        var $4 = $.filters = {};
        anyFilter($bytes, $stream, $4);
      }
      if ($.flags & PlaceObjectFlags.HasBlendMode) {
        $.blendMode = readUi8($bytes, $stream);
      }
    }
    return {eob: eob};
  }

  function buttonCondAction($bytes, $stream, tagEnd) {
    var tagSize = readUi16($bytes, $stream);
    // If no tagSize is given, read to the tag's end.
    var start = $stream.pos;
    var end = tagSize ? start + tagSize : tagEnd;
    var conditions = readUi16($bytes, $stream);
    $stream.pos = end;
    return {
      // The 7 upper bits hold a key code the button should respond to.
      keyCode: (conditions & 0xfe00) >> 9,
      // The lower 9 bits hold state transition flags. See the enum in AVM1Button for details.
      stateTransitionFlags: conditions & 0x1ff,
      // If no tagSize is given, pass `0` to readBinary.
      actionsData: $bytes.subarray(start, end)
    };
  }

  function shape($bytes, $stream, $, swfVersion, tagCode) {
    var eos: boolean, bits: number, temp: any;
    temp = styleBits($bytes, $stream);
    var fillBits = temp.fillBits;
    var lineBits = temp.lineBits;
    var $4 = $.records = [];
    do {
      var $5 = {};
      var isMorph = false; // FIXME Is this right?
      var hasStrokes = false;  // FIXME Is this right?
      temp = shapeRecord($bytes, $stream, $5, swfVersion, tagCode, isMorph,
        fillBits, lineBits, hasStrokes, bits);
      eos = temp.eos;
      fillBits = temp.fillBits;
      lineBits = temp.lineBits;
      bits = temp.bits;
      $4.push($5);
    } while (!eos);
  }

  export var tagHandlers: any = {
    /* End */                            0: undefined,
    /* ShowFrame */                      1: undefined,
    /* DefineShape */                    2: defineShape,
    /* PlaceObject */                    4: placeObject,
    /* RemoveObject */                   5: removeObject,
    /* DefineBits */                     6: defineImage,
    /* DefineButton */                   7: defineButton,
    /* JPEGTables */                     8: undefined,
    /* SetBackgroundColor */             9: undefined,
    /* DefineFont */                    10: defineFont,
    /* DefineText */                    11: defineLabel,
    /* DoAction */                      12: undefined,
    /* DefineFontInfo */                13: undefined,
    /* DefineSound */                   14: defineSound,
    /* StartSound */                    15: startSound,
    /* DefineButtonSound */             17: undefined,
    /* SoundStreamHead */               18: undefined,
    /* SoundStreamBlock */              19: undefined,
    /* DefineBitsLossless */            20: defineBitmap,
    /* DefineBitsJPEG2 */               21: defineImage,
    /* DefineShape2 */                  22: defineShape,
    /* DefineButtonCxform */            23: undefined,
    /* Protect */                       24: undefined,
    /* PlaceObject2 */                  26: placeObject,
    /* RemoveObject2 */                 28: removeObject,
    /* DefineShape3 */                  32: defineShape,
    /* DefineText2 */                   33: defineLabel,
    /* DefineButton2 */                 34: defineButton,
    /* DefineBitsJPEG3 */               35: defineImage,
    /* DefineBitsLossless2 */           36: defineBitmap,
    /* DefineEditText */                37: defineText,
    /* DefineSprite */                  39: undefined,
    /* FrameLabel */                    43: undefined,
    /* SoundStreamHead2 */              45: undefined,
    /* DefineMorphShape */              46: defineShape,
    /* DefineFont2 */                   48: defineFont2,
    /* ExportAssets */                  56: undefined,
    /* ImportAssets */                  57: undefined,
    /* EnableDebugger */                58: undefined,
    /* DoInitAction */                  59: undefined,
    /* DefineVideoStream */             60: undefined,
    /* VideoFrame */                    61: undefined,
    /* DefineFontInfo2 */               62: undefined,
    /* EnableDebugger2 */               64: undefined,
    /* ScriptLimits */                  65: undefined,
    /* SetTabIndex */                   66: undefined,
    /* FileAttributes */                69: undefined,
    /* PlaceObject3 */                  70: placeObject,
    /* ImportAssets2 */                 71: undefined,
    /* DoABC (undoc) */                 72: undefined,
    /* DefineFontAlignZones */          73: undefined,
    /* CSMTextSettings */               74: undefined,
    /* DefineFont3 */                   75: defineFont2,
    /* SymbolClass */                   76: undefined,
    /* Metadata */                      77: undefined,
    /* DefineScalingGrid */             78: defineScalingGrid,
    /* DoABC */                         82: undefined,
    /* DefineShape4 */                  83: defineShape,
    /* DefineMorphShape2 */             84: defineShape,
    /* DefineSceneAndFrameLabelData */  86: defineScene,
    /* DefineBinaryData */              87: defineBinaryData,
    /* DefineFontName */                88: undefined,
    /* StartSound2 */                   89: startSound,
    /* DefineBitsJPEG4 */               90: defineImage,
    /* DefineFont4 */                   91: defineFont4
  };


  export function readHeader($bytes, $stream) {
    var bits = readUb($bytes, $stream, 5);
    var xMin = readSb($bytes, $stream, bits);
    var xMax = readSb($bytes, $stream, bits);
    var yMin = readSb($bytes, $stream, bits);
    var yMax = readSb($bytes, $stream, bits);
    align($bytes, $stream);
    var frameRateFraction = readUi8($bytes, $stream);
    var frameRate = readUi8($bytes, $stream) + frameRateFraction / 256;
    var frameCount = readUi16($bytes, $stream);
    return {
      frameRate: frameRate,
      frameCount: frameCount,
      bounds: new Shumway.Bounds(xMin, yMin, xMax, yMax)
    };
  }
}
