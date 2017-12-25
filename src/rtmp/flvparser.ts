/**
 * Copyright 2015 Mozilla Foundation
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

module RtmpJs.FLV {
  export interface FLVHeader {
    hasAudio: boolean;
    hasVideo: boolean;
    extra: Uint8Array;
  }

  export interface FLVTag {
    type: number;
    needPreprocessing: boolean;
    timestamp: number;
    data: Uint8Array;
  }

  export class FLVParser {
    private state: number = 0;
    private buffer: ArrayBuffer;
    private bufferSize: number;
    private previousTagSize: number;

    public onHeader: (header: FLVHeader) => void;
    public onTag: (tag: FLVTag) => void;
    public onClose: () => void;
    public onError: (error) => void;

    public constructor() {
      this.state = 0;
      this.buffer = new ArrayBuffer(1024);
      this.bufferSize = 0;
      this.previousTagSize = 0;
      this.onError = null;
      this.onHeader = null;
      this.onTag = null;
      this.onClose = null;
    }

    public push(data: Uint8Array) {
      var parseBuffer;
      if (this.bufferSize > 0) {
        var needLength = this.bufferSize + data.length;
        if (this.buffer.byteLength < needLength) {
          var tmp = new Uint8Array(this.buffer, 0, this.bufferSize);
          this.buffer = new ArrayBuffer(needLength);
          parseBuffer = new Uint8Array(this.buffer);
          parseBuffer.set(tmp);
        } else {
          parseBuffer = new Uint8Array(this.buffer, 0, needLength);
        }
        parseBuffer.set(data, this.bufferSize);
      } else {
        parseBuffer = data;
      }

      var parsed = 0, end = parseBuffer.length;
      while (parsed < end) {
        var chunkParsed = 0;
        switch (this.state) {
          case 0:
            if (parsed + 9 > end) {
              break;
            }
            var headerLength =
              (parseBuffer[parsed + 5] << 24) | (parseBuffer[parsed + 6] << 16) |
              (parseBuffer[parsed + 7] << 8) | parseBuffer[parsed + 8];
            if (headerLength < 9) {
              this._error('Invalid header length');
              break;
            }
            if (parsed + headerLength > end) {
              break;
            }
            if (parseBuffer[parsed] !== 0x46 /* F */ ||
              parseBuffer[parsed + 1] !== 0x4C /* L */ ||
              parseBuffer[parsed + 2] !== 0x56 /* V */ ||
              parseBuffer[parsed + 3] !== 1 /* version 1 */ ||
              (parseBuffer[parsed + 4] & 0xFA) !== 0) {
              this._error('Invalid FLV header');
              break;
            }
            var flags = parseBuffer[parsed + 4];
            var extra = headerLength > 9 ? parseBuffer.subarray(parsed + 9, parsed + headerLength) : null;

            this.onHeader && this.onHeader({
              hasAudio: !!(flags & 4),
              hasVideo: !!(flags & 1),
              extra: extra
            });
            this.state = 2;
            chunkParsed = headerLength;
            break;
          case 2:
            if (parsed + 4 + 11 > end) {
              break;
            }
            var previousTagSize =
              (parseBuffer[parsed + 0] << 24) | (parseBuffer[parsed + 1] << 16) |
              (parseBuffer[parsed + 2] << 8) | parseBuffer[parsed + 3];
            if (previousTagSize !== this.previousTagSize) {
              this._error('Invalid PreviousTagSize');
              break;
            }
            var dataSize = (parseBuffer[parsed + 5] << 16) |
              (parseBuffer[parsed + 6] << 8) | parseBuffer[parsed + 7];
            var dataOffset = parsed + 4 + 11;
            if (dataOffset + dataSize > end) {
              break;
            }
            var flags = parseBuffer[parsed + 4];
            var streamID = (parseBuffer[parsed + 12] << 16) |
              (parseBuffer[parsed + 13] << 8) | parseBuffer[parsed + 14];
            if (streamID !== 0 || (flags & 0xC0) !== 0) {
              this._error('Invalid FLV tag');
              break;
            }
            var dataType = flags & 0x1F;
            if (dataType !== 8 && dataType !== 9 && dataType !== 18) {
              this._error('Invalid FLV tag type');
              break;
            }
            var needPreprocessing = !!(flags & 0x20);
            var timestamp = (parseBuffer[parsed + 8] << 16) |
              (parseBuffer[parsed + 9] << 8) | parseBuffer[parsed + 10] |
              (parseBuffer[parsed + 11] << 24) /* signed part */;
            this.onTag && this.onTag({
              type: dataType,
              needPreprocessing: needPreprocessing,
              timestamp: timestamp,
              data: parseBuffer.subarray(dataOffset, dataOffset + dataSize)
            });
            chunkParsed += 4 + 11 + dataSize;
            this.previousTagSize = dataSize + 11;
            this.state = 2;
            break;

          default:
            throw new Error('invalid state');
        }

        if (chunkParsed === 0) {
          break; // not enough data
        }

        parsed += chunkParsed;
      }

      if (parsed < parseBuffer.length) {
        this.bufferSize = parseBuffer.length - parsed;
        if (this.buffer.byteLength < this.bufferSize) {
          this.buffer = new ArrayBuffer(this.bufferSize);
        }
        new Uint8Array(this.buffer).set(parseBuffer.subarray(parsed));
      } else {
        this.bufferSize = 0;
      }
    }

    private _error(message: string) {
      this.state = -1;
      this.onError && this.onError(message);
    }

    public close() {
      this.onClose && this.onClose();
    }
  }
}

