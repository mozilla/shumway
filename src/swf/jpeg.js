/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var plte = createPngChunk('PLTE', (new Array(769)).join('\x00'));
var alphaValues = [];
for (var i = 0; i < 256; ++i)
  alphaValues.push(i);
var trns = createPngChunk('tRNS', fromCharCode.apply(null, alphaValues));

function defineJpeg(tag, dictionary) {
  var imgData = tag.imgData;
  var mimeType;
  var mask;
  if (imgData[0] === 0xff && imgData[1] === 0xd8) {
    mimeType = 'image/jpeg';
    var data = '';
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
          var length = (imgData[i] << 8) | imgData[i + 1];
          if (code >= 0xc0 && code <= 0xc3) {
            height = (imgData[i + 3] << 8) | imgData[i + 4];
            width = (imgData[i + 5] << 8) | imgData[i + 6];
          }
          i += length;
        }
      }
      var codes = slice.call(imgData, begin, i);
      var numChunks = codes.length / 65536;
      for (var j = 0; j < numChunks; ++j) {
        var chunk = codes.slice(j * 65536, (j + 1) * 65536);
        data += fromCharCode.apply(null, chunk);
      }
    } while (i < n);
    assert(width && height, 'could not determine image dimension', 'jpeg');
    var alphaData = tag.alphaData;
    if (alphaData) {
      var stream = new Stream(alphaData.buffer, alphaData.byteOffset, width * height);
      var bytes = stream.bytes;
      var len = (width * height) + height;
      var nlen = ~len & 0xffff;
      var idat =
        '\x78\x9c' + // zlib header
        '\x01' + // block header
        fromCharCode(len & 0xff, (len >> 8) & 0xff) + // len
        fromCharCode(nlen & 0xff, (nlen >> 8) & 0xff) // nlen
      ;
      var body = '';
      for (var i = 0; i < height; ++i) {
        stream.ensure(width);
        var begin = i * width;
        var end = begin + width;
        var scanline = slice.call(bytes, begin, end);
        body += '\x00' + fromCharCode.apply(null, scanline);
      }
      idat += body + '\x00\x00\x00\x00';
      mask =
        '\x89\x50\x4e\x47\x0d\x0a\x1a\x0a' + // signature
        createPngChunk('IHDR',
          toString32(width) +
          toString32(height) +
          '\x08' + // bit depth
          '\x03' + // color type
          '\x00' + // compression method
          '\x00' + // filter method
          '\x00' // interlace method
        ) +
        plte +
        trns +
        createPngChunk('IDAT', idat) +
        createPngChunk('IEND', '')
      ;
    }
    if (dictionary[0]) {
      var header = dictionary[0].data;
      data = header.substr(0, header.length - 2) + data;
    } else {
      data = '\xff\xd8' + data;
    }
  } else {
    var numChunks = imageData.length / 65536;
    for (var i = 0; i < numChunks; ++i) {
      var chunk = slice.call(imgData, i * 65536, (i + 1) * 65536);
      data += fromCharCode.apply(null, chunk);
    }
    if (/^\x89\x50\x4e\x47\x0d\x0a\x1a\x0a/.test(data))
      mimeType = 'image/png';
    else if (/^\x47\x49\x46\x38\x39\x61/.test(data))
      mimeType = 'image/gif';
    else
      mimeType = 'application/octet-stream';
  }
  var img = {
    type: 'image',
    id: tag.id,
    mimeType: mimeType,
    data: data
  };
  if (mask)
    img.mask = mask;
  return img;
}
