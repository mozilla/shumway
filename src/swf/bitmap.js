/* -*- mode: javascript; tab-width: 4; indent-tabs-mode: nil -*- */

/** @const */ var FORMAT_COLORMAPPED  = 3;
/** @const */ var FORMAT_15BPP        = 4;
/** @const */ var FORMAT_24BPP        = 5;
/** @const */ var FACTOR_5BBP         = 255 / 31;

function rgbToString(bytes, pos) {
  var red = bytes[pos];
  var green = bytes[pos + 1];
  var blue = bytes[pos + 2];
  return fromCharCode(red, green, blue);
}
function argbToString(bytes, pos) {
  var alpha = bytes[pos];
  if (!alpha)
    return '\x00\x00\x00\x00';
  var opacity = alpha / 0xff;
  // RGB values are alpha pre-multiplied (per SWF spec).
  var red = 0 | (bytes[pos + 1] / opacity);
  var green = 0 | (bytes[pos + 2] / opacity);
  var blue = 0 | (bytes[pos + 3] / opacity);
  return fromCharCode(red, green, blue, alpha);
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
    var bytesPerLine = (width + 3) & ~3;
    var colorTableSize = tag.colorTableSize + 1;
    var paletteSize = colorTableSize * (tag.hasAlpha ? 4 : 3);
    var datalen = paletteSize + (bytesPerLine * height);
    var stream = createInflatedStream(bmpData, datalen);
    var bytes = stream.bytes;
    var pos = 0;

    var palette = '';
    stream.ensure(paletteSize);
    if (hasAlpha) {
      var alphaValues = '';
      while (pos < paletteSize) {
        palette += rgbToString(bytes, pos);
        pos += 3;
        alphaValues += fromCharCode(bytes[pos++]);
      }
      trns = createPngChunk('tRNS', alphaValues);
    } else {
      while (pos < paletteSize) {
        palette += rgbToString(bytes, pos);
        pos += 3;
      }
    }
    plte = createPngChunk('PLTE', palette);

    while (pos < datalen) {
      stream.ensure(bytesPerLine);
      var begin = pos;
      var end = begin + width;
      var scanline = slice.call(bytes, begin, end);
      if (scanline[0] == 5 && scanline[2] == 5)
        debugger;
      literals += '\x00' + fromCharCode.apply(null, scanline);
      stream.pos = (pos += bytesPerLine);
    }
    break;
  case FORMAT_15BPP:
    var colorType = '\x02';
    var bytesPerLine = ((width * 2) + 3) & ~3;
    var stream = createInflatedStream(bmpData, bytesPerLine * height);
    var pos = 0;
    for (var y = 0; y < height; ++y) {
      literals += '\x00';
      stream.ensure(bytesPerLine);
      for (var x = 0; x < width; ++x) {
        var word = stream.getUint16(pos);
        pos += 2;
        // Extracting RGB color components and changing values range
        // from 0..31 to 0..255.
        var red = 0 | (FACTOR_5BBP * ((word >> 10) & 0x1f));
        var green = 0 | (FACTOR_5BBP * ((word >> 5) & 0x1f));
        var blue = 0 | (FACTOR_5BBP * (word & 0x1f));
        literals += fromCharCode(red, green, blue);
      }
      stream.pos = (pos += bytesPerLine);
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
    var stream = createInflatedStream(bmpData, bytesPerLine * height);
    var bytes = stream.bytes;
    var pos = 0;
    for (var y = 0; y < height; ++y) {
      stream.ensure(bytesPerLine);
      literals += '\x00';
      for (var x = 0; x < width; ++x) {
        pos += padding;
        literals += pxToString(bytes, pos);
        pos += 4 - padding;
      }
      stream.pos = pos;
    }
    break;
  default:
    fail('invalid format', 'bitmap');
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

  var idat =
    '\x78' + // compression method and flags
    '\x9c';  // flags

  var len = literals.length, pos = 0;
  var maxBlockLength = 0xFFFF;
  while (len > maxBlockLength) {
    idat += '\x00\xFF\xFF\x00\x00' +
      literals.substring(pos, pos + maxBlockLength);
    pos += maxBlockLength;
    len -= maxBlockLength;
  }
  idat += '\x01' +
    toString16Le(len) +
    toString16Le(~len & 0xffff) +
    literals.substring(pos);

  idat += toString32(adler32(literals)); // checksum

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
    width: width,
    height: height,
    mimeType: 'image/png',
    data: data
  };
}
