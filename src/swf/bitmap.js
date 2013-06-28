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
/*global createInflatedStream, Blob, fail */

/** @const */ var FORMAT_COLORMAPPED  = 3;
/** @const */ var FORMAT_15BPP        = 4;
/** @const */ var FORMAT_24BPP        = 5;
/** @const */ var FACTOR_5BBP         = 255 / 31;

var crcTable = [];
for (var i = 0; i < 256; i++) {
  var c = i;
  for (var h = 0; h < 8; h++) {
    if (c & 1)
      c = 0xedB88320 ^ ((c >> 1) & 0x7fffffff);
    else
      c = (c >> 1) & 0x7fffffff;
  }
  crcTable[i] = c;
}

function crc32(data, start, end){
  var crc = -1;
  for (var i = start; i < end; i++) {
    var a = (crc ^ data[i]) & 0xff;
    var b = crcTable[a];
    crc = (crc >>> 8) ^ b;
  }
  return crc ^ -1;
}

function createPngChunk(type, data) {
  var chunk = new Uint8Array(12 + data.length);
  var p = 0;

  var len = data.length;
  chunk[p] = len >> 24 & 0xff;
  chunk[p + 1] = len >> 16 & 0xff;
  chunk[p + 2] = len >> 8 & 0xff;
  chunk[p + 3] = len & 0xff;

  chunk[p + 4] = type.charCodeAt(0) & 0xff;
  chunk[p + 5] = type.charCodeAt(1) & 0xff;
  chunk[p + 6] = type.charCodeAt(2) & 0xff;
  chunk[p + 7] = type.charCodeAt(3) & 0xff;

  if (data instanceof Uint8Array)
    chunk.set(data, 8);

  p = 8 + len;

  var crc = crc32(chunk, 4, p);
  chunk[p] = crc >> 24 & 0xff;
  chunk[p + 1] = crc >> 16 & 0xff;
  chunk[p + 2] = crc >> 8 & 0xff;
  chunk[p + 3] = crc & 0xff;

  return chunk;
}

function adler32(data, start, end) {
  var a = 1;
  var b = 0;
  for (var i = start; i < end; ++i) {
    a = (a + (data[i] & 0xff)) % 65521;
    b = (b + a) % 65521;
  }
  return (b << 16) | a;
}

