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


/// <reference path='references.ts'/>
module Shumway.SWF.Parser {
  import assert = Shumway.Debug.assert;

  function getUint16(buff, pos) {
    return (buff[pos] << 8) | buff[pos + 1];
  }

  export function parseJpegChunks(imgDef, bytes) {
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

  declare class JpegImage {
    width:number;
    height:number;

    parse(data:Uint8Array);

    copyToImageData(data);
  }

  export function defineImage(tag:any, dictionary:any) {
    var img: any = {
      type: 'image',
      id: tag.id,
      mimeType: tag.mimeType
    };
    var imgData = tag.imgData;
    var chunks;

    if (tag.mimeType === 'image/jpeg') {
      var alphaData = tag.alphaData;
      if (alphaData) {
        var j = new JpegImage();
        j.parse(imgData);

        var width = img.width = j.width;
        var height = img.height = j.height;
        var length = width * height;
        var symbolMaskBytes = createInflatedStream(alphaData, length).bytes;
        var data = img.data = new Uint8ClampedArray(length * 4);

        j.copyToImageData(img);

        for (var i = 0, k = 3; i < length; i++, k += 4) {
          data[k] = symbolMaskBytes[i];
        }

        img.mimeType = 'application/octet-stream';
      } else {
        chunks = parseJpegChunks(img, imgData);

        if (tag.incomplete) {
          var tables = dictionary[0];
          assert(tables, 'missing tables', 'jpeg');
          var header = tables.data;
          if (header && header.size) {
            chunks[0] = chunks[0].subarray(2);
            chunks.unshift(header.slice(0, header.size - 2));
          }
        }
        var len = 0;
        for (var i = 0; i < chunks.length; i++) {
          len += chunks[i].length;
        }
        var data = new Uint8Array(len);
        var offset = 0;
        for (var i = 0; i < chunks.length; i++) {
          var chunk = chunks[i];
          data.set(chunk, offset);
          offset += chunk.length;
        }
        img.data = data;
      }
    } else {
      img.data = imgData;
    }
    return img;
  }
}
