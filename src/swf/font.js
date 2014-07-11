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
/*global max, min, logE, pow, fromCharCode, keys */

var nextFontId = 1;


function maxPower2(num) {
  var maxPower = 0;
  var val = num;
  while (val >= 2) {
    val /= 2;
    ++maxPower;
  }
  return pow(2, maxPower);
}
function toString16(val) {
  return fromCharCode((val >> 8) & 0xff, val & 0xff);
}
function toString32(val) {
  return toString16(val >> 16) + toString16(val);
}

function defineFont(tag, dictionary) {
  // Ignoring "['glyf'] is better written in dot notation"
  /*jshint -W069 */

  var tables = { };
  var codes = [];
  var glyphIndex = { };
  var ranges = [];

  var glyphs;
  var glyphCount;
  var originalCode;
  var generateAdvancement = tag['advance'] === undefined;
  var correction = 0;
  var isFont3 = (tag.code === 75);


  if(generateAdvancement) tag.advance = [];

  var maxCode = Math.max.apply(null,tag.codes) || 35;

  if (tag.codes) {
    for (var i = 0, code; i<tag.codes.length; i++) {
      var code = tag.codes[i];
      if( code < 32 ) {
        maxCode++;
        if(maxCode == 8232) maxCode = 8240;
        code = maxCode;
      }

      codes.push(code);



    }
  }

  originalCode = codes.concat();

  tag.glyphCount = tag.glyphs.length;
  glyphs = tag.glyphs;
  glyphCount = glyphs.length;

  if (tag.codes) {
    for (var i = 0, code; i<codes.length; i++) {
      code=codes[i];
      glyphIndex[code] = i;
    }
    codes.sort(function(a, b) {
      return a - b;
    });
    var i = 0;
    var code;
    while (code = codes[i++]) {
      var start = code;
      var end = start;
      var indices = [i - 1];
      while ((code = codes[i]) && end + 1 === code) {
        ++end;
        indices.push(i);
        ++i;
      }
      ranges.push([start, end, indices]);
    }
  } else {
    var indices = [];
    var UAC_OFFSET = 0xe000;
    for (var i = 0; i < glyphCount; i++) {
      var code = UAC_OFFSET + i;
      codes.push(code);
      glyphIndex[code] = i;
      indices.push(i);
    }
    ranges.push([UAC_OFFSET, UAC_OFFSET + glyphCount - 1, indices]);
  }

  var resolution = tag.resolution || 20;
  var ascent = Math.ceil(tag.ascent / resolution) || 1024;
  var descent = -Math.ceil(tag.descent / resolution) || 0;
  var leading = (tag.leading / resolution) || 0;
  tables['OS/2'] ='';

  var startCount = '';
  var endCount = '';
  var idDelta = '';
  var idRangeOffset = '';
  var i = 0;
  var range;
  while ((range = ranges[i++])) {
    var start = range[0];
    var end = range[1];
    var code = range[2][0];
    startCount += toString16(start);
    endCount += toString16(end);
    idDelta += toString16(((code - start) + 1) & 0xffff);
    idRangeOffset += toString16(0);
  }
  endCount += '\xff\xff';
  startCount += '\xff\xff';
  idDelta += '\x00\x01';
  idRangeOffset += '\x00\x00';
  var segCount = ranges.length + 1;
  var searchRange = maxPower2(segCount) * 2;
  var rangeShift = (2 * segCount) - searchRange;
  var format314 =
    '\x00\x00' + // language
    toString16(segCount * 2) + // segCountX2
    toString16(searchRange) +
    toString16(logE(segCount) / logE(2)) + // entrySelector
    toString16(rangeShift) +
    endCount +
    '\x00\x00' + // reservedPad
    startCount +
    idDelta +
    idRangeOffset
  ;
  tables['cmap'] =
    '\x00\x00' + // version
    '\x00\x01' +  // numTables
    '\x00\x03' + // platformID
    '\x00\x01' + // encodingID
    '\x00\x00\x00\x0c' + // offset
    '\x00\x04' + // format
    toString16(format314.length + 4) + // length
    format314
  ;

  var glyf = '\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x31\x00';
  var loca = '\x00\x00';
  var offset = 16;
  var maxPoints = 0;
  var xMins = [];
  var xMaxs = [];
  var yMins = [];
  var yMaxs = [];
  var maxContours = 0;
  var i = 0;
  var code;
  var rawData = {};
  while ( code = codes[i++] ) {
    var glyph = glyphs[glyphIndex[code]];
    var records = glyph.records;
    var x = 0;
    var y = 0;

    var myFlags = '',
        myEndpts = '',
        endPoint = 0,
        segments = [],
        segmentIndex = -1;

    for(j=0; j<records.length; j++) {
      record = records[j];
      if (record.type) {
        if (record.isStraight) {
            segments[segmentIndex].commands.push(2);
            var dx = (record.deltaX || 0) / resolution;
            var dy = -(record.deltaY || 0) / resolution;
            x += dx;
            y += dy;
            segments[segmentIndex].data.push(x,y);
            segments[segmentIndex].nodes.push(x,y);
        } else {
          segments[segmentIndex].commands.push(3);
          var cx = record.controlDeltaX / resolution;
          var cy = -record.controlDeltaY / resolution;
          x += cx;
          y += cy;
          segments[segmentIndex].data.push(x,y);
          var dx = record.anchorDeltaX / resolution;
          var dy = -record.anchorDeltaY / resolution;
          x += dx;
          y += dy;
          segments[segmentIndex].data.push(x,y);
          segments[segmentIndex].nodes.push(x,y);
        }
      } else {
        if (record.eos)
          break;
        if (record.move) {
          segmentIndex++;
          segments[segmentIndex] = { data:[], commands:[], nodes:[], xMin:0, xMax:0, yMin:0, yMax:0 };
          segments[segmentIndex].commands.push(1);
          var moveX = record.moveX / resolution;
          var moveY = -record.moveY / resolution;
          var dx = moveX - x;
          var dy = moveY - y;
          x = moveX;
          y = moveY;
          segments[segmentIndex].data.push(x,y);
          segments[segmentIndex].nodes.push(x,y);
        }
      }

      if(segmentIndex > -1 ) {
        if(segments[segmentIndex].xMin > x) segments[segmentIndex].xMin = x;
        if(segments[segmentIndex].yMin > y) segments[segmentIndex].yMin = y;
        if(segments[segmentIndex].xMax < x) segments[segmentIndex].xMax = x;
        if(segments[segmentIndex].yMax < y) segments[segmentIndex].yMax = y;
      }
    }

    if(!isFont3) {
      segments.sort(function(a,b){
        return (b.xMax - b.xMin) * (b.yMax - b.yMin) - (a.xMax - a.xMin) * (a.yMax - a.yMin);
      });
    }

    rawData[code] = segments;
  }
  var xTranslate = 0, yTranslate = 0;

  i=0;
  while ( code = codes[i++] ) {
    var glyph = glyphs[glyphIndex[code]];
    var records = glyph.records;
    var segments = rawData[code];
    var numberOfContours = 1;
    var endPoint = 0;
    var endPtsOfContours = '';
    var flags = '';
    var xCoordinates = '';
    var yCoordinates = '';
    var x = 0;
    var y = 0;
    var xMin = 1024;
    var xMax = -1024;
    var yMin = 1024;
    var yMax = -1024;

    var myFlags = '',
        myEndpts = '',
        endPoint = 0,
        segmentIndex = -1;

    var data=[],commands=[];

    var flip = (isFont3) ? 1 : -1;

    for(j=0;j<segments.length;j++){
      data = data.concat(segments[j].data);
      commands = commands.concat(segments[j].commands);
    }

    x=0;y=0;
    var nx=0,ny=0,
        myXCoordinates='',
        myYCoordinates='',
        dataIndex = 0,
        endPoint = 0,
        numberOfContours = 1,
        myEndpts = '';
    for(j=0;j<commands.length;j++) {
      var command = commands[j];
      if( command === 1 ) {
        if (endPoint) {
          ++numberOfContours;
          myEndpts += toString16(endPoint - 1);
        }
        nx = data[dataIndex++] + xTranslate;
        ny = flip*data[dataIndex++] + yTranslate;
        var dx = nx - x;
        var dy = ny - y;
        myFlags += '\x01';
        myXCoordinates += toString16(dx);
        myYCoordinates += toString16(dy);
        x = nx;
        y = ny;
      } else if( command === 2 ){
        nx = data[dataIndex++] + xTranslate;
        ny = flip*data[dataIndex++] + yTranslate;
        var dx = nx - x;
        var dy = ny - y;
        myFlags += '\x01';
        myXCoordinates += toString16(dx);
        myYCoordinates += toString16(dy);
        x = nx;
        y = ny;
      } else if( command === 3 ){
          nx = data[dataIndex++] + xTranslate;
          ny = flip*data[dataIndex++] + yTranslate;
          var cx = nx - x;
          var cy = ny - y;
          myFlags += '\x00';
          myXCoordinates += toString16(cx);
          myYCoordinates += toString16(cy);
          x = nx;
          y = ny;
          endPoint++;

          nx = data[dataIndex++] + xTranslate;
          ny = flip*data[dataIndex++] + yTranslate;
          var cx = nx - x;
          var cy = ny - y;
          myFlags += '\x01';
          myXCoordinates += toString16(cx);
          myYCoordinates += toString16(cy);
          x = nx;
          y = ny;
      }
      endPoint++;
      if (endPoint > maxPoints)
        maxPoints = endPoint;

      if( xMin > x ) xMin = x;
      if( yMin > y ) yMin = y;
      if( xMax < x ) xMax = x;
      if( yMax < y ) yMax = y;

    }
    myEndpts += toString16((endPoint || 1) - 1);

    endPtsOfContours = myEndpts;
    xCoordinates = myXCoordinates;
    yCoordinates = myYCoordinates;
    flags = myFlags;

    yMax += yTranslate;

    if (!j) {
      xMin = xMax = yMin = yMax = 0;
      flags += '\x31';
    }
    var entry =
      toString16(numberOfContours) +
      toString16(xMin) +
      toString16(yMin) +
      toString16(xMax) +
      toString16(yMax) +
      endPtsOfContours +
      '\x00\x00' + // instructionLength
      flags +
      xCoordinates +
      yCoordinates
    ;
    if (entry.length & 1)
      entry += '\x00';
    glyf += entry;
    loca += toString16(offset / 2);
    offset += entry.length;
    xMins.push(xMin);
    xMaxs.push(xMax);
    yMins.push(yMin);
    yMaxs.push(yMax);
    if (numberOfContours > maxContours)
      maxContours = numberOfContours;
    if (endPoint > maxPoints)
      maxPoints = endPoint;

    if(generateAdvancement) {
      tag.advance.push((xMax - xMin) * resolution * 1.3);
    }
  }
  loca += toString16(offset / 2);
  tables['glyf'] = glyf;

  if(!isFont3) {
    var minYmin = Math.min.apply(null,yMins);
    if(minYmin < 0) {
      descent = descent || minYmin;
    }
  }

  tables['OS/2'] =
    '\x00\x01' + // version
    '\x00\x00' + // xAvgCharWidth
    toString16(tag.bold ? 700 : 400) + // usWeightClass
    '\x00\x05' + // usWidthClass
    '\x00\x00' + // fstype
    '\x00\x00' + // ySubscriptXSize
    '\x00\x00' + // ySubscriptYSize
    '\x00\x00' + // ySubscriptXOffset
    '\x00\x00' + // ySubscriptYOffset
    '\x00\x00' + // ySuperScriptXSize
    '\x00\x00' + // ySuperScriptYSize
    '\x00\x00' + // ySuperScriptXOffset
    '\x00\x00' + // ySuperScriptYOffset
    '\x00\x00' + // yStrikeoutSize
    '\x00\x00' + // yStrikeoutPosition
    '\x00\x00' + // sFamilyClass
    '\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00' + // panose
    '\x00\x00\x00\x00' + // ulUnicodeRange1
    '\x00\x00\x00\x00' + // ulUnicodeRange2
    '\x00\x00\x00\x00' + // ulUnicodeRange3
    '\x00\x00\x00\x00' + // ulUnicodeRange4
    'ALF ' + // achVendID
    toString16((tag.italic ? 0x01 : 0) | (tag.bold ? 0x20: 0)) + // fsSelection
    toString16(codes[0]) + // usFirstCharIndex
    toString16(codes[codes.length - 1]) + // usLastCharIndex
    toString16(ascent) + // sTypoAscender
    toString16(descent) + // sTypoDescender
    toString16(leading) + // sTypoLineGap
    toString16(ascent) + // usWinAscent
    toString16(-descent) + // usWinDescent
    '\x00\x00\x00\x00' + // ulCodePageRange1
    '\x00\x00\x00\x00' // ulCodePageRange2
  ;

  tables['head'] =
    '\x00\x01\x00\x00' + // version
    '\x00\x01\x00\x00' + // fontRevision
    '\x00\x00\x00\x00' + // checkSumAdjustement
    '\x5f\x0f\x3c\xf5' + // magicNumber
    '\x00\x0b' + // flags
    '\x04\x00' + // unitsPerEm
    '\x00\x00\x00\x00' + toString32(Date.now()) + // created
    '\x00\x00\x00\x00' + toString32(Date.now()) + // modified
    toString16(min.apply(null, xMins)) + // xMin
    toString16(min.apply(null, yMins)) + // yMin
    toString16(max.apply(null, xMaxs)) + // xMax
    toString16(max.apply(null, yMaxs)) + // yMax
    toString16((tag.italic ? 2 : 0) | (tag.bold ? 1 : 0)) + // macStyle
    '\x00\x08' + // lowestRecPPEM
    '\x00\x02' + // fontDirectionHint
    '\x00\x00' + // indexToLocFormat
    '\x00\x00' // glyphDataFormat
  ;

  var advance = tag.advance;
  tables['hhea'] =
    '\x00\x01\x00\x00' + // version
    toString16(ascent) + // ascender
    toString16(descent) + // descender
    toString16(leading) + // lineGap
    toString16(advance ? max.apply(null, advance) : 1024) + // advanceWidthMax
    '\x00\x00' + // minLeftSidebearing
    '\x00\x00' + // minRightSidebearing
    '\x03\xb8' + // xMaxExtent
    '\x00\x01' + // caretSlopeRise
    '\x00\x00' + // caretSlopeRun
    '\x00\x00' + // caretOffset
    '\x00\x00' + // reserved
    '\x00\x00' + // reserved
    '\x00\x00' + // reserved
    '\x00\x00' + // reserved
    '\x00\x00' + // metricDataFormat
    toString16(glyphCount + 1) // numberOfHMetrics
  ;

  var hmtx = '\x00\x00\x00\x00';
  for (var i = 0; i < glyphCount; ++i)
    hmtx += toString16(advance ? (advance[i] / resolution) : 1024) + '\x00\x00';
  tables['hmtx'] = hmtx;

  if (tag.kerning) {
    var kerning = tag.kerning;
    var nPairs = kerning.length;
    var searchRange = maxPower2(nPairs) * 2;
    var kern =
      '\x00\x00' + // version
      '\x00\x01' + // nTables
      '\x00\x00' + // subtable version
      toString16(14 + (nPairs * 6)) + // length
      '\x00\x01' + // coverage
      toString16(nPairs) +
      toString16(searchRange) +
      toString16(logE(nPairs) / logE(2)) + // entrySelector
      toString16((2 * nPairs) - searchRange) // rangeShift
    ;
    var i = 0;
    var record;
    while ((record = kerning[i++])) {
      kern +=
        toString16(glyphIndex[record.code1]) + // left
        toString16(glyphIndex[record.code2]) + // right
        toString16(record.adjustment) // value
      ;
    }
    tables['kern'] = kern;
  }

  tables['loca'] = loca;

  tables['maxp'] =
    '\x00\x01\x00\x00' + // version
    toString16(glyphCount + 1) + // numGlyphs
    toString16(maxPoints) +
    toString16(maxContours) +
    '\x00\x00' + // maxCompositePoints
    '\x00\x00' + // maxCompositeContours
    '\x00\x00' + // maxZones
    '\x00\x00' + // maxTwilightPoints
    '\x00\x00' + // maxStorage
    '\x00\x00' + // maxFunctionDefs
    '\x00\x00' + // maxInstructionDefs
    '\x00\x00' + // maxStackElements
    '\x00\x00' + // maxSizeOfInstructions
    '\x00\x00' + // maxComponentElements
    '\x00\x00' // maxComponentDepth
  ;

  var uniqueId = 'swf-font-' + nextFontId++;
  var fontName = tag.name || uniqueId;
  var psName = fontName.replace(/ /g, '');
  var strings = [
    tag.copyright || 'Original licence', // 0. Copyright
    fontName, // 1. Font family
    'Unknown', // 2. Font subfamily
    uniqueId, // 3. Unique ID
    fontName, // 4. Full font name
    '1.0', // 5. Version
    psName, // 6. Postscript name
    'Unknown', // 7. Trademark
    'Unknown', // 8. Manufacturer
    'Unknown' // 9. Designer
  ];
  var count = strings.length;
  var name =
    '\x00\x00' + // format
    toString16(count) + // count
    toString16((count * 12) + 6); // stringOffset
  var offset = 0;
  var i = 0;
  var str;
  while ((str = strings[i++])) {
    name +=
      '\x00\x01' + // platformID
      '\x00\x00' + // encodingID
      '\x00\x00' + // languageID
      toString16(i - 1) + // nameID
      toString16(str.length) +
      toString16(offset);
      offset += str.length;
  }
  tables['name'] = name + strings.join('');

  tables['post'] =
    '\x00\x03\x00\x00' + // version
    '\x00\x00\x00\x00' + // italicAngle
    '\x00\x00' + // underlinePosition
    '\x00\x00' + // underlineThickness
    '\x00\x00\x00\x00' + // isFixedPitch
    '\x00\x00\x00\x00' + // minMemType42
    '\x00\x00\x00\x00' + // maxMemType42
    '\x00\x00\x00\x00' + // minMemType1
    '\x00\x00\x00\x00' // maxMemType1
  ;

  var names = keys(tables);
  var numTables = names.length;
  var header =
    '\x00\x01\x00\x00' + // version
    toString16(numTables) +
    '\x00\x80' + // searchRange
    '\x00\x03' + // entrySelector
    '\x00\x20' // rangeShift
  ;
  var data = '';
  var offset = (numTables * 16) + header.length;
  var i = 0;
  var name;
  while ((name = names[i++])) {
    var table = tables[name];
    var length = table.length;
    header +=
      name +
      '\x00\x00\x00\x00' + // checkSum
      toString32(offset) +
      toString32(length)
    ;
    while (length & 3) {
      table += '\x00';
      ++length;
    }
    data += table;
    while (offset & 3)
      ++offset;
    offset += length;
  }
  var otf = header + data;
  var unitPerEm = 1024;
  var metrics = {
    ascent: ascent / unitPerEm,
    descent: -descent / unitPerEm,
    leading: leading / unitPerEm
  };

  return {
    type: 'font',
    id: tag.id,
    name: fontName,
    uniqueName: psName + uniqueId,
    codes: originalCode,
    metrics: metrics,
    bold: tag.bold === 1,
    italic: tag.italic === 1,
    data: otf
  };
}
