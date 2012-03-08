/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

/** @const */ var FORMAT_COLORMAPPED  = 3;
/** @const */ var FORMAT_15BPP        = 4;
/** @const */ var FORMAT_24BPP        = 5;

function rgbToString(bytes, pos) {
  var red = bytes[pos];
  var green = bytes[pos + 1];
  var blue = bytes[pos + 2];
  return fromCharCode(red, green, blue);
}
function argbToString(bytes, pos) {
  var alpha = bytes[pos];
  return rgbToString(bytes, pos + 1) + fromCharCode(alpha);
}

function defineBitmap(tag) {
  var width = tag.width;
  var height = tag.height;
  var hasAlpha = tag.hasAlpha;
  var plte = '';
  var trns = '';
  var literals = '';

  var bmpData = tag.bmpData;
  switch (tag.format) {
  case FORMAT_COLORMAPPED:
    var colorType = '\x03';
    var bytesPerLine = width + (width % 4);
    var colorTableSize = tag.colorTableSize;
    var paletteSize = colorTableSize * (tag.hasAlpha ? 4 : 3);
    var stream = new Stream(bmpData, 0, paletteSize + (bytesPerLine * height), 'C');
    var bytes = stream.bytes;
    var pos = 0;

    var palette = '';
    stream.ensure(paletteSize);
    if (hasAlpha) {
      var alphaValues = '';
      while (pos < colorTableSize) {
        palette += rgbToString(bytes, pos);
        pos += 3;
        alphaValues += fromCharCode(bytes[pos++]);
      }
      trns = createPngChunk('tRNS', alphaValues);
    } else {
      while (pos < colorTableSize) {
        palette += rgbToString(bytes, pos);
        pos += 3;
      }
    }
    plte = createPngChunk('PLTE', palette);

    for (var i = 0; i < height; ++i) {
      stream.ensure(bytesPerLine);
      var begin = pos;
      var end = begin + width;
      var scanline = slice.call(bytes, begin, end);
      literals += '\x00' + fromCharCode.apply(null, scanline);
      pos += bytesPerLine;
    }
    break;
  case FORMAT_15BPP:
    var colorType = '\x02';
    var bytesPerLine = (width * 2) + ((width * 2) % 4);
    var stream = new Stream(bmpData, 0, bytesPerLine * height, 'C');
    var pos = 0;
    for (var y = 0; y < height; ++y) {
      literals += '\x00';
      stream.ensure(bytesPerLine);
      for (var x = 0; x < width; ++x) {
        var word = stream.getUint16(pos);
        pos += 2;
        var red = (word >> 10) & 0x0;
        var green = (word >> 5) & 0x05;
        var blue = word & 0x05;
        literals += fromCharCode(red, green, blue);
      }
      pos += bytesPerLine;
    }
    break;
  case FORMAT_24BPP:
    if (hasAlpha) {
      var colorType = '\x06';
      var padding = 0;
      var pxToString = argbToString;
    } else {
      var colorType = '\x02';
      var padding = 1;
      var pxToString = rgbToString;
    }
    var bytesPerLine = width * 4;
    var stream = new Stream(bmpData, 0, bytesPerLine * height, 'C');
    var pos = 0;
    for (var y = 0; y < height; ++y) {
      stream.ensure(bytesPerLine);
      literals += '\x00';
      for (var x = 0; x < width; ++x) {
        pos += pad;
        literals += pxToString(bytes, pos);
        pos += 3;
      }
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
