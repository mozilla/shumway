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
/*global readUi16, readUb, readUi32, readUi8, readString, readFixed8, readFixed,
         readSb, readFloat, readBinary, align, readSi16, readEncodedU32, readFb
*/

var tagHandler=(function (global) {
  function defineShape($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    $.id = readUi16($bytes, $stream);
    var $0 = $.bbox = {};
    bbox($bytes, $stream, $0, swfVersion, tagCode);
    var isMorph = $.isMorph = tagCode === 46 || tagCode === 84;
    if (isMorph) {
      var $1 = $.bboxMorph = {};
      bbox($bytes, $stream, $1, swfVersion, tagCode);
    }
    var hasStrokes = $.hasStrokes = tagCode === 83 || tagCode === 84;
    if (hasStrokes) {
      var $2 = $.strokeBbox = {};
      bbox($bytes, $stream, $2, swfVersion, tagCode);
      if (isMorph) {
        var $3 = $.strokeBboxMorph = {};
        bbox($bytes, $stream, $3, swfVersion, tagCode);
      }
      var reserved = readUb($bytes, $stream, 5);
      $.fillWinding = readUb($bytes, $stream, 1);
      $.nonScalingStrokes = readUb($bytes, $stream, 1);
      $.scalingStrokes = readUb($bytes, $stream, 1);
    }
    if (isMorph) {
      $.offsetMorph = readUi32($bytes, $stream);
      morphShapeWithStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
    } else {
      shapeWithStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
    }
    return $;
  }
  function placeObject($bytes, $stream, $, swfVersion, tagCode) {
    var flags, hasEvents, clip, hasName, hasRatio, hasCxform, hasMatrix, place;
    var move, hasBackgroundColor, hasVisibility, hasImage, hasClassName, cache;
    var blend, hasFilters, eoe;
    $ || ($ = {});
    if (tagCode > 4) {
      if (tagCode > 26) {
        flags = readUi16($bytes, $stream);
      } else {
        flags = readUi8($bytes, $stream);
      }
      hasEvents = $.hasEvents = flags >> 7 & 1;
      clip = $.clip = flags >> 6 & 1;
      hasName = $.hasName = flags >> 5 & 1;
      hasRatio = $.hasRatio = flags >> 4 & 1;
      hasCxform = $.hasCxform = flags >> 3 & 1;
      hasMatrix = $.hasMatrix = flags >> 2 & 1;
      place = $.place = flags >> 1 & 1;
      move = $.move = flags & 1;
      if (tagCode === 70) {
        hasBackgroundColor = $.hasBackgroundColor = flags >> 15 & 1;
        hasVisibility = $.hasVisibility = flags >> 14 & 1;
        hasImage = $.hasImage = flags >> 12 & 1;
        hasClassName = $.hasClassName = flags >> 11 & 1;
        cache = $.cache = flags >> 10 & 1;
        blend = $.blend = flags >> 9 & 1;
        hasFilters = $.hasFilters = flags >> 8 & 1;
      } else {
        cache = $.cache = 0;
        blend = $.blend = 0;
        hasFilters = $.hasFilters = 0;
      }
      $.depth = readUi16($bytes, $stream);
      if (hasClassName) {
        $.className = readString($bytes, $stream, 0);
      }
      if (place) {
        $.symbolId = readUi16($bytes, $stream);
      }
      if (hasMatrix) {
        var $0 = $.matrix = {};
        matrix($bytes, $stream, $0, swfVersion, tagCode);
      }
      if (hasCxform) {
        var $1 = $.cxform = {};
        cxform($bytes, $stream, $1, swfVersion, tagCode);
      }
      if (hasRatio) {
        $.ratio = readUi16($bytes, $stream);
      }
      if (hasName) {
        $.name = readString($bytes, $stream, 0);
      }
      if (clip) {
        $.clipDepth = readUi16($bytes, $stream);
      }
      if (hasFilters) {
        var count = readUi8($bytes, $stream);
        var $2 = $.filters = [];
        var $3 = count;
        while ($3--) {
          var $4 = {};
          anyFilter($bytes, $stream, $4, swfVersion, tagCode);
          $2.push($4);
        }
      }
      if (blend) {
        $.blendMode = readUi8($bytes, $stream);
      }
      if (cache) {
        $.bmpCache = readUi8($bytes, $stream);
      }
      if (hasEvents) {
        var reserved = readUi16($bytes, $stream);
        if (swfVersion  >= 6) {
          var allFlags = readUi32($bytes, $stream);
        }
        else {
          var allFlags = readUi16($bytes, $stream);
        }
        var $28 = $.events = [];
        do {
          var $29 = {};
          var temp = events($bytes, $stream, $29, swfVersion, tagCode);
          eoe = temp.eoe;
          $28.push($29);
        } while (!eoe);
      }
      if (hasBackgroundColor) {
        var $126 = $.backgroundColor = {};
        argb($bytes, $stream, $126, swfVersion, tagCode);
      }
      if (hasVisibility) {
        $.visibility = readUi8($bytes, $stream);
      }
    } else {
      $.place = 1;
      $.symbolId = readUi16($bytes, $stream);
      $.depth = readUi16($bytes, $stream);
      $.hasMatrix = 1;
      var $30 = $.matrix = {};
      matrix($bytes, $stream, $30, swfVersion, tagCode);
      if ($stream.remaining()) {
        $.hasCxform = 1;
        var $31 = $.cxform = {};
        cxform($bytes, $stream, $31, swfVersion, tagCode);
      }
    }
    return $;
  }
  function removeObject($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    if (tagCode === 5) {
      $.symbolId = readUi16($bytes,$stream);
    }
    $.depth = readUi16($bytes,$stream);
    return $;
  }
  function defineImage($bytes, $stream, $, swfVersion, tagCode) {
    var imgData;
    $ || ($ = {});
    $.id = readUi16($bytes, $stream);
    if (tagCode > 21) {
      var alphaDataOffset = readUi32($bytes, $stream);
      if (tagCode === 90) {
        $.deblock = readFixed8($bytes, $stream);
      }
      imgData = $.imgData = readBinary($bytes, $stream, alphaDataOffset);
      $.alphaData = readBinary($bytes, $stream, 0);
    }
    else {
      imgData = $.imgData = readBinary($bytes, $stream, 0);
    }
    switch(imgData[0]<<8|imgData[1]) {
    case 65496:
    case 65497:
      $.mimeType = "image/jpeg";
      break;
    case 35152:
      $.mimeType = "image/png";
      break;
    case 18249:
      $.mimeType = "image/gif";
      break;
    default:
      $.mimeType = "application/octet-stream";
    }
    if (tagCode === 6) {
      $.incomplete = 1;
    }
    return $;
  }
  function defineButton($bytes, $stream, $, swfVersion, tagCode) {
    var eob, hasFilters, count, blend;
    $ || ($ = {});
    $.id = readUi16($bytes, $stream);
    if (tagCode == 7) {
      var $0 = $.characters = [];
      do {
        var $1 = {};
        var temp = button($bytes, $stream, $1, swfVersion, tagCode);
        eob = temp.eob;
        $0.push($1);
      } while (!eob);
      $.actionsData = readBinary($bytes, $stream, 0);
    }
    else {
      var trackFlags = readUi8($bytes, $stream);
      $.trackAsMenu = trackFlags >> 7 & 1;
      var actionOffset = readUi16($bytes, $stream);
      var $28 = $.characters = [];
      do {
        var $29 = {};
        var flags = readUi8($bytes, $stream);
        var eob = $29.eob = !flags;
        if (swfVersion  >= 8) {
          blend = $29.blend = flags >> 5 & 1;
          hasFilters = $29.hasFilters = flags >> 4 & 1;
        }
        else {
          blend = $29.blend = 0;
          hasFilters = $29.hasFilters = 0;
        }
        $29.stateHitTest = flags >> 3 & 1;
        $29.stateDown = flags >> 2 & 1;
        $29.stateOver = flags >> 1 & 1;
        $29.stateUp = flags & 1;
        if (!eob) {
          $29.symbolId = readUi16($bytes, $stream);
          $29.depth = readUi16($bytes, $stream);
          var $30 = $29.matrix = {};
          matrix($bytes, $stream, $30, swfVersion, tagCode);
          if (tagCode === 34) {
            var $31 = $29.cxform = {};
            cxform($bytes, $stream, $31, swfVersion, tagCode);
          }
          if (hasFilters) {
            var count = readUi8($bytes, $stream);
            var $2 = $.filters = [];
            var $3 = count;
            while ($3--) {
              var $4 = {};
              anyFilter($bytes, $stream, $4, swfVersion, tagCode);
              $2.push($4);
            }
          }
          if (blend) {
            $29.blendMode = readUi8($bytes, $stream);
          }
        }
        $28.push($29);
      } while (!eob);
      if (!!actionOffset) {
        var $56 = $.buttonActions = [];
        do {
          var $57 = {};
          buttonCondAction($bytes, $stream, $57, swfVersion, tagCode);
          $56.push($57);
        } while ($stream.remaining()  >  0);
      }
    }
    return $;
  }
  function defineJPEGTables($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    $.id = 0;
    $.imgData = readBinary($bytes, $stream, 0);
    $.mimeType = "application/octet-stream";
    return $;
  }
  function setBackgroundColor($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    var $0 = $.color = {};
    rgb($bytes, $stream, $0, swfVersion, tagCode);
    return $;
  }
  function defineBinaryData($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    $.id = readUi16($bytes, $stream);
    var reserved = readUi32($bytes, $stream);
    $.data = readBinary($bytes, $stream, 0);
    return $;
  }
  function defineFont($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    $.id = readUi16($bytes, $stream);
    var firstOffset = readUi16($bytes, $stream);
    var glyphCount = $.glyphCount = firstOffset / 2;
    var restOffsets = [];
    var $0 = glyphCount-1;
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
    var $1 = $.matrix = {};
    matrix($bytes, $stream, $1, swfVersion, tagCode);
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
  function doAction($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    if (tagCode === 59) {
      $.spriteId = readUi16($bytes, $stream);
    }
    $.actionsData = readBinary($bytes, $stream, 0);
    return $;
  }
  function defineSound($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    $.id = readUi16($bytes, $stream);
    var soundFlags = readUi8($bytes, $stream);
    $.soundFormat = soundFlags >> 4 & 15;
    $.soundRate = soundFlags >> 2 & 3;
    $.soundSize = soundFlags >> 1 & 1;
    $.soundType = soundFlags & 1;
    $.samplesCount = readUi32($bytes, $stream);
    $.soundData = readBinary($bytes, $stream, 0);
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
    var $0 = $.soundInfo = {};
    soundInfo($bytes, $stream, $0, swfVersion, tagCode);
    return $;
  }
  function soundStreamHead($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    var playbackFlags = readUi8($bytes, $stream);
    $.playbackRate = playbackFlags >> 2 & 3;
    $.playbackSize = playbackFlags >> 1 & 1;
    $.playbackType = playbackFlags & 1;
    var streamFlags = readUi8($bytes, $stream);
    var streamCompression = $.streamCompression = streamFlags >> 4 & 15;
    $.streamRate = streamFlags >> 2 & 3;
    $.streamSize = streamFlags >> 1 & 1;
    $.streamType = streamFlags & 1;
    $.samplesCount = readUi32($bytes, $stream);
    if (streamCompression == 2) {
      $.latencySeek = readSi16($bytes, $stream);
    }
    return $;
  }
  function soundStreamBlock($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    $.data = readBinary($bytes, $stream, 0);
    return $;
  }
  function defineBitmap($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    $.id = readUi16($bytes, $stream);
    var format = $.format = readUi8($bytes, $stream);
    $.width = readUi16($bytes, $stream);
    $.height = readUi16($bytes, $stream);
    $.hasAlpha = tagCode === 36;
    if (format === 3) {
      $.colorTableSize = readUi8($bytes, $stream);
    }
    $.bmpData = readBinary($bytes, $stream, 0);
    return $;
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
      var $1 = $.color = {};
      rgba($bytes, $stream, $1, swfVersion, tagCode);
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
  function frameLabel($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    $.name = readString($bytes, $stream, 0);
    return $;
  }
  function defineFont2($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    $.id = readUi16($bytes, $stream);
    var hasLayout = $.hasLayout = readUb($bytes, $stream, 1);
    if (swfVersion > 5) {
      $.shiftJis = readUb($bytes, $stream, 1);
    }
    else {
      var reserved = readUb($bytes, $stream, 1);
    }
    $.smallText = readUb($bytes, $stream, 1);
    $.ansi = readUb($bytes, $stream, 1);
    var wideOffset = $.wideOffset = readUb($bytes, $stream, 1);
    var wide = $.wide = readUb($bytes, $stream, 1);
    $.italic = readUb($bytes, $stream, 1);
    $.bold = readUb($bytes, $stream, 1);
    if (swfVersion > 5) {
      $.language = readUi8($bytes, $stream);
    }
    else {
      var reserved = readUi8($bytes, $stream);
      $.language = 0;
    }
    var nameLength = readUi8($bytes, $stream);
    $.name = readString($bytes, $stream, nameLength);
    if (tagCode === 75) {
      $.resolution = 20;
    }
    var glyphCount = $.glyphCount = readUi16($bytes, $stream);
    if (wideOffset) {
      var $0 = $.offsets = [];
      var $1 = glyphCount;
      while ($1--) {
        $0.push(readUi32($bytes, $stream));
      }
      $.mapOffset = readUi32($bytes, $stream);
    }
    else {
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
      shape($bytes, $stream, $6, swfVersion, tagCode);
      $4.push($6);
    }
    if (wide) {
      var $47 = $.codes = [];
      var $48 = glyphCount;
      while ($48--) {
        $47.push(readUi16($bytes, $stream));
      }
    }
    else {
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
        kerning($bytes, $stream, $58, swfVersion, tagCode, wide);
        $56.push($58);
      }
    }
    return $;
  }
  function fileAttributes($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    var reserved = readUb($bytes, $stream, 1);
    $.useDirectBlit = readUb($bytes, $stream, 1);
    $.useGpu = readUb($bytes, $stream, 1);
    $.hasMetadata = readUb($bytes, $stream, 1);
    $.doAbc = readUb($bytes, $stream, 1);
    $.noCrossDomainCaching = readUb($bytes, $stream, 1);
    $.relativeUrls = readUb($bytes, $stream, 1);
    $.network = readUb($bytes, $stream, 1);
    var pad = readUb($bytes, $stream, 24);
    return $;
  }
  function doABC($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    if (tagCode === 82) {
      $.flags = readUi32($bytes, $stream);
    }
    else {
      $.flags = 0;
    }
    if (tagCode === 82) {
      $.name = readString($bytes, $stream, 0);
    }
    else {
      $.name = "";
    }
    $.data = readBinary($bytes, $stream, 0);
    return $;
  }
  function exportAssets($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    var exportsCount = readUi16($bytes, $stream);
    var $0 = $.exports = [];
    var $1 = exportsCount;
    while ($1--) {
      var $2 = {};
      $2.symbolId = readUi16($bytes, $stream);
      $2.className = readString($bytes, $stream, 0);
      $0.push($2);
    }
    return $;
  }
  function symbolClass($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    var symbolCount = readUi16($bytes, $stream);
    var $0 = $.exports = [];
    var $1 = symbolCount;
    while ($1--) {
      var $2 = {};
      $2.symbolId = readUi16($bytes, $stream);
      $2.className = readString($bytes, $stream, 0);
      $0.push($2);
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
  function defineScene($bytes, $stream, $, swfVersion, tagCode) {
    $ || ($ = {});
    var sceneCount = readEncodedU32($bytes, $stream);
    var $0 = $.scenes = [];
    var $1 = sceneCount;
    while ($1--) {
      var $2 = {};
      $2.offset = readEncodedU32($bytes, $stream);
      $2.name = readString($bytes, $stream, 0);
      $0.push($2);
    }
    var labelCount = readEncodedU32($bytes, $stream);
    var $3 = $.labels = [];
    var $4 = labelCount;
    while ($4--) {
      var $5 = {};
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
  function rgb($bytes, $stream, $, swfVersion, tagCode) {
    $.red = readUi8($bytes, $stream);
    $.green = readUi8($bytes, $stream);
    $.blue = readUi8($bytes, $stream);
    $.alpha = 255;
    return;
  }
  function rgba($bytes, $stream, $, swfVersion, tagCode) {
    $.red = readUi8($bytes, $stream);
    $.green = readUi8($bytes, $stream);
    $.blue = readUi8($bytes, $stream);
    $.alpha = readUi8($bytes, $stream);
    return;
  }
  function argb($bytes, $stream, $, swfVersion, tagCode) {
    $.alpha = readUi8($bytes, $stream);
    $.red = readUi8($bytes, $stream);
    $.green = readUi8($bytes, $stream);
    $.blue = readUi8($bytes, $stream);
  }
  function fillSolid($bytes, $stream, $, swfVersion, tagCode, isMorph) {
    if (tagCode > 22 || isMorph) {
      var $125 = $.color = {};
      rgba($bytes, $stream, $125, swfVersion, tagCode);
    }
    else {
      var $126 = $.color = {};
      rgb($bytes, $stream, $126, swfVersion, tagCode);
    }
    if (isMorph) {
      var $127 = $.colorMorph = {};
      rgba($bytes, $stream, $127, swfVersion, tagCode);
    }
    return;
  }
  function matrix($bytes, $stream, $, swfVersion, tagCode) {
    align($bytes,$stream);
    var hasScale = readUb($bytes,$stream,1);
    if (hasScale) {
      var bits = readUb($bytes,$stream,5);
      $.a = readFb($bytes,$stream,bits);
      $.d = readFb($bytes,$stream,bits);
    }
    else {
      $.a = 1;
      $.d = 1;
    }
    var hasRotate = readUb($bytes,$stream,1);
    if (hasRotate) {
      var bits = readUb($bytes,$stream,5);
      $.b = readFb($bytes,$stream,bits);
      $.c = readFb($bytes,$stream,bits);
    }
    else {
      $.b = 0;
      $.c = 0;
    }
    var bits = readUb($bytes,$stream,5);
    var e = readSb($bytes,$stream,bits);
    var f = readSb($bytes,$stream,bits);
    $.tx = e;
    $.ty = f;
    align($bytes,$stream);
  }
  function cxform($bytes, $stream, $, swfVersion, tagCode) {
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
  function fillGradient($bytes, $stream, $, swfVersion, tagCode, isMorph, type) {
    var $128 = $.matrix = {};
    matrix($bytes, $stream, $128, swfVersion, tagCode);
    if (isMorph) {
      var $129 = $.matrixMorph = {};
      matrix($bytes, $stream, $129, swfVersion, tagCode);
    }
    gradient($bytes, $stream, $, swfVersion, tagCode, isMorph, type);
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
      gradientRecord($bytes, $stream, $132, swfVersion, tagCode, isMorph);
      $130.push($132);
    }
    if (type === 19) {
      $.focalPoint = readFixed8($bytes, $stream);
      if (isMorph) {
        $.focalPointMorph = readFixed8($bytes, $stream);
      }
    }
  }
  function gradientRecord($bytes, $stream, $, swfVersion, tagCode, isMorph) {
    $.ratio = readUi8($bytes, $stream);
    if (tagCode > 22) {
      var $133 = $.color = {};
      rgba($bytes, $stream, $133, swfVersion, tagCode);
    }
    else {
      var $134 = $.color = {};
      rgb($bytes, $stream, $134, swfVersion, tagCode);
    }
    if (isMorph) {
      $.ratioMorph = readUi8($bytes, $stream);
      var $135 = $.colorMorph = {};
      rgba($bytes, $stream, $135, swfVersion, tagCode);
    }
  }
  function morphShapeWithStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
    var eos, bits;
    var temp = styles($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
    var lineBits = temp.lineBits;
    var fillBits = temp.fillBits;
    var $160 = $.records = [];
    do {
      var $161 = {};
      var temp = shapeRecord($bytes, $stream, $161, swfVersion, tagCode, isMorph,
                             fillBits, lineBits, hasStrokes, bits);
      var eos = temp.eos;
      var flags = temp.flags;
      var type = temp.type;
      var fillBits = temp.fillBits;
      var lineBits = temp.lineBits;
      var bits = temp.bits;
      $160.push($161);
    } while (!eos);
    var temp = styleBits($bytes, $stream, $, swfVersion, tagCode);
    var fillBits = temp.fillBits;
    var lineBits = temp.lineBits;
    var $162 = $.recordsMorph = [];
    do {
      var $163 = {};
      var temp = shapeRecord($bytes, $stream, $163, swfVersion, tagCode, isMorph,
                             fillBits, lineBits, hasStrokes, bits);
      eos = temp.eos;
      var flags = temp.flags;
      var type = temp.type;
      var fillBits = temp.fillBits;
      var lineBits = temp.lineBits;
      bits = temp.bits;
      $162.push($163);
    } while (!eos);
  }
  function shapeWithStyle($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes) {
    var eos;
    var temp = styles($bytes, $stream, $, swfVersion, tagCode, isMorph, hasStrokes);
    var fillBits = temp.fillBits;
    var lineBits = temp.lineBits;
    var $160 = $.records = [];
    do {
      var $161 = {};
      var temp = shapeRecord($bytes, $stream, $161, swfVersion, tagCode, isMorph,
                             fillBits, lineBits, hasStrokes, bits);
      eos = temp.eos;
      var flags = temp.flags;
      var type = temp.type;
      var fillBits = temp.fillBits;
      var lineBits = temp.lineBits;
      var bits = temp.bits;
      $160.push($161);
    } while (!eos);
  }
  function shapeRecord($bytes, $stream, $, swfVersion, tagCode, isMorph,
                       fillBits, lineBits, hasStrokes, bits) {
    var type = $.type = readUb($bytes, $stream, 1);
    var flags = readUb($bytes, $stream, 5);
    var eos = $.eos = !(type  ||  flags);
    if (type) {
      var temp = shapeRecordEdge($bytes, $stream, $, swfVersion, tagCode, flags, bits);
      var bits = temp.bits;
    } else {
      var temp = shapeRecordSetup($bytes, $stream, $, swfVersion, tagCode, flags, isMorph,
                                  fillBits, lineBits, hasStrokes, bits);
      var fillBits = temp.fillBits;
      var lineBits = temp.lineBits;
      var bits = temp.bits;
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
  function shapeRecordEdge($bytes, $stream, $, swfVersion, tagCode, flags, bits) {
    var isStraight = 0, tmp = 0, bits = 0, isGeneral = 0, isVertical = 0;
    isStraight = $.isStraight = flags >> 4;
    tmp = flags & 0x0f;
    bits = tmp + 2;
    if (isStraight) {
      isGeneral = $.isGeneral = readUb($bytes, $stream, 1);
      if (isGeneral) {
        $.deltaX = readSb($bytes, $stream, bits);
        $.deltaY = readSb($bytes, $stream, bits);
      } else {
        isVertical = $.isVertical = readUb($bytes, $stream, 1);
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
  function shapeRecordSetup($bytes, $stream, $, swfVersion, tagCode, flags, isMorph,
                            fillBits, lineBits, hasStrokes, bits) {
    var hasNewStyles = 0, hasLineStyle = 0, hasFillStyle1 = 0;
    var hasFillStyle0 = 0, move = 0;
    if (tagCode  >  2) {
      hasNewStyles = $.hasNewStyles = flags >> 4;
    } else {
      hasNewStyles = $.hasNewStyles = 0;
    }
    hasLineStyle = $.hasLineStyle = flags >> 3 & 1;
    hasFillStyle1 = $.hasFillStyle1 = flags >> 2 & 1;
    hasFillStyle0 = $.hasFillStyle0 = flags >> 1 & 1;
    move = $.move = flags & 1;
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
      var lineBits = temp.lineBits;
      var fillBits = temp.fillBits;
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
    var temp = styleBits($bytes, $stream, $, swfVersion, tagCode);
    var fillBits = temp.fillBits;
    var lineBits = temp.lineBits;
    return {fillBits: fillBits, lineBits: lineBits};
  }
  function fillStyleArray($bytes, $stream, $, swfVersion, tagCode, isMorph) {
    var count;
    var tmp = readUi8($bytes, $stream);
    if (tagCode  >  2  &&  tmp === 255) {
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
    if (tagCode  >  2  &&  tmp === 255) {
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
  function styleBits($bytes, $stream, $, swfVersion, tagCode) {
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
      fillSolid($bytes, $stream, $, swfVersion, tagCode, isMorph);
      break;
    case 16:
    case 18:
    case 19:
      fillGradient($bytes, $stream, $, swfVersion, tagCode, isMorph, type);
      break;
    case 64:
    case 65:
    case 66:
    case 67:
      fillBitmap($bytes, $stream, $, swfVersion, tagCode, isMorph, type);
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
      $.startCapStyle = readUb($bytes, $stream, 2);
      var joinStyle = $.joinStyle = readUb($bytes, $stream, 2);
      var hasFill = $.hasFill = readUb($bytes, $stream, 1);
      $.noHscale = readUb($bytes, $stream, 1);
      $.noVscale = readUb($bytes, $stream, 1);
      $.pixelHinting = readUb($bytes, $stream, 1);
      var reserved = readUb($bytes, $stream, 5);
      $.noClose = readUb($bytes, $stream, 1);
      $.endCapStyle = readUb($bytes, $stream, 2);
      if (joinStyle === 2) {
        $.miterLimitFactor = readFixed8($bytes, $stream);
      }
      if (hasFill) {
        var $141 = $.fillStyle = {};
        fillStyle($bytes, $stream, $141, swfVersion, tagCode, isMorph);
      } else {
        var $155 = $.color = {};
        rgba($bytes, $stream, $155, swfVersion, tagCode);
        if (isMorph) {
          var $156 = $.colorMorph = {};
          rgba($bytes, $stream, $156, swfVersion, tagCode);
        }
      }
    }
    else {
      if (tagCode > 22) {
        var $157 = $.color = {};
        rgba($bytes, $stream, $157, swfVersion, tagCode);
      } else {
        var $158 = $.color = {};
        rgb($bytes, $stream, $158, swfVersion, tagCode);
      }
      if (isMorph) {
        var $159 = $.colorMorph = {};
        rgba($bytes, $stream, $159, swfVersion, tagCode);
      }
    }
  }

  function fillBitmap($bytes, $stream, $, swfVersion, tagCode, isMorph, type) {
    $.bitmapId = readUi16($bytes, $stream);
    var $18 = $.matrix = {};
    matrix($bytes, $stream, $18, swfVersion, tagCode);
    if (isMorph) {
      var $19 = $.matrixMorph = {};
      matrix($bytes, $stream, $19, swfVersion, tagCode);
    }
    $.condition = type === 64 || type === 67;
  }
  function filterGlow($bytes, $stream, $, swfVersion, tagCode, type) {
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
      var $7 = {};
      rgba($bytes, $stream, $7, swfVersion, tagCode);
      $5.push($7);
    }
    if (type === 3) {
      var $8 = $.higlightColor = {};
      rgba($bytes, $stream, $8, swfVersion, tagCode);
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
    $.innerShadow = readUb($bytes, $stream, 1);
    $.knockout = readUb($bytes, $stream, 1);
    $.compositeSource = readUb($bytes, $stream, 1);
    if (type === 3) {
      $.onTop = readUb($bytes, $stream, 1);
    }
    else {
      var reserved = readUb($bytes, $stream, 1);
    }
    if (type === 4 || type === 7) {
      $.passes = readUb($bytes, $stream, 4);
    }
    else {
      var reserved = readUb($bytes, $stream, 4);
    }
  }
  function filterBlur($bytes, $stream, $, swfVersion, tagCode) {
    $.blurX = readFixed($bytes, $stream);
    $.blurY = readFixed($bytes, $stream);
    $.passes = readUb($bytes, $stream, 5);
    var reserved = readUb($bytes, $stream, 3);
  }
  function filterConvolution($bytes, $stream, $, swfVersion, tagCode) {
    var columns = $.columns = readUi8($bytes, $stream);
    var rows = $.rows = readUi8($bytes, $stream);
    $.divisor = readFloat($bytes, $stream);
    $.bias = readFloat($bytes, $stream);
    var $17 = $.weights = [];
    var $18 = columns * rows;
    while ($18--) {
      $17.push(readFloat($bytes, $stream));
    }
    var $19 = $.defaultColor = {};
    rgba($bytes, $stream, $19, swfVersion, tagCode);
    var reserved = readUb($bytes, $stream, 6);
    $.clamp = readUb($bytes, $stream, 1);
    $.preserveAlpha = readUb($bytes, $stream, 1);
  }
  function filterColorMatrix($bytes, $stream, $, swfVersion, tagCode) {
    var $20 = $.matrix = [];
    var $21 = 20;
    while ($21--) {
      $20.push(readFloat($bytes, $stream));
    }
  }
  function anyFilter($bytes, $stream, $, swfVersion, tagCode) {
    var type = $.type = readUi8($bytes, $stream);
    switch(type) {
    case 0:
    case 2:
    case 3:
    case 4:
    case 7:
      filterGlow($bytes, $stream, $, swfVersion, tagCode, type);
      break;
    case 1:
      filterBlur($bytes, $stream, $, swfVersion, tagCode);
      break;
    case 5:
      filterConvolution($bytes, $stream, $, swfVersion, tagCode);
      break;
    case 6:
      filterColorMatrix($bytes, $stream, $, swfVersion, tagCode);
      break;
    default:
    }
  }
  function events($bytes, $stream, $, swfVersion, tagCode) {
    var flags, keyPress;
    if (swfVersion  >= 6) {
      flags = readUi32($bytes, $stream);
    }
    else {
      flags = readUi16($bytes, $stream);
    }
    var eoe = $.eoe = !flags;
    $.onKeyUp = flags >> 7 & 1;
    $.onKeyDown = flags >> 6 & 1;
    $.onMouseUp = flags >> 5 & 1;
    $.onMouseDown = flags >> 4 & 1;
    $.onMouseMove = flags >> 3 & 1;
    $.onUnload = flags >> 2 & 1;
    $.onEnterFrame = flags >> 1 & 1;
    $.onLoad = flags & 1;
    if (swfVersion  >= 6) {
      $.onDragOver = flags >> 15 & 1;
      $.onRollOut = flags >> 14 & 1;
      $.onRollOver = flags >> 13 & 1;
      $.onReleaseOutside = flags >> 12 & 1;
      $.onRelease = flags >> 11 & 1;
      $.onPress = flags >> 10 & 1;
      $.onInitialize = flags >> 9 & 1;
      $.onData = flags >> 8 & 1;
      if (swfVersion  >= 7) {
        $.onConstruct = flags >> 18 & 1;
      } else {
        $.onConstruct = 0;
      }
      keyPress = $.keyPress = flags >> 17 & 1;
      $.onDragOut = flags >> 16 & 1;
    }
    if (!eoe) {
      var length = $.length = readUi32($bytes, $stream);
      if (keyPress) {
        $.keyCode = readUi8($bytes, $stream);
      }
      $.actionsData = readBinary($bytes, $stream, length - (keyPress ? 1 : 0));
    }
    return {eoe: eoe};
  }
  function kerning($bytes, $stream, $, swfVersion, tagCode, wide) {
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
  function textEntry($bytes, $stream, $, swfVersion, tagCode, glyphBits, advanceBits) {
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
        var $4 = $.color = {};
        rgba($bytes, $stream, $4, swfVersion, tagCode);
      } else {
        var $5 = $.color = {};
        rgb($bytes, $stream, $5, swfVersion, tagCode);
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
        glyphCount = $.glyphCount = tmp & 0x7f;
      }
      var $6 = $.entries = [];
      var $7 = glyphCount;
      while ($7--) {
        var $8 = {};
        textEntry($bytes, $stream, $8, swfVersion, tagCode, glyphBits, advanceBits);
        $6.push($8);
      }
    }
    return {eot: eot};
  }
  function soundEnvelope($bytes, $stream, $, swfVersion, tagCode) {
    $.pos44 = readUi32($bytes, $stream);
    $.volumeLeft = readUi16($bytes, $stream);
    $.volumeRight = readUi16($bytes, $stream);
  }
  function soundInfo($bytes, $stream, $, swfVersion, tagCode) {
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
        soundEnvelope($bytes, $stream, $3, swfVersion, tagCode);
        $1.push($3);
      }
    }
  }
  function button($bytes, $stream, $, swfVersion, tagCode) {
    var hasFilters, blend;
    var flags = readUi8($bytes, $stream);
    var eob = $.eob = !flags;
    if (swfVersion  >= 8) {
      blend = $.blend = flags >> 5 & 1;
      hasFilters = $.hasFilters = flags >> 4 & 1;
    }
    else {
      blend = $.blend = 0;
      hasFilters = $.hasFilters = 0;
    }
    $.stateHitTest = flags >> 3 & 1;
    $.stateDown = flags >> 2 & 1;
    $.stateOver = flags >> 1 & 1;
    $.stateUp = flags & 1;
    if (!eob) {
      $.symbolId = readUi16($bytes, $stream);
      $.depth = readUi16($bytes, $stream);
      var $2 = $.matrix = {};
      matrix($bytes, $stream, $2, swfVersion, tagCode);
      if (tagCode === 34) {
        var $3 = $.cxform = {};
        cxform($bytes, $stream, $3, swfVersion, tagCode);
      }
      if (hasFilters) {
        $.filterCount = readUi8($bytes, $stream);
        var $4 = $.filters = {};
        anyFilter($bytes, $stream, $4, swfVersion, tagCode);
      }
      if (blend) {
        $.blendMode = readUi8($bytes, $stream);
      }
    }
    return {eob: eob};
  }
  function buttonCondAction($bytes, $stream, $, swfVersion, tagCode) {
    var buttonCondSize = readUi16($bytes, $stream);
    var buttonConditions = readUi16($bytes, $stream);
    $.idleToOverDown = buttonConditions >> 7 & 1;
    $.outDownToIdle = buttonConditions >> 6 & 1;
    $.outDownToOverDown = buttonConditions >> 5 & 1;
    $.overDownToOutDown = buttonConditions >> 4 & 1;
    $.overDownToOverUp = buttonConditions >> 3 & 1;
    $.overUpToOverDown = buttonConditions >> 2 & 1;
    $.overUpToIdle = buttonConditions >> 1 & 1;
    $.idleToOverUp = buttonConditions & 1;
    $.mouseEventFlags = buttonConditions & 511;
    $.keyPress = buttonConditions >> 9 & 127;
    $.overDownToIdle = buttonConditions  >> 8  & 1;
    if (! buttonCondSize) {
      $.actionsData = readBinary($bytes, $stream, 0);
    } else {
      $.actionsData = readBinary($bytes, $stream, buttonCondSize - 4);
    }
  }
  function shape($bytes, $stream, $, swfVersion, tagCode) {
    var eos;
    var temp = styleBits($bytes, $stream, $, swfVersion, tagCode);
    var fillBits = temp.fillBits;
    var lineBits = temp.lineBits;
    var $4 = $.records = [];
    do {
      var $5 = {};
      var isMorph = false; // FIXME Is this right?
      var hasStrokes = false;  // FIXME Is this right?
      var temp = shapeRecord($bytes, $stream, $5, swfVersion, tagCode, isMorph,
                             fillBits, lineBits, hasStrokes, bits);
      eos = temp.eos;
      var fillBits = temp.fillBits;
      var lineBits = temp.lineBits;
      var bits = bits;
      $4.push($5);
    } while (!eos);
  }
  return {
    /* End */                            0: undefined,
    /* ShowFrame */                      1: undefined,
    /* DefineShape */                    2: defineShape,
    /* PlaceObject */                    4: placeObject,
    /* RemoveObject */                   5: removeObject,
    /* DefineBits */                     6: defineImage,
    /* DefineButton */                   7: defineButton,
    /* JPEGTables */                     8: defineJPEGTables,
    /* SetBackgroundColor */             9: setBackgroundColor,
    /* DefineFont */                    10: defineFont,
    /* DefineText */                    11: defineLabel,
    /* DoAction */                      12: doAction,
    /* DefineFontInfo */                13: undefined,
    /* DefineSound */                   14: defineSound,
    /* StartSound */                    15: startSound,
    /* DefineButtonSound */             17: undefined,
    /* SoundStreamHead */               18: soundStreamHead,
    /* SoundStreamBlock */              19: soundStreamBlock,
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
    /* FrameLabel */                    43: frameLabel,
    /* SoundStreamHead2 */              45: soundStreamHead,
    /* DefineMorphShape */              46: defineShape,
    /* DefineFont2 */                   48: defineFont2,
    /* ExportAssets */                  56: exportAssets,
    /* ImportAssets */                  57: undefined,
    /* EnableDebugger */                58: undefined,
    /* DoInitAction */                  59: doAction,
    /* DefineVideoStream */             60: undefined,
    /* VideoFrame */                    61: undefined,
    /* DefineFontInfo2 */               62: undefined,
    /* EnableDebugger2 */               64: undefined,
    /* ScriptLimits */                  65: undefined,
    /* SetTabIndex */                   66: undefined,
    /* FileAttributes */                69: fileAttributes,
    /* PlaceObject3 */                  70: placeObject,
    /* ImportAssets2 */                 71: undefined,
    /* DoABC (undoc) */                 72: doABC,
    /* DefineFontAlignZones */          73: undefined,
    /* CSMTextSettings */               74: undefined,
    /* DefineFont3 */                   75: defineFont2,
    /* SymbolClass */                   76: symbolClass,
    /* Metadata */                      77: undefined,
    /* DefineScalingGrid */             78: defineScalingGrid,
    /* DoABC */                         82: doABC,
    /* DefineShape4 */                  83: defineShape,
    /* DefineMorphShape2 */             84: defineShape,
    /* DefineSceneAndFrameLabelData */  86: defineScene,
    /* DefineBinaryData */              87: defineBinaryData,
    /* DefineFontName */                88: undefined,
    /* StartSound2 */                   89: startSound,
    /* DefineBitsJPEG4 */               90: defineImage,
    /* DefineFont4 */                   91: undefined
  };
})(this);

var readHeader = function readHeader($bytes, $stream, $, swfVersion, tagCode) {
  $ || ($ = {});
  var $0 = $.bbox = {};
  align($bytes, $stream);
  var bits = readUb($bytes, $stream, 5);
  var xMin = readSb($bytes, $stream, bits);
  var xMax = readSb($bytes, $stream, bits);
  var yMin = readSb($bytes, $stream, bits);
  var yMax = readSb($bytes, $stream, bits);
  $0.xMin = xMin;
  $0.xMax = xMax;
  $0.yMin = yMin;
  $0.yMax = yMax;
  align($bytes, $stream);
  var frameRateFraction = readUi8($bytes, $stream);
  $.frameRate = readUi8($bytes, $stream) + frameRateFraction/256;
  $.frameCount = readUi16($bytes, $stream);
  return $;
};
