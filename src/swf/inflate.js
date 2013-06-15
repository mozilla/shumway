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
/*global slice, splice, max, fail, Stream */

var codeLengthOrder = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

var distanceCodes = [];
var distanceExtraBits = [];
for (var i = 0, j = 0, code = 1; i < 30; ++i) {
  distanceCodes[i] = code;
  code += 1 << (distanceExtraBits[i] = ~~((j += (i > 2 ? 1 : 0)) / 2));
}

var bitLengths = [];
for (var i = 0; i < 32; ++i)
  bitLengths[i] = 5;
var fixedDistanceTable = makeHuffmanTable(bitLengths);

var lengthCodes = [];
var lengthExtraBits = [];
for (var i = 0, j = 0, code = 3; i < 29; ++i) {
  lengthCodes[i] = code - (i == 28 ? 1 : 0);
  code += 1 << (lengthExtraBits[i] = ~~(((j += (i > 4 ? 1 : 0)) / 4) % 6));
}

for (var i = 0; i < 288; ++i)
  bitLengths[i] = i < 144 || i > 279 ? 8 : (i < 256 ? 9 : 7);
var fixedLiteralTable = makeHuffmanTable(bitLengths);

function makeHuffmanTable(bitLengths) {
  var maxBits = max.apply(null, bitLengths);
  var numLengths = bitLengths.length;
  var size = 1 << maxBits;
  var codes = new Uint32Array(size);
  for (var code = 0, len = 1, skip = 2; len <= maxBits; code <<= 1, ++len, skip <<= 1) {
    for (var val = 0; val < numLengths; ++val) {
      if (bitLengths[val] === len) {
        var lsb = 0;
        for (var i = 0; i < len; ++i)
          lsb = (lsb * 2) + ((code >> i) & 1);
        for (var i = lsb; i < size; i += skip)
          codes[i] = (len << 16) | val;
        ++code;
      }
    }
  }
  return { codes: codes, maxBits: maxBits };
}

function verifyDeflateHeader(bytes) {
  var header = (bytes[0] << 8) | bytes[1];
  assert((header & 0x0f00) === 0x0800, 'unknown compression method', 'inflate');
  assert((header % 31) === 0, 'bad FCHECK', 'inflate');
  assert(!(header & 0x20), 'FDICT bit set', 'inflate');
}

function createInflatedStream(bytes, outputLength) {
  verifyDeflateHeader(bytes);
  var stream = new Stream(bytes, 2);
  var output = {
    data: new Uint8Array(outputLength),
    available: 0,
    completed: false
  };
  var state = {};
  do {
    inflateBlock(stream, output, state);
  } while (!output.completed && stream.pos < stream.end);
  return new Stream(output.data, 0, output.available);
}

var InflateNoDataError = {};

