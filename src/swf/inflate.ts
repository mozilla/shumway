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
module Shumway.SWF {
  import assert = Shumway.Debug.assert;
  import assertUnreachable = Shumway.Debug.assertUnreachable;

  export var InflateNoDataError = {};

  export interface CompressionState {
    header: any;
    distanceTable: any;
    literalTable: any;
    sym: any;
    len: any;
    sym2: any;
  }

  export interface CompressionOutput {
    data: Uint8Array;
    available: number;
    completed: boolean;
  }

  interface HuffmanTable {
    codes: Uint32Array;
    maxBits: number;
  }

  var codeLengthOrder = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

  var distanceCodes = [];
  var distanceExtraBits = [];
  for (var i = 0, j = 0, code = 1; i < 30; ++i) {
    distanceCodes[i] = code;
    code += 1 << (distanceExtraBits[i] = ~~((j += (i > 2 ? 1 : 0)) / 2));
  }

  var bitLengths = [];
  for (var i = 0; i < 32; ++i) {
    bitLengths[i] = 5;
  }
  var fixedDistanceTable = makeHuffmanTable(bitLengths);

  var lengthCodes = [];
  var lengthExtraBits = [];
  for (var i = 0, j = 0, code = 3; i < 29; ++i) {
    lengthCodes[i] = code - (i == 28 ? 1 : 0);
    code += 1 << (lengthExtraBits[i] = ~~(((j += (i > 4 ? 1 : 0)) / 4) % 6));
  }
  for (var i = 0; i < 288; ++i) {
    bitLengths[i] = i < 144 || i > 279 ? 8 : (i < 256 ? 9 : 7);
  }
  var fixedLiteralTable = makeHuffmanTable(bitLengths);

  function makeHuffmanTable(bitLengths: Array<number>) : HuffmanTable {
    var maxBits = Math.max.apply(null, bitLengths);
    var numLengths = bitLengths.length;
    var size = 1 << maxBits;
    var codes = new Uint32Array(size);
    for (var code = 0, len = 1, skip = 2; len <= maxBits; code <<= 1, ++len, skip <<= 1) {
      for (var val = 0; val < numLengths; ++val) {
        if (bitLengths[val] === len) {
          var lsb = 0;
          for (var i = 0; i < len; ++i)
            lsb = (lsb * 2) + ((code >> i) & 1);
          for (var i = lsb; i < size; i += skip)
            codes[i] = (len << 16) | val;
          ++code;
        }
      }
    }
    return { codes: codes, maxBits: maxBits };
  }

  export function verifyDeflateHeader(bytes): void {
    var header = (bytes[0] << 8) | bytes[1];
    release || assert((header & 0x0f00) === 0x0800, 'inflate: unknown compression method');
    release || assert((header % 31) === 0, 'inflate: bad FCHECK');
    release || assert(!(header & 0x20), 'inflate: FDICT bit set');
  }

  class CompressedDataBuffer {
    private _buffer: Uint8Array;
    private _bufferSize: number;
    private _position: number;

    public get bytes(): Uint8Array {
      return this._buffer;
    }
    public get pos() : number {
      return this._position;
    }
    public set pos(value: number) {
      this._position = value;
    }

    get length() {
      return this._bufferSize;
    }

    bitBuffer: number;
    bitLength: number;

    constructor(defaultSize: number = 16) {
      this._buffer = new Uint8Array(defaultSize);
      this._bufferSize = 0;
      this._position = 0;
      this.bitLength = 0;
      this.bitBuffer = 0;
    }

    align() {
      this.bitLength = 0;
      this.bitBuffer = 0;
    }

    getUint16(pos: number): number {
      return this.bytes[pos] | (this.bytes[pos + 1] << 8);
    }

    push(data: Uint8Array, need?: number) {
      var bufferLength = this._buffer.length;
      var bufferLengthNeed = this._bufferSize + data.length;
      if (bufferLength < bufferLengthNeed) {
        var newBufferSize = bufferLength;
        while (newBufferSize < bufferLengthNeed) {
          newBufferSize <<= 1;
        }
        var newBuffer = new Uint8Array(newBufferSize);
        if (bufferLength > 0) {
          newBuffer.set(this._buffer);
        }
        this._buffer = newBuffer;
      }
      this._buffer.set(data, this._bufferSize);
      this._bufferSize += data.length;
      if (need) {
        return this._bufferSize >= need;
      }
    }

