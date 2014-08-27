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
  import Inflate = Shumway.ArrayUtilities.Inflate;

  /**
   * Reads the next two bytes at the specified position.
   */
  function readUint16(bytes: Uint8Array, position: number) {
    return (bytes[position] << 8) | bytes[position + 1];
  }

  /**
   * Parses JPEG chunks and reads image width and height information. JPEG data
   * is SWFs is encoded in chunks and is not directly decodable by the JPEG
   * parser.
   */
  export function parseJpegChunks(image: any, bytes:Uint8Array): Uint8Array [] {
    var i = 0;
    var n = bytes.length;
    var chunks = [];
    var code;
    do {
      var begin = i;
      while (i < n && bytes[i] !== 0xff) {
        ++i;
      }
      while (i < n && bytes[i] === 0xff) {
        ++i;
      }
      code = bytes[i++];
      if (code === 0xda) {
        i = n;
      } else if (code === 0xd9) {
        i += 2;
        continue;
      } else if (code < 0xd0 || code > 0xd8) {
        var length = readUint16(bytes, i);
        if (code >= 0xc0 && code <= 0xc3) {
          image.height = readUint16(bytes, i + 3);
          image.width = readUint16(bytes, i + 5);
        }
        i += length;
      }
      chunks.push(bytes.subarray(begin, i));
    } while (i < n);
    release || assert(image.width && image.height, 'bad jpeg image');
    return chunks;
  }

  /**
   * Joins all the chunks in a larger byte array.
   */
  function joinChunks(chunks: Uint8Array []): Uint8Array {
    var length = 0;
    for (var i = 0; i < chunks.length; i++) {
      length += chunks[i].length;
    }
    var bytes = new Uint8Array(length);
    var offset = 0;
    for (var i = 0; i < chunks.length; i++) {
      var chunk = chunks[i];
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    return bytes;
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
      var alphaData: Uint8Array = <any>tag.alphaData;
      if (alphaData) {
        var jpegImage = new Shumway.JPEG.JpegImage();
        jpegImage.parse(joinChunks(parseJpegChunks(image, imgData)));
        release || assert(image.width === jpegImage.width);
        release || assert(image.height === jpegImage.height);
        var width = image.width;
        var height = image.height;
        var length = width * height;

        var alphaMaskBytes = Inflate.inflate(alphaData, length, true);

        var data = image.data = new Uint8ClampedArray(length * 4);
        jpegImage.copyToImageData(image);
        for (var i = 0, k = 3; i < length; i++, k += 4) {
          data[k] = alphaMaskBytes[i];
        }
        image.mimeType = 'application/octet-stream';
        image.dataType = ImageType.StraightAlphaRGBA;
      } else {
        chunks = parseJpegChunks(image, imgData);

        if (tag.incomplete) {
          var tables = dictionary[0];
          release || assert(tables, 'missing jpeg tables');
          var header = tables.data;
          if (header && header.size) {
            chunks[0] = chunks[0].subarray(2);
            chunks.unshift(header.slice(0, header.size - 2));
          }
        }
        image.data = joinChunks(chunks);
      }
    } else {
      image.data = imgData;
    }
    leaveTimeline();
    return image;
  }
}
