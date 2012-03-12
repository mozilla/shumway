/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

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
function inflateBlock(sbytes, sstream, dbytes, dstream) {
  var header = readBits(sbytes, sstream, 3);
  switch (header >> 1) {
  case 0:
    sstream.align();
    var pos = sstream.pos;
    var len = sstream.getUint16(pos, true);
    var nlen = sstream.getUint16(pos + 2, true);
    assert((~nlen & 0xffff) === len, 'bad uncompressed block length', 'inflate');
    var begin = pos + 4;
    var end = sstream.pos = begin + len;
    splice.apply(dbytes, [dstream.realLength, len].concat(slice.call(sbytes, begin, end)));
    dstream.realLength += len;
    break;
  case 1:
    inflate(sbytes, sstream, dbytes, dstream, fixedLiteralTable, fixedDistanceTable);
    break;
  case 2:
    var bitLengths = [];
    var numLiteralCodes = readBits(sbytes, sstream, 5) + 257;
    var numDistanceCodes = readBits(sbytes, sstream, 5) + 1;
    var numCodes = numLiteralCodes + numDistanceCodes;
    var numLengthCodes = readBits(sbytes, sstream, 4) + 4;
    for (var i = 0; i < 19; ++i)
      bitLengths[codeLengthOrder[i]] = i < numLengthCodes ? readBits(sbytes, sstream, 3) : 0;
    var codeLengthTable = makeHuffmanTable(bitLengths);
    bitLengths = [];
    var i = 0;
    var prev = 0;
    while (i < numCodes) {
      var j = 1;
      var sym = readCode(sbytes, sstream, codeLengthTable);
      switch(sym){
      case 16:
        j = readBits(sbytes, sstream, 2) + 3;
        sym = prev;
        break;
      case 17:
        j = readBits(sbytes, sstream, 3) + 3;
        sym = 0;
        break;
      case 18:
        j = readBits(sbytes, sstream, 7) + 11;
        sym = 0;
        break;
      default:
        prev = sym;
      }
      while (j--)
        bitLengths[i++] = sym;
    }
    var distanceTable = makeHuffmanTable(bitLengths.splice(numLiteralCodes, numDistanceCodes));
    var literalTable = makeHuffmanTable(bitLengths);
    inflate(sbytes, sstream, dbytes, dstream, literalTable, distanceTable);
    break;
  default:
     fail('unknown block type', 'inflate');
  }
}
function readBits(bytes, stream, size) {
  var buffer = stream.bitBuffer;
  var bufflen = stream.bitLength;
  while (size > bufflen) {
    buffer |= bytes[stream.pos++] << bufflen;
    bufflen += 8;
  }
  stream.bitBuffer = buffer >>> size;
  stream.bitLength = bufflen - size;
  return buffer & ((1 << size) - 1);
}
function inflate(sbytes, sstream, dbytes, dstream, literalTable, distanceTable) {
  var pos = dstream.realLength;
  var sym;
  while ((sym = readCode(sbytes, sstream, literalTable)) !== 256) {
    if (sym < 256) {
      dbytes[pos++] = sym;
    } else {
      sym -= 257;
      var len = lengthCodes[sym] + readBits(sbytes, sstream, lengthExtraBits[sym]);
      sym = readCode(sbytes, sstream, distanceTable);
      var distance = distanceCodes[sym] + readBits(sbytes, sstream, distanceExtraBits[sym]);
      var i = pos - distance;
      while (len--)
        dbytes[pos++] = dbytes[i++];
    }
  }
  dstream.realLength = pos;
}
function readCode(bytes, stream, codeTable) {
  var buffer = stream.bitBuffer;
  var bitlen = stream.bitLength;
  var maxBits = codeTable.maxBits;
  while (maxBits > bitlen) {
    buffer |= bytes[stream.pos++] << bitlen;
    bitlen += 8;
  }
  var code = codeTable.codes[buffer & ((1 << maxBits) - 1)];
  var len = code >> 16;
  assert(len, 'bad encoding', 'inflate');
  stream.bitBuffer = buffer >>> len;
  stream.bitLength = bitlen - len;
  return code & 0xffff;
}