function inflateBlock(stream, output, state) {
  var header = 'header' in state ? state.header :
    (state.header = readBits(stream.bytes, stream, 3));
  switch (header >> 1) {
  case 0:
    stream.align();
    var pos = stream.pos;
    if (stream.end - pos < 4) {
      throw InflateNoDataError;
    }
    var len = stream.getUint16(pos, true);
    var nlen = stream.getUint16(pos + 2, true);
    assert((~nlen & 0xffff) === len, 'bad uncompressed block length', 'inflate');
    if (stream.end - pos < 4 + len) {
      throw InflateNoDataError;
    }
    var begin = pos + 4;
    var end = stream.pos = begin + len;
    var sbytes = stream.bytes, dbytes = output.data;
    splice.apply(dbytes, [output.available, len].concat(slice.call(sbytes, begin, end)));
    output.available += len;
    break;
  case 1:
    inflate(stream, output, fixedLiteralTable, fixedDistanceTable, state);
    break;
  case 2:
    var distanceTable, literalTable;
    if ('distanceTable' in state) {
      distanceTable = state.distanceTable;
      literalTable = state.literalTable;
    } else {
      var sbytes = stream.bytes;
      var savedBufferPos = stream.pos;
      var savedBitBuffer = stream.bitBuffer;
      var savedBitLength = stream.bitLength;
      var bitLengths = [];
      var numLiteralCodes, numDistanceCodes;
      try  {
        numLiteralCodes = readBits(sbytes, stream, 5) + 257;
        numDistanceCodes = readBits(sbytes, stream, 5) + 1;
        var numCodes = numLiteralCodes + numDistanceCodes;
        var numLengthCodes = readBits(sbytes, stream, 4) + 4;
        for (var i = 0; i < 19; ++i)
          bitLengths[codeLengthOrder[i]] = i < numLengthCodes ? readBits(sbytes, stream, 3) : 0;
        var codeLengthTable = makeHuffmanTable(bitLengths);
        bitLengths = [];
        var i = 0;
        var prev = 0;
        while (i < numCodes) {
          var j = 1;
          var sym = readCode(sbytes, stream, codeLengthTable);
          switch(sym){
          case 16:
            j = readBits(sbytes, stream, 2) + 3;
            sym = prev;
            break;
          case 17:
            j = readBits(sbytes, stream, 3) + 3;
            sym = 0;
            break;
          case 18:
            j = readBits(sbytes, stream, 7) + 11;
            sym = 0;
            break;
          default:
            prev = sym;
          }
          while (j--)
            bitLengths[i++] = sym;
        }
      } catch (e) {
        stream.pos = savedBufferPos;
        stream.bitBuffer = savedBitBuffer;
        stream.bitLength = savedBitLength;
        throw e;
      }
      distanceTable = state.distanceTable = makeHuffmanTable(bitLengths.splice(numLiteralCodes, numDistanceCodes));
      literalTable = state.literalTable = makeHuffmanTable(bitLengths);
    }
    inflate(stream, output, literalTable, distanceTable, state);
    delete state.distanceTable;
    delete state.literalTable;
    break;
  default:
     fail('unknown block type', 'inflate');
  }
  delete state.header;
  output.completed = !!(header & 1);
}
function readBits(bytes, stream, size) {
  var bitBuffer = stream.bitBuffer;
  var bitLength = stream.bitLength;
  if (size > bitLength) {
    var pos = stream.pos;
    var end = stream.end;
    do {
      if (pos >= end) {
        stream.pos = pos;
        stream.bitBuffer = bitBuffer;
        stream.bitLength = bitLength;
        throw InflateNoDataError;
      }
      bitBuffer |= bytes[pos++] << bitLength;
      bitLength += 8;
    } while (size > bitLength);
    stream.pos = pos;
  }
  stream.bitBuffer = bitBuffer >>> size;
  stream.bitLength = bitLength - size;
  return bitBuffer & ((1 << size) - 1);
}
function inflate(stream, output, literalTable, distanceTable, state) {
  var pos = output.available;
  var dbytes = output.data;
  var sbytes = stream.bytes;
  var sym = 'sym' in state ? state.sym :
                             readCode(sbytes, stream, literalTable);
  while (sym !== 256) {
    if (sym < 256) {
      dbytes[pos++] = sym;
    } else {
      state.sym = sym;
      sym -= 257;
      var len = 'len' in state ? state.len :
        (state.len = lengthCodes[sym] + readBits(sbytes, stream, lengthExtraBits[sym]));
      var sym2 = 'sym2' in state ? state.sym2 :
        (state.sym2 = readCode(sbytes, stream, distanceTable));
      var distance = distanceCodes[sym2] + readBits(sbytes, stream, distanceExtraBits[sym2]);
      var i = pos - distance;
      while (len--)
        dbytes[pos++] = dbytes[i++];
      delete state.sym2;
      delete state.len;
      delete state.sym;
    }
    output.available = pos;
    sym = readCode(sbytes, stream, literalTable);
  }
}
function readCode(bytes, stream, codeTable) {
  var bitBuffer = stream.bitBuffer;
  var bitLength = stream.bitLength;
  var maxBits = codeTable.maxBits;
  if (maxBits > bitLength) {
    var pos = stream.pos;
    var end = stream.end;
    do {
      if (pos >= end) {
        stream.pos = pos;
        stream.bitBuffer = bitBuffer;
        stream.bitLength = bitLength;
        throw InflateNoDataError;
      }
      bitBuffer |= bytes[pos++] << bitLength;
      bitLength += 8;
    } while (maxBits > bitLength);
    stream.pos = pos;
  }
  var code = codeTable.codes[bitBuffer & ((1 << maxBits) - 1)];
  var len = code >> 16;
  assert(len, 'bad encoding', 'inflate');
  stream.bitBuffer = bitBuffer >>> len;
  stream.bitLength = bitLength - len;
  return code & 0xffff;
}
