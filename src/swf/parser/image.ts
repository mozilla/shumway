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
   * Reads the next two bytes at the specified position.
   */
  function readInt32(bytes: Uint8Array, position: number) {
    return (bytes[position] << 24) | (bytes[position + 1] << 16) |
           (bytes[position + 2] << 8) | bytes[position + 3];
  }

  /**
   * Parses JPEG chunks and reads image width and height information. JPEG data
   * in SWFs is encoded in chunks and not directly decodable by the JPEG parser.
   */
  export function parseJpegChunks(image: any, bytes:Uint8Array,
                                  chunks: Uint8Array[]): Uint8Array [] {
    var i = 0;
    var n = bytes.length;
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
    if (!release && !(image.width && image.height)) {
      Debug.warning('bad jpeg image');
    }
    return chunks;
  }

  /**
   * Extracts PNG width and height information.
   */
  export function parsePngHeaders(image: any, bytes: Uint8Array): void {
    var ihdrOffset = 12;
    if (bytes[ihdrOffset] !== 0x49 || bytes[ihdrOffset + 1] !== 0x48 ||
        bytes[ihdrOffset + 2] !== 0x44 || bytes[ihdrOffset + 3] !== 0x52) {
      return;
    }
    image.width = readInt32(bytes, ihdrOffset + 4);
    image.height = readInt32(bytes, ihdrOffset + 8);
    var type = bytes[ihdrOffset + 14];
    image.hasAlpha = type === 4 || type === 6;
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
    image: any; // For some reason, tsc doesn't like us using the DOM Image definition here.
  }

  export interface DefineImageTag {
    id: number;
    imgData: Uint8Array;
    mimeType: string;
    alphaData: boolean;
    jpegTables: Uint8Array;
  }

  export function defineImage(tag: DefineImageTag): ImageDefinition {
    enterTimeline("defineImage");
    var image: any = {
      type: 'image',
      id: tag.id,
      mimeType: tag.mimeType
    };
    var imgData = tag.imgData;

    if (tag.mimeType === 'image/jpeg') {
      var alphaData: Uint8Array = <any>tag.alphaData;
      if (alphaData) {
        var jpegImage = new Shumway.JPEG.JpegImage();
        jpegImage.parse(joinChunks(parseJpegChunks(image, imgData, [])));
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
        var chunks = [];
        if (tag.jpegTables) {
          chunks.push(tag.jpegTables);
        }
        parseJpegChunks(image, imgData, chunks);

        if (tag.jpegTables && tag.jpegTables.byteLength > 0) {
          chunks[1] = chunks[1].subarray(2);
        }

        image.data = joinChunks(chunks);
        image.dataType = ImageType.JPEG;
      }
    } else {
      parsePngHeaders(image, imgData);
      image.data = imgData;
      image.dataType = ImageType.PNG;
    }
    leaveTimeline();
    return image;
  }
}
