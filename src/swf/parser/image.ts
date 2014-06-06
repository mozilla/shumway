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

  export function parseJpegChunks(image: any, bytes) {
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
          image.height = getUint16(bytes, i + 3);
          image.width = getUint16(bytes, i + 5);
        }
        i += length;
      }
      chunks.push(bytes.subarray(begin, i));
    } while (i < n);
    assert(image.width && image.height, 'bad image', 'jpeg');
    return chunks;
  }

  export interface ImageDefinition {
    type: string;
    id: number;
    width: number;
    height: number;
    mimeType: string;
    data: Uint8Array;
    dataType?: ImageType;
  }

  export interface DefineImageTag {
    id: number;
    imgData: Uint8Array;
    mimeType: string;
    alphaData: boolean;
    incomplete: boolean;
  }

  export function defineImage(tag: DefineImageTag, dictionary: any): ImageDefinition {
    enterTimeline("defineImage");
    var image: any = {
      type: 'image',
      id: tag.id,
      mimeType: tag.mimeType
    };
    var imgData = tag.imgData;
    var chunks;

    if (tag.mimeType === 'image/jpeg') {
      var alphaData = tag.alphaData;
      if (alphaData) {
        var jpegImage = new Shumway.JPEG.JpegImage();
        jpegImage.parse(imgData);

        var width = image.width = jpegImage.width;
        var height = image.height = jpegImage.height;
        var length = width * height;
        var symbolMaskBytes = createInflatedStream(alphaData, length).bytes;
        var data = image.data = new Uint8ClampedArray(length * 4);

        jpegImage.copyToImageData(image);

        for (var i = 0, k = 3; i < length; i++, k += 4) {
          data[k] = symbolMaskBytes[i];
        }

        image.mimeType = 'application/octet-stream';
        image.dataType = ImageType.PremultipliedAlphaARGB;
      } else {
        chunks = parseJpegChunks(image, imgData);

        if (tag.incomplete) {
          var tables = dictionary[0];
          assert(tables, 'missing tables', 'jpeg');
          var header = tables.data;
          if (header && header.size) {
            chunks[0] = chunks[0].subarray(2);
            chunks.unshift(header.slice(0, header.size - 2));
          }
        }
        var length = 0;
        for (var i = 0; i < chunks.length; i++) {
          length += chunks[i].length;
        }
        var data = new Uint8Array(length);
        var offset = 0;
        for (var i = 0; i < chunks.length; i++) {
          var chunk = chunks[i];
          data.set(chunk, offset);
          offset += chunk.length;
        }
        image.data = data;
      }
    } else {
      image.data = imgData;
    }
    leaveTimeline();
    return image;
  }
}