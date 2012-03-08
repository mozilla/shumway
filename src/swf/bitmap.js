/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

/** @const */ var FORMAT_COLORMAPPED  = 3;
/** @const */ var FORMAT_15BPP        = 4;
/** @const */ var FORMAT_24BPP        = 5;

function defineBitmap(tag) {
  var bmpData = tag.bmpData;
  var width = tag.width;
  var height = tag.height;
  var plte = '';
  var trns = '';
  var literals = '';
  switch (tag.format) {
  case FORMAT_COLORMAPPED:
    var colorType = '\x03';
    var pixelCount = width * height;
    var colorTableSize = tag.colorTableSize;
    var paletteSize = colorTableSize * (tag.tag === 36 ? 4 : 3);
    var stream = new Stream(bmpData, 0, paletteSize + pixelCount, 'C');
    var bytes = stream.bytes;
    var pos = 0;

    var palette = '';
    stream.ensure(paletteSize);
    if (tag.tag === 36) {
      var alphaValues = '';
      while (pos < colorTableSize) {
        palette += fromCharCode(bytes[pos++], bytes[pos++], bytes[pos++]);
        alphaValues += fromCharCode(bytes[pos++]);
      }
      trns = createPngChunk('tRNS', alphaValues);
    } else {
      while (pos < colorTableSize)
        palette += fromCharCode(bytes[pos++], bytes[pos++], bytes[pos++]);
    }
    plte = createPngChunk('PLTE', palette);

    for (var i = 0; i < height; ++i) {
      stream.ensure(width);
      var begin = pos;
      var end = begin + width;
      var scanline = slice.call(bytes, begin, end);
      literals += '\x00' + fromCharCode.apply(null, scanline);
      pos += width;
    }
    break;
  case FORMAT_15BPP:
    var colorType = '\x02';
    var bytesPerLine = width * 2;
    var stream = new Stream(bmpData, 0, bytesPerLine * height, 'C');
    var bytes = stream.bytes;
    var pos = 0;
    for (var y = 0; y < height; ++y) {
      literals += '\x00';
      stream.ensure(bytesPerLine);
      for (var x = 0; x < width; ++x) {
        var hi = bytes[pos++];
        var lo = bytes[pos++];
        literals += fromCharCode((hi >> 2) & 0x05, ((hi & 0x02) << 3) | (hi & 0x02), lo & 0x05);
      }
      pos += ((bytesPerLine + 3) & ~3) - bytesPerLine;
    }
    break;
  case FORMAT_24BPP:
    var colorType = '\x06';
    var bytesPerLine = width * 4;
    var stream = new Stream(bmpData, 0, bytesPerLine * height, 'C');
    var bytes = stream.bytes;
    var pos = 0;
    for (var y = 0; y < height; ++y) {
      stream.ensure(bytesPerLine);
      literals += '\x00';
      for (var x = 0; x < width; ++x) {
        var alpha = bytes[pos++];
        literals += fromCharCode(bytes[pos++], bytes[pos++], bytes[pos++], alpha);
      }
      pos += ((bytesPerLine + 3) & ~3) - bytesPerLine;
    }
    break;
  }

  var ihdr =
    toString32(width) +
    toString32(height) +
    '\x08' + // bit depth
    colorType + // color type
    '\x00' + // compression method
    '\x00' + // filter method
    '\x00' // interlace method
  ;

  var len = literals.length;
  var nlen = ~len & 0xffff;
  var idat =
    '\x78' + // compression method and flags
    '\x9c' + // flags
    '\x01' + // block header
    toString16Le(len) +
    toString16Le(nlen) +
    literals +
    '\x00\x00\x00\x00' // checksum
  ;

  var data =
    '\x89\x50\x4e\x47\x0d\x0a\x1a\x0a' + // signature
    createPngChunk('IHDR', ihdr) +
    plte +
    trns +
    createPngChunk('IDAT', idat) +
    createPngChunk('IEND', '')
  ;
  return {
    type: 'image',
    id: tag.id,
    mimeType: 'image/png',
    data: data
  };
}