    spliceHead(size: number): Uint8Array {
      var buffer = this._buffer;
      var head = new Uint8Array(buffer.subarray(0, size));
      var tail = buffer.subarray(size, this._bufferSize);
      this._buffer.set(tail);
      this._bufferSize = tail.length;
      return head;
    }

    removeHead(size: number) {
      var buffer = this._buffer;
      var tail = buffer.subarray(size, this._bufferSize);
      this._buffer.set(tail);
      this._bufferSize = tail.length;
    }
  }

  interface CompressedPipeState {
    bitBuffer: number;
    bitLength: number;
    compression: CompressionState;
  }

  export class InflateSession {
    private _length: number;
    private _initialize: boolean;
    private _buffer: CompressedDataBuffer;
    private _state: CompressedPipeState;
    private _output: CompressionOutput;

    public onData: (data: Uint8Array, start: number, end: number) => void;

    constructor(length: number = 16) {
      this._length = length;
      this._initialize = true;
      this._buffer = new CompressedDataBuffer(8096);
      this._state = { bitBuffer: 0, bitLength: 0, compression: {
        header: null, distanceTable: null, literalTable: null,
        sym: null, len: null, sym2: null } };
      this._output = {
        data: new Uint8Array(length),
        available: 0,
        completed: false
      };
      this._buffer = new CompressedDataBuffer(8192);
    }
    public push(data: Uint8Array) {
      var buffer = this._buffer;
      if (this._initialize) {
        if (!buffer.push(data, 2)) {
          return;
        }
        var headerBytes = buffer.spliceHead(2);
        verifyDeflateHeader(headerBytes);
        this._initialize = false;
      } else {
        buffer.push(data);
      }

      buffer.bitBuffer = this._state.bitBuffer;
      buffer.bitLength = this._state.bitLength;
      var output = this._output;
      var lastAvailable = output.available;
      try {
        do {
          inflateBlock(buffer, output, this._state.compression);
        } while (buffer.pos < buffer.length && !output.completed);
      } catch (e) {
        this._state.bitBuffer = buffer.bitBuffer;
        this._state.bitLength = buffer.bitLength;
        if (e !== InflateNoDataError) {
          throw e; // Re-throw non data errors.
        }
      }
      this._state.bitBuffer = buffer.bitBuffer;
      this._state.bitLength = buffer.bitLength;
      buffer.removeHead(buffer.pos);

      // push data downstream
      if (this.onData) {
        this.onData(output.data, lastAvailable, output.available);
      }
    }

    public toUint8Array(): Uint8Array {
      return this._output.data;
    }
  }

  function inflateBlock(buffer: CompressedDataBuffer, output: CompressionOutput, state: CompressionState) {
    var header = state.header !== null ? state.header :
      (state.header = readBits(buffer.bytes, buffer, 3));
    switch (header >> 1) {
      case 0:
        buffer.align();
        var pos = buffer.pos;
        if (buffer.length - pos < 4) {
          throw InflateNoDataError;
        }
        var len = buffer.getUint16(pos);
        var nlen = buffer.getUint16(pos + 2);
        release || assert((~nlen & 0xffff) === len, 'inflate: bad uncompressed block length');
        if (buffer.length - pos < 4 + len) {
          throw InflateNoDataError;
        }
        var begin = pos + 4;
        var end = buffer.pos = begin + len;
        var sbytes = buffer.bytes, dbytes = output.data;
        dbytes.set(sbytes.subarray(begin, end), output.available);
        output.available += len;
        break;
      case 1:
        inflate(buffer, output, fixedLiteralTable, fixedDistanceTable, state);
        break;
      case 2:
        var distanceTable: HuffmanTable, literalTable: HuffmanTable;
        if (state.distanceTable !== null) {
          distanceTable = state.distanceTable;
          literalTable = state.literalTable;
        } else {
          var sbytes = buffer.bytes;
          var savedBufferPos = buffer.pos;
          var savedBitBuffer = buffer.bitBuffer;
          var savedBitLength = buffer.bitLength;
          var bitLengths = [];
          var numLiteralCodes, numDistanceCodes;
          try {
            numLiteralCodes = readBits(sbytes, buffer, 5) + 257;
            numDistanceCodes = readBits(sbytes, buffer, 5) + 1;
            var numCodes = numLiteralCodes + numDistanceCodes;
            var numLengthCodes = readBits(sbytes, buffer, 4) + 4;
            for (var i = 0; i < 19; ++i)
              bitLengths[codeLengthOrder[i]] = i < numLengthCodes ? readBits(sbytes, buffer, 3) : 0;
            var codeLengthTable = makeHuffmanTable(bitLengths);
            bitLengths = [];
            var i = 0;
            var prev = 0;
            while (i < numCodes) {
              var j = 1;
              var sym = readCode(sbytes, buffer, codeLengthTable);
              switch (sym) {
                case 16:
                  j = readBits(sbytes, buffer, 2) + 3;
                  sym = prev;
                  break;
                case 17:
                  j = readBits(sbytes, buffer, 3) + 3;
                  sym = 0;
                  break;
                case 18:
                  j = readBits(sbytes, buffer, 7) + 11;
                  sym = 0;
                  break;
                default:
                  prev = sym;
              }
              while (j--)
                bitLengths[i++] = sym;
            }
          } catch (e) {
            buffer.pos = savedBufferPos;
            buffer.bitBuffer = savedBitBuffer;
            buffer.bitLength = savedBitLength;
            throw e;
          }
          distanceTable = state.distanceTable = makeHuffmanTable(bitLengths.splice(numLiteralCodes, numDistanceCodes));
          literalTable = state.literalTable = makeHuffmanTable(bitLengths);
        }
        inflate(buffer, output, literalTable, distanceTable, state);
        state.distanceTable = null;
        state.literalTable = null;
        break;
      default:
        release || assertUnreachable('inflate encountered unknown block type');
    }
    state.header = null;
    output.completed = !!(header & 1);
  }

