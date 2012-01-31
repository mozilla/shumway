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
var fixedDistanceTable = buildHuffmanTable(bitLengths);

var lengthCodes = [];
var lengthExtraBits = [];
for (var i = 0, j = 0, code = 3; i < 29; ++i) {
  lengthCodes[i] = code - (i == 28 ? 1 : 0);
  code += 1 << (lengthExtraBits[i] = ~~(((j += (i > 4 ? 1 : 0)) / 4) % 6));
}

for (var i = 0; i < 287; ++i)
  bitLengths[i] = i < 144 || i > 279 ? 8 : (i < 256 ? 9 : 7);
var fixedLiteralTable = buildHuffmanTable(bitLengths);

function buildHuffmanTable(bitLengths) {
  var maxBits = max.apply(null, bitLengths);
  var numLengths = bitLengths.length;
  var size = 1 << maxBits;
  var table = new Uint32Array(size);
  for (var code = 0, len = 1, skip = 2; len <= maxBits; code <<= 1, ++len, skip <<= 1) {
    for (var i = 0; i < numLengths; ++i) {
      if (bitLengths[i] === len) {
        var lsb = 0;
        for (var j = 0; j < len; ++j)
          lsb = (lsb * 2) + ((code >> j) & 1);
        for (var k = lsb; k < size; k += skip)
          table[k] = (len << 16) | i;
        ++code;
      }
    }
  }
  return { entries: table, maxBits: maxBits };
}
function inflateBlock(bytes, stream, output) {
  var hdr = readBits(bytes, stream, 3);
  switch (hdr >> 1) {
  case 0:
    stream.bitBuffer = stream.bitLength = 0;
    var pos = stream.pos;
    var len = stream.getUint16(pos);
    var nlen = stream.getUint16(pos + 2);
    if ((~nlen & 0xffff) !== len)
      fail('bad uncompressed block length', 'inflate');
    var begin = pos + 4;
    var end = stream.pos = begin + len;
    push.apply(output, bytes.subarray(begin, end));
    break;
  case 1:
    inflate(bytes, stream, output, fixedLiteralTable, fixedDistanceTable);
    break;
  case 2:
    var bitLengths = [];
    var numLiteralCodes = readBits(bytes, stream, 5) + 257;
    var numDistanceCodes = readBits(bytes, stream, 5) + 1;
    var numCodes = numLiteralCodes + numDistanceCodes;
    var numLengthCodes = readBits(bytes, stream, 4) + 4;
    for (var i = 0; i < 19; ++i)
      bitLengths[codeLengthOrder[i]] = i < numLengthCodes ? readBits(bytes, stream, 3) : 0;
    var codeLengthTable = buildHuffmanTable(bitLengths);
    bitLengths = [];
    var i = 0;
    var prev = 0;
    while (i < numCodes) {
      var j = 1;
      var sym = decode(bytes, stream, codeLengthTable);
      switch(sym){
      case 16:
        j = readBits(bytes, stream, 2) + 3;
        sym = prev;
        break;
      case 17:
        j = readBits(bytes, stream, 3) + 3;
        sym = 0;
        break;
      case 18:
        j = readBits(bytes, stream, 7) + 11;
        sym = 0;
        break;
      default:
        prev = sym;
      }
      while (j--)
        bitLengths[i++] = sym;
    }
    var distanceTable = buildHuffmanTable(bitLengths.splice(numLiteralCodes, numDistanceCodes));
    var literalTable = buildHuffmanTable(bitLengths);
    inflate(bytes, stream, output, literalTable, distanceTable);
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
function inflate(bytes, stream, output, literalTable, distanceTable) {
  var pos = output.length;
  var sym;
  while ((sym = decode(bytes, stream, literalTable)) !== 256) {
    if (sym < 256) {
      output[pos++] = sym;
    } else {
      sym -= 257;
      var len = lengthCodes[sym] + readBits(bytes, stream, lengthExtraBits[sym]);
      sym = decode(bytes, stream, distanceTable);
      var distance = distanceCodes[sym] + readBits(bytes, stream, distanceExtraBits[sym]);
      var i = pos - distance;
      while (len--)
        output[pos++] = output[i++];
    }
  }
}
function decode(bytes, stream, codeTable) {
  var buffer = stream.bitBuffer;
  var bitlen = stream.bitLength;
  var maxBits = codeTable.maxBits;
  while (maxBits > bitlen) {
    buffer |= bytes[stream.pos++] << bitlen;
    bitlen += 8;
  }
  var code = codeTable.entries[buffer & ((1 << maxBits) - 1)];
  var len = code >> 16;
  if (!len)
    fail('bad encoding', 'inflate');
  stream.bitBuffer = buffer >>> len;
  stream.bitLength = bitlen - len;
  return code & 0xffff;
}