function defineBitmap(tag) {
  var width = tag.width;
  var height = tag.height;
  var hasAlpha = tag.hasAlpha;
  var plte = '';
  var trns = '';
  var literals;

  var bmpData = tag.bmpData;
  switch (tag.format) {
  case FORMAT_COLORMAPPED:
    var colorType = 0x03;
    var bytesPerLine = (width + 3) & ~3;
    var colorTableSize = tag.colorTableSize + 1;
    var paletteSize = colorTableSize * (tag.hasAlpha ? 4 : 3);
    var datalen = paletteSize + (bytesPerLine * height);
    var stream = createInflatedStream(bmpData, datalen);
    var bytes = stream.bytes;
    var pos = 0;

    stream.ensure(paletteSize);
    if (hasAlpha) {
      var palette = new Uint8Array(paletteSize / 4 * 3);
      var pp = 0;
      var alphaValues = new Uint8Array(paletteSize / 4);
      var pa = 0;
      while (pos < paletteSize) {
        palette[pp++] = bytes[pos];
        palette[pp++] = bytes[pos + 1];
        palette[pp++] = bytes[pos + 2];
        alphaValues[pa++] = bytes[pos + 3];
        pos += 4;
      }
      plte = createPngChunk('PLTE', palette);
      trns = createPngChunk('tRNS', alphaValues);
    } else {
      plte = createPngChunk('PLTE', bytes.subarray(pos, pos + paletteSize));
      pos += paletteSize;
    }

    literals = new Uint8Array(width * height + height);
    var pl = 0;

    while (pos < datalen) {
      stream.ensure(bytesPerLine);
      var begin = pos;
      var end = begin + width;
      pl++;
      literals.set(bytes.subarray(begin, end), pl);
      pl += end - begin;
      stream.pos = (pos += bytesPerLine);
    }
    break;
  case FORMAT_15BPP:
    var colorType = 0x02;
    var bytesPerLine = ((width * 2) + 3) & ~3;
    var stream = createInflatedStream(bmpData, bytesPerLine * height);
    var pos = 0;

    literals = new Uint8Array(width * height * 3 + height);
    var pl = 0;

    for (var y = 0; y < height; ++y) {
      pl++;
      stream.ensure(bytesPerLine);
      for (var x = 0; x < width; ++x) {
        var word = stream.getUint16(pos);
        pos += 2;
        // Extracting RGB color components and changing values range
        // from 0..31 to 0..255.
        literals[pl++] = 0 | (FACTOR_5BBP * ((word >> 10) & 0x1f));
        literals[pl++] = 0 | (FACTOR_5BBP * ((word >> 5) & 0x1f));
        literals[pl++] = 0 | (FACTOR_5BBP * (word & 0x1f));
      }
      stream.pos = (pos += bytesPerLine);
    }
    break;
  case FORMAT_24BPP:
    var padding;
    if (hasAlpha) {
      var colorType = 0x06;
      padding = 0;
      literals = new Uint8Array(width * height * 4 + height);
    } else {
      var colorType = 0x02;
      padding = 1;
      literals = new Uint8Array(width * height * 3 + height);
    }
    var bytesPerLine = width * 4;
    var stream = createInflatedStream(bmpData, bytesPerLine * height);
    var bytes = stream.bytes;
    var pos = 0;
    var pl = 0;

    for (var y = 0; y < height; ++y) {
      stream.ensure(bytesPerLine);
      pl++;
      for (var x = 0; x < width; ++x) {
        pos += padding;

        if (hasAlpha) {
          var alpha = bytes[pos];
          if (alpha) {
            var opacity = alpha / 0xff;
            // RGB values are alpha pre-multiplied (per SWF spec).
            literals[pl++] = 0 | (bytes[pos + 1] / opacity);
            literals[pl++] = 0 | (bytes[pos + 2] / opacity);
            literals[pl++] = 0 | (bytes[pos + 3] / opacity);
            literals[pl++] = alpha;
          } else {
            pl += 4;
          }
        } else {
          literals[pl++] = bytes[pos];
          literals[pl++] = bytes[pos + 1];
          literals[pl++] = bytes[pos + 2];
        }

        pos += 4 - padding;
      }
      stream.pos = pos;
    }
    break;
  default:
    fail('invalid format', 'bitmap');
  }

  var ihdr = new Uint8Array([
    width >> 24 & 0xff,
    width >> 16 & 0xff,
    width >> 8 & 0xff,
    width & 0xff,
    height >> 24 & 0xff,
    height >> 16 & 0xff,
    height >> 8 & 0xff,
    height & 0xff,
    0x08, // bit depth
    colorType, // color type
    0x00, // compression method
    0x00, // filter method
    0x00 // interlace method
  ]);

  var len = literals.length;
  var maxBlockLength = 0xFFFF;

  var idat = new Uint8Array(2 + len + Math.ceil(len / maxBlockLength) * 5 + 4);
  var pi = 0;
  idat[pi++] = 0x78; // compression method and flags
  idat[pi++] = 0x9c;  // flags

  var pos = 0;
  while (len > maxBlockLength) {
    idat[pi++] = 0x00;
    idat[pi++] = 0xff;
    idat[pi++] = 0xff;
    idat[pi++] = 0x00;
    idat[pi++] = 0x00;
    idat.set(literals.subarray(pos, pos + maxBlockLength), pi);
    pi += maxBlockLength;
    pos += maxBlockLength;
    len -= maxBlockLength;
  }

  idat[pi++] = 0x01;
  idat[pi++] = len & 0xff;
  idat[pi++] = len >> 8 & 0xff;
  idat[pi++] = (~len & 0xffff) & 0xff;
  idat[pi++] = (~len & 0xffff) >> 8 & 0xff;

  idat.set(literals.subarray(pos), pi);
  pi += literals.length - pos;

  var adler = adler32(literals, 0, literals.length); // checksum
  idat[pi++] = adler >> 24 & 0xff;
  idat[pi++] = adler >> 16 & 0xff;
  idat[pi++] = adler >> 8 & 0xff;
  idat[pi++] = adler & 0xff;

  var chunks = [
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    createPngChunk('IHDR', ihdr),
    plte,
    trns,
    createPngChunk('IDAT', idat),
    createPngChunk('IEND', '')
  ];

  return {
    type: 'image',
    id: tag.id,
    width: width,
    height: height,
    mimeType: 'image/png',
    data: new Blob(chunks, { type: 'image/png' })
  };
}
