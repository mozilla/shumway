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
      if (header && header.size) {
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