  function readBits(bytes: Uint8Array, buffer: CompressedDataBuffer, size: number): number {
    var bitBuffer = buffer.bitBuffer;
    var bitLength = buffer.bitLength;
    if (size > bitLength) {
      var pos = buffer.pos;
      var end = buffer.length;
      do {
        if (pos >= end) {
          buffer.pos = pos;
          buffer.bitBuffer = bitBuffer;
          buffer.bitLength = bitLength;
          throw InflateNoDataError;
        }
        bitBuffer |= bytes[pos++] << bitLength;
        bitLength += 8;
      } while (size > bitLength);
      buffer.pos = pos;
    }
    buffer.bitBuffer = bitBuffer >>> size;
    buffer.bitLength = bitLength - size;
    return bitBuffer & ((1 << size) - 1);
  }

  function inflate(buffer: CompressedDataBuffer, output: CompressionOutput,
                   literalTable, distanceTable,
                   state: CompressionState) {
    var pos = output.available;
    var dbytes = output.data;
    var sbytes = buffer.bytes;
    var sym = state.sym !== null ? state.sym :
      readCode(sbytes, buffer, literalTable);
    while (sym !== 256) {
      if (sym < 256) {
        dbytes[pos++] = sym;
      } else {
        state.sym = sym;
        sym -= 257;
        var len = state.len !== null ? state.len :
          (state.len = lengthCodes[sym] + readBits(sbytes, buffer, lengthExtraBits[sym]));
        var sym2 = state.sym2 !== null ? state.sym2 :
          (state.sym2 = readCode(sbytes, buffer, distanceTable));
        var distance = distanceCodes[sym2] + readBits(sbytes, buffer, distanceExtraBits[sym2]);
        var i = pos - distance;
        while (len--)
          dbytes[pos++] = dbytes[i++];
        state.sym2 = null;
        state.len = null;
        state.sym = null;
      }
      output.available = pos;
      sym = readCode(sbytes, buffer, literalTable);
    }
  }

  function readCode(bytes: Uint8Array, buffer: CompressedDataBuffer, codeTable): number {
    var bitBuffer = buffer.bitBuffer;
    var bitLength = buffer.bitLength;
    var maxBits = codeTable.maxBits;
    if (maxBits > bitLength) {
      var pos = buffer.pos;
      var end = buffer.length;
      do {
        if (pos >= end) {
          buffer.pos = pos;
          buffer.bitBuffer = bitBuffer;
          buffer.bitLength = bitLength;
          throw InflateNoDataError;
        }
        bitBuffer |= bytes[pos++] << bitLength;
        bitLength += 8;
      } while (maxBits > bitLength);
      buffer.pos = pos;
    }
    var code = codeTable.codes[bitBuffer & ((1 << maxBits) - 1)];
    var len = code >> 16;
    release || assert(len, 'inflate: bad encoding');
    buffer.bitBuffer = bitBuffer >>> len;
    buffer.bitLength = bitLength - len;
    return code & 0xffff;
  }
}
