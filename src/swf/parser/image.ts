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
  export function parseJpegChunks(bytes:Uint8Array,
                                  chunks: Uint8Array[]): void {
    var i = 0;
    var n = bytes.length;
    // Finding first marker, and skipping the data before this marker.
    // (FF 00 - code is escaped FF; FF FF ... (FF xx) - fill bytes before marker).
    while (i < n && (bytes[i] !== 0xff ||
           (i + 1 < n && (bytes[i + 1] === 0x00 || bytes[i + 1] === 0xff)))) {
      ++i;
    }
    if (i >= n) {
      return; // no valid data was found
    }

    do {
      release || Debug.assert(bytes[i] === 0xff);
      var begin = i++;
      var code = bytes[i++];

      // Some tags have length field -- using it
      if ((code >= 0xc0 && code <= 0xc7) || (code >= 0xc9 && code <= 0xcf) ||
          (code >= 0xda && code <= 0xef) || code === 0xfe) {
        var length = readUint16(bytes, i);
        i += length;
      }

      // Finding next marker.
      while (i < n && (bytes[i] !== 0xff ||
             (i + 1 < n && (bytes[i + 1] === 0x00 || bytes[i + 1] === 0xff)))) {
        ++i;
      }

      if (code === 0xd8 || code === 0xd9) {
        // Removing SOI and EOI to avoid wrong EOI-SOI pairs in the middle.
        continue;
      }
      chunks.push(bytes.subarray(begin, i));
    } while (i < n);
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

  export interface JPEGTablesState {
    data: Uint8Array;
    parsedChunks?: Uint8Array[]; // Cached parsing results
  }

  export interface DefineImageTag {
    id: number;
    imgData: Uint8Array;
    mimeType: string;
    alphaData: boolean;
    jpegTables: JPEGTablesState;
  }

  function injectJPEGTables(chunks: Uint8Array[], state: JPEGTablesState): void {
    if (!state.parsedChunks) {
      var parsedChunks: Uint8Array[] = [];
      parseJpegChunks(state.data, parsedChunks);
      state.parsedChunks = parsedChunks;
    }
    // Finding first SOF and inserting tables there
    var i = 0;
    while (i < chunks.length &&
           !(chunks[i][1] >= 0xc0 && chunks[i][1] <= 0xc0)) {
      i++;
    }
    Array.prototype.splice.apply(chunks,
      Array.prototype.concat.call([i, 0], state.parsedChunks));
  }

  var JPEG_SOI = new Uint8Array([0xff, 0xd8]);
  var JPEG_EOI = new Uint8Array([0xff, 0xd9]);

  export function defineImage(tag: DefineImageTag): ImageDefinition {
    enterTimeline("defineImage");
    var image: any = {
      type: 'image',
      id: tag.id,
      mimeType: tag.mimeType
    };
    var imgData = tag.imgData;

    if (tag.mimeType === 'image/jpeg') {
      // Parsing/repairing the SWF JPEG data.
      var chunks: Uint8Array[] = [];
      chunks.push(JPEG_SOI);
      parseJpegChunks(imgData, chunks);
      if (tag.jpegTables) {
        injectJPEGTables(chunks, tag.jpegTables);
      }
      chunks.push(JPEG_EOI);
      // Finding SOF to extract image size.
      chunks.forEach(function (chunk: Uint8Array) {
        var code = chunk[1];
        if (code >= 0xc0 && code <= 0xc3) {
          image.height = readUint16(chunk, 5);
          image.width = readUint16(chunk, 7);
        }
      });

      var alphaData: Uint8Array = <any>tag.alphaData;
      if (alphaData) {
        var jpegImage = new Shumway.JPEG.JpegImage();
        jpegImage.parse(joinChunks(chunks));
        release || assert(image.width === jpegImage.width && image.height === jpegImage.height,
          'Wrong image size after parsing: ' + image.width + 'x' + image.height + ' vs ' + jpegImage.width + 'x' + jpegImage.height);
        var width = image.width;
        var height = image.height;
        var length = width * height;

        var alphaMaskBytes;
        try {
          alphaMaskBytes = Inflate.inflate(alphaData, length, true);
        } catch (e) {
          // Alpha layer is invalid, so hiding everything.
          alphaMaskBytes = new Uint8Array(width);
        }

        var data = image.data = new Uint8ClampedArray(length * 4);
        jpegImage.copyToImageData(image);
        for (var i = 0, k = 3; i < length; i++, k += 4) {
          data[k] = alphaMaskBytes[i];
        }
        image.dataType = ImageType.StraightAlphaRGBA;
        image.mimeType = 'application/octet-stream';
      } else {
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
