/* -*- mode: javascript; tab-width: 4; indent-tabs-mode: nil -*- */

function getUint16(buff, pos) {
  return (buff[pos] << 8) | buff[pos + 1];
}

function parseJpegChunks(imgDef, bytes) {
  var i = 0;
  var n = bytes.length;
  var chunks = [];
  var code;
  do {
    var begin = i;
    while (i < n && bytes[i] !== 0xff)
      ++i;
    while (i < n && bytes[i] === 0xff)
      ++i;
    code = bytes[i++];
    if (code === 0xda) {
      i = n;
    } else if (code === 0xd9) {
      i += 2;
      continue;
    } else if (code < 0xd0 || code > 0xd8) {
      var length = getUint16(bytes, i);
      if (code >= 0xc0 && code <= 0xc3) {
        imgDef.height = getUint16(bytes, i + 3);
        imgDef.width = getUint16(bytes, i + 5);
      }
      i += length;
    }
    chunks.push(bytes.subarray(begin, i));
  } while (i < n);
  assert(imgDef.width && imgDef.height, 'bad image', 'jpeg');
  return chunks;
}
function defineImage(tag, dictionary) {
  var img = {
    type: 'image',
    id: tag.id,
    mimeType: tag.mimeType
  };
  var imgData = tag.imgData;
  var chunks;

  if (tag.mimeType === 'image/jpeg') {
    chunks = parseJpegChunks(img, imgData);
    var alphaData = tag.alphaData;
    if (alphaData) {
      img.mask = createInflatedStream(alphaData, img.width * img.height).bytes;
    }
    if (tag.incomplete) {
      var tables = dictionary[0];
      assert(tables, 'missing tables', 'jpeg');
      var header = tables.data;
      if (header && header.size) {
        chunks[0] = chunks[0].subarray(2);
        chunks.unshift(header.slice(0, header.size - 2));
      }
    }
  } else {
    chunks = [imgData];
  }
  img.data = new Blob(chunks, { type: tag.mimeType });
  return img;
}
