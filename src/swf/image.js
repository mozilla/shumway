/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var plte = createPngChunk('PLTE', (new Array(769)).join('\x00'));
var alphaValues = [];
for (var i = 0; i < 256; ++i)
  alphaValues.push(i);
var trns = createPngChunk('tRNS', fromCharCode.apply(null, alphaValues));

function getUint16(buff, pos) {
  return (buff[pos] << 8) | buff[pos + 1];
}

function defineImage(tag, dictionary) {
  var imgData = tag.imgData;
  var data = '';
  var mask;

  if (tag.mimeType === 'image/jpeg') {
    var width = 0;
    var height = 0;
    var i = 2;
    var n = imgData.length;
    var code;
    do {
      var begin = i;
      while (imgData[i] !== 0xff)
        ++i;
      while (imgData[i] === 0xff)
        ++i;
      var code = imgData[i++];
      if (code === 0xda) {
        i = n;
      } else {
        if (code === 0xd9) {
          i += 2;
          continue;
        } else {
          var length = getUint16(imgData, i);
          if (code >= 0xc0 && code <= 0xc3) {
            height = getUint16(imgData, i + 3);
            width = getUint16(imgData, i + 5);
          }
          i += length;
        }
      }
      var codes = slice.call(imgData, begin, i);
      var numChunks = codes.length / 65536;
      for (var j = 0; j < numChunks; ++j) {
        var begin = j * 65536;
        var end = begin + 65536;
        var chunk = codes.slice(begin, end);
        data += fromCharCode.apply(null, chunk);
      }
    } while (i < n);
    var alphaData = tag.alphaData;
    if (alphaData) {
      assert(width && height, 'bad image', 'jpeg');

      var ihdr =
        toString32(width) +
        toString32(height) +
        '\x08' + // bit depth
        '\x03' + // color type
        '\x00' + // compression method
        '\x00' + // filter method
        '\x00' // interlace method
      ;

      var stream = new Stream(alphaData, 0, width * height, 'C');
      var bytes = stream.bytes;
      var literals = '';
      for (var i = 0; i < height; ++i) {
        stream.ensure(width);
        var begin = i * width;
        var end = begin + width;
        var scanline = slice.call(bytes, begin, end);
        literals += '\x00' + fromCharCode.apply(null, scanline);
      }
      var len = literals.length;
      var nlen = ~len & 0xffff;
      var idat =
        '\x78' + // compression method and flags
        '\x9c' + // flags
        '\x01' + // block header
        toString16Le(len) +
        toString16Le(nlen) +
        literals +
        toString32(adler32(literals)) // checksum
      ;

      mask =
        '\x89\x50\x4e\x47\x0d\x0a\x1a\x0a' + // signature
        createPngChunk('IHDR', ihdr) +
        plte +
        trns +
        createPngChunk('IDAT', idat) +
        createPngChunk('IEND', '')
      ;
    }
    if (tag.incomplete) {
      var tables = dictionary[0];
      assert(tables, 'missing tables', 'jpeg');
      var header = tables.data;
      data = header.substr(0, header.length - 2) + data;
    } else {
      data = '\xff\xd8' + data;
    }
  } else {
    var numChunks = imgData.length / 65536;
    for (var i = 0; i < numChunks; ++i) {
      var begin = i * 65536;
      var end = begin + 65536;
      var chunk = slice.call(imgData, begin, end);
      data += fromCharCode.apply(null, chunk);
    }
  }

  var img = {
    type: 'image',
    id: tag.id,
    mimeType: tag.mimeType,
    data: data
  };
  if (mask)
    img.mask = mask;
  return img;
}
