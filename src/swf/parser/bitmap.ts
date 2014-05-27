/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/// <reference path='references.ts'/>
module Shumway.SWF.Parser {
  import assertUnreachable = Shumway.Debug.assertUnreachable;

  /** @const */ var FORMAT_COLORMAPPED  = 3;
  /** @const */ var FORMAT_15BPP        = 4;
  /** @const */ var FORMAT_24BPP        = 5;
  /** @const */ var FACTOR_5BBP         = 255 / 31;

  export function defineBitmap(tag: any) {
    var width = tag.width;
    var height = tag.height;
    var hasAlpha = tag.hasAlpha;
    var data = new Uint8ClampedArray(width * height * 4);

    var bmpData = tag.bmpData;
    switch (tag.format) {
      case FORMAT_COLORMAPPED:
        var bytesPerLine = (width + 3) & ~3;
        var colorTableSize = tag.colorTableSize + 1;
        var paletteSize = colorTableSize * (hasAlpha ? 4 : 3);
        var datalen = paletteSize + (bytesPerLine * height);
        var stream = createInflatedStream(bmpData, datalen);
        var bytes = stream.bytes;
        var pos = paletteSize;

        stream.ensure(paletteSize);
        stream.pos = pos;

        for (var y = 0, i = 0; y < height; ++y) {
          stream.ensure(bytesPerLine);
          var index;
          if (hasAlpha) {
            for (var x = 0; x < width; ++x, i += 4) {
              index = bytes[pos++] * 4;
              data[i] = bytes[index];
              data[i + 1] = bytes[index + 1];
              data[i + 2] = bytes[index + 2];
              data[i + 3] = bytes[index + 3];
            }
          } else {
            for (var x = 0; x < width; ++x, i += 4) {
              index = bytes[pos++] * 3;
              data[i] = bytes[index];
              data[i + 1] = bytes[index + 1];
              data[i + 2] = bytes[index + 2];
              data[i + 3] = 255;
            }
          }
          pos = stream.pos += bytesPerLine;
        }
        break;
      case FORMAT_15BPP:
        var colorType = 0x02;
        var bytesPerLine = ((width * 2) + 3) & ~3;
        var stream = createInflatedStream(bmpData, bytesPerLine * height);
        var pos = 0;

        for (var y = 0, i = 0; y < height; ++y) {
          stream.ensure(bytesPerLine);
          for (var x = 0; x < width; ++x, i += 4) {
            var word = stream.getUint16(pos);
            pos += 2;
            // Extracting RGB color components and changing values range
            // from 0..31 to 0..255.
            data[i] = 0 | (FACTOR_5BBP * ((word >> 10) & 0x1f));
            data[i + 1] = 0 | (FACTOR_5BBP * ((word >> 5) & 0x1f));
            data[i + 2] = 0 | (FACTOR_5BBP * (word & 0x1f));
            data[i + 3] = 255;
          }
          pos = stream.pos += bytesPerLine;
        }
        break;
      case FORMAT_24BPP:
        var padding;
        if (hasAlpha) {
          padding = 0;
        } else {
          padding = 1;
        }
        var bytesPerLine = width * 4;
        var stream = createInflatedStream(bmpData, bytesPerLine * height);
        var bytes = stream.bytes;
        var pos = 0;

        for (var y = 0, i = 0; y < height; ++y) {
          stream.ensure(bytesPerLine);
          for (var x = 0; x < width; ++x, i += 4) {
            pos += padding;

            if (hasAlpha) {
              var alpha = bytes[pos];
              if (alpha) {
                var opacity = alpha / 0xff;
                // RGB values are alpha pre-multiplied (per SWF spec).
                data[i] = 0 | (bytes[pos + 1] / opacity);
                data[i + 1] = 0 | (bytes[pos + 2] / opacity);
                data[i + 2] = 0 | (bytes[pos + 3] / opacity);
                data[i + 3] = alpha;
              }
            } else {
              data[i] = bytes[pos];
              data[i + 1] = bytes[pos + 1];
              data[i + 2] = bytes[pos + 2];
              data[i + 3] = 255;
            }

            pos += 4 - padding;
          }
          stream.pos = pos;
        }
        break;
      default:
        assertUnreachable('invalid bitmap format');
    }

    return {
      type: 'image',
      id: tag.id,
      width: width,
      height: height,
      mimeType: 'application/octet-stream',
      data: data
    };
  }
}


