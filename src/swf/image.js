/* -*- mode: javascript; tab-width: 4; indent-tabs-mode: nil -*- */

function getUint16(buff, pos) {
  return (buff[pos] << 8) | buff[pos + 1];
}

function defineImage(tag, dictionary) {
  var imgData = tag.imgData;
  var chunks = [];
  var mask;

  if (tag.mimeType === 'image/jpeg') {
    var width = 0;
    var height = 0;
    var i = 0;
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
        } else if (code < 0xd0 || code > 0xd8) {
          var length = getUint16(imgData, i);
          if (code >= 0xc0 && code <= 0xc3) {
            height = getUint16(imgData, i + 3);
            width = getUint16(imgData, i + 5);
          }
          i += length;
        }
      }
      chunks.push(imgData.subarray(begin, i));
    } while (i < n);
    var alphaData = tag.alphaData;
    if (alphaData) {
      assert(width && height, 'bad image', 'jpeg');
      mask = createInflatedStream(alphaData, width * height).bytes;
    }
    if (tag.incomplete) {
      var tables = dictionary[0];
      assert(tables, 'missing tables', 'jpeg');
      var header = tables.data;
      if (header) {
        chunks[0] = chunks[0].subarray(2);
        chunks.unshift(header.slice(0, header.size - 2));
      }
    }
  } else {
    chunks.push(imgData);
  }

  var img = {
    type: 'image',
    id: tag.id,
    width: width,
    height: height,
    mimeType: tag.mimeType,
    data: new Blob(chunks, { type: tag.mimeType })
  };
  if (mask)
    img.mask = mask;
  return img;
}
