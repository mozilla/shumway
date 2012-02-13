/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function toString16(val) {
  return fromCharCode((val >> 8) & 0xff, val & 0xff);
}
function toString32(val) {
  return toString16(val >> 16) + toString16(val);
}
function maxPower2(number) {
  var maxPower = 0;
  var val = number;
  while (val >= 2) {
    val /= 2;
    ++maxPower;
  }
  val = 2;
  for (var i = 1; i < maxPower; ++i)
    val *= 2;
  return val;
}

function defineFont(graph) {
  var tables = { };

  var glyphCount = graph.glyphCount;
  var codes = graph.codes.slice();
  var glyphIndex = { };
  for (var i = 0, code; code = codes[i]; ++i)
    glyphIndex[code] = i;
  codes.sort(function(a, b) {
    return a - b;
  });
  var usFirstCharIndex = codes[0];
  var usLastCharIndex = codes[codes.length - 1];
  var ranges = [];
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

  tables['OS/2'] =
    '\x00\x01' + // version
    '\x00\x00' + // xAvgCharWidth
    toString16(graph.bold ? 700 : 400) + // usWeightClass
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
    '\x4d\x4f\x5a\x21' + // achVendID
    toString16((graph.italic ? 0x01 : 0) | (graph.bold ? 0x20: 0)) + // fsSelection
    toString16(usFirstCharIndex) +
    toString16(usLastCharIndex) +
    toString16(graph.ascent || 1024) + // sTypoAscender
    toString16(graph.descent || 1024) + // sTypoDescender
    '\x00\x00' + // sTypoLineGap
    toString16(graph.ascent || 1024) + // usWinAscent
    toString16(graph.descent || 1024) + // usWinDescent
    '\x00\x00\x00\x00' + // ulCodePageRange1
    '\x00\x00\x00\x00' // ulCodePageRange2
  ;

  var startCount = '';
  var endCount = '';
  var idDelta = '';
  var idRangeOffset = '';
  var i = 0;
  var range;
  while (range = ranges[i++]) {
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
    toString16(Math.log(segCount) / Math.log(2)) + // entrySelector
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

  var xMins = [];
  var xMaxs = [];
  var yMins = [];
  var yMaxs = [];
  var maxPoints = 0;
  var maxContours = 0;

  var glyf = '\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x31\x00';
  var loca = '\x00\x00';
  var glyphs = graph.glyphs;
  var resolution = graph.resolution;
  var offset = 16;
  var i = 0;
  var code;
  while (code = codes[i++]) {
    var glyph = glyphs[glyphIndex[code]];
    var records = glyph.records;
    var numberOfContours = 1;
    var endPoint = 0;
    var endPtsOfContours = '';
    var x = 0;
    var y = 0;
    var xMin = 1024;
    var xMax = -1024;
    var yMin = 1024;
    var yMax = -1024;
    var flags = '';
    var xCoordinates = '';
    var yCoordinates = '';
    for (var j = 0, record; record = records[j]; ++j) {
      if (record.type) {
        if (record.isStraight) {
          if (record.isGeneral) {
            flags += '\x01';
            var dx = record.deltaX/ resolution;
            var dy = -record.deltaY/ resolution;
            xCoordinates += toString16(dx);
            yCoordinates += toString16(dy);
            x += dx;
            y += dy;
          } else if (record.isVertical) {
            flags += '\x11';
            var dy = -record.deltaY/ resolution;
            yCoordinates += toString16(dy);
            y += dy;
          } else {
            flags += '\x21';
            var dx = record.deltaX/ resolution;
            xCoordinates += toString16(dx);
            x += dx;
          }
        } else {
          flags += '\x00';
          var cx = record.controlDeltaX/ resolution;
          var cy = -record.controlDeltaY/ resolution;
          xCoordinates += toString16(cx);
          yCoordinates += toString16(cy);
          flags += '\x01';
          var dx = record.anchorDeltaX/ resolution;
          var dy = -record.anchorDeltaY/ resolution;
          xCoordinates += toString16(dx);
          yCoordinates += toString16(dy);
          ++endPoint;
          x += cx + dx;
          y += cy + dy;
        }
      } else {
        if (record.eos)
          break;
        if (record.move) {
          if (endPoint) {
            ++numberOfContours;
            endPtsOfContours += toString16(endPoint - 1);
          }
          flags += '\x01';
          var moveX = record.moveX/ resolution;
          var moveY = -record.moveY/ resolution;
          var dx = moveX - x;
          var dy = moveY - y;
          xCoordinates += toString16(dx);
          yCoordinates += toString16(dy);
          x = moveX;
          y = moveY;
          if (endPoint > maxPoints)
            maxPoints = endPoint;
        }
      }
      if (x < xMin)
        xMin = x;
      if (x > xMax)
        xMax = x;
      if (y < yMin)
        yMin = y;
      if (y > yMax)
        yMax = y;
      ++endPoint;
    }
    endPtsOfContours += toString16((endPoint || 1) - 1);
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
  }
  loca += toString16(offset / 2);
  tables['glyf'] = glyf;

  tables['head'] =
    '\x00\x01\x00\x00' + // version
    '\x00\x01\x00\x00' + // fontRevision
    '\x00\x00\x00\x00' + // checkSumAdjustement
    '\x5f\x0f\x3c\xf5' + // magicNumber
    '\x00\x0b' + // flags
    '\x04\x00' + // unitsPerEm
    '\x00\x00\x00\x00' + toString32(+new Date()) + // created
    '\x00\x00\x00\x00' + toString32(+new Date()) + // modified
    toString16(min.apply(null, xMins)) + // xMin
    toString16(min.apply(null, yMins)) + // yMin
    toString16(max.apply(null, xMaxs)) + // xMax
    toString16(max.apply(null, yMaxs)) + // yMax
    toString16((graph.italic ? 2 : 0) | (graph.bold ? 1 : 0)) + // macStyle
    '\x00\x08' + // lowestRecPPEM
    '\x00\x02' + // fontDirectionHint
    '\x00\x00' + // indexToLocFormat
    '\x00\x00' // glyphDataFormat
  ;

  var advance = graph.advance;

  tables['hhea'] =
    '\x00\x01\x00\x00' + // version
    toString16(graph.ascent || 1024) + // ascender
    toString16(graph.descent || 1024) + // descender
    '\x00\x00' + // lineGap
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
    hmtx += toString16(advance ? advance[i] : 1024) + '\x00\x00';
  tables['hmtx'] = hmtx;

  if (graph.kerning) {
    var kerning = graph.kerning;
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
      toString16(Math.log(nPairs) / Math.log(2)) + // entrySelector
      toString16((2 * nPairs) - searchRange) // rangeShift
    ;
    var i = 0;
    var record;
    while (record = kerning[i++]) {
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

  var strings = [
    graph.copyright || 'Unknown', // 0. Copyright
    graph.name, // 1. Font family
    'Unknown', // 2. Font subfamily
    graph.id, // 3. Unique ID
    graph.name, // 4. Full font name
    '1.0', // 5. Version
    graph.name.replace(/ /g, ''), // 6. Postscript name
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
  while (str = strings[i++]) {
    name +=
      '\x00\x01' + // platformID
      '\x00\x00' + // encodingID
      '\x00\x00' + // languageID
      toString16(i - 1) + // nameID
      toString16(str.length) +
      toString16(offset);
      offset += str.length;
    ;
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

  var tags = keys(tables);
  var header =
    '\x00\x01\x00\x00' + // version
    toString16(tags.length) + // numTables
    '\x00\x80' + // searchRange
    '\x00\x03' + // entrySelector
    '\x00\x20' // rangeShift
  ;
  var offset = (tags.length * 16) + header.length;
  var data = '';
  var i = 0;
  var tag;
  while (tag = tags[i++]) {
    var table = tables[tag];
    var length = table.length;
    var checksum = 0, n = length;
    header +=
      tag +
      '\x00\x00\x00\x00' +
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

  return header + data;
}
