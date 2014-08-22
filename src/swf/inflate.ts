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

  class HeadTailBuffer {
    private _bufferSize: number;
    private _buffer: Uint8Array;
    private _pos: number;

    constructor(defaultSize:number = 16) {
      this._bufferSize = defaultSize;
      this._buffer = new Uint8Array(this._bufferSize);
      this._pos = 0;
    }

    push(data: Uint8Array, need?: number) {
      var bufferLengthNeed = this._pos + data.length;
      if (this._bufferSize < bufferLengthNeed) {
        var newBufferSize = this._bufferSize;
        while (newBufferSize < bufferLengthNeed) {
          newBufferSize <<= 1;
        }
        var newBuffer = new Uint8Array(newBufferSize);
        if (this._bufferSize > 0) {
          newBuffer.set(this._buffer);
        }
        this._buffer = newBuffer;
        this._bufferSize = newBufferSize;
      }
      this._buffer.set(data, this._pos);
      this._pos += data.length;
      if (need) {
        return this._pos >= need;
      }
    }

    getHead(size: number) {
      return this._buffer.subarray(0, size);
    }

    getTail(offset: number) {
      return this._buffer.subarray(offset, this._pos);
    }

    removeHead(size: number) {
      var tail = this.getTail(size);
      this._buffer = new Uint8Array(this._bufferSize);
      this._buffer.set(tail);
      this._pos = tail.length;
    }

    get arrayBuffer() {
      return this._buffer.buffer;
    }

    get length() {
      return this._pos;
    }

    getBytes(): Uint8Array {
      return this._buffer.subarray(0, this._pos);
    }

    createStream() {
      return new Stream(this.arrayBuffer, 0, this.length);
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
    private _buffer: HeadTailBuffer;
    private _state: CompressedPipeState;
    private _output: CompressionOutput;

    public onData: (data: Uint8Array, start: number, end: number) => void;

    constructor(length: number = 16) {
      this._length = length;
      this._initialize = true;
      this._buffer = new HeadTailBuffer(8096);
      this._state = { bitBuffer: 0, bitLength: 0, compression: {
        header: null, distanceTable: null, literalTable: null,
        sym: null, len: null, sym2: null } };
      this._output = {
        data: new Uint8Array(length),
        available: 0,
        completed: false
      };
      this._buffer = new HeadTailBuffer(8192);
    }
    public push(data: Uint8Array) {
      var buffer = this._buffer;
      if (this._initialize) {
        if (!buffer.push(data, 2)) {
          return;
        }
        var headerBytes = buffer.getHead(2);
        verifyDeflateHeader(headerBytes);
        buffer.removeHead(2);
        this._initialize = false;
      } else {
        buffer.push(data);
      }
      var stream = buffer.createStream();
      stream.bitBuffer = this._state.bitBuffer;
      stream.bitLength = this._state.bitLength;
      var output = this._output;
      var lastAvailable = output.available;
      try {
        do {
          inflateBlock(stream, output, this._state.compression);
        } while (stream.pos < buffer.length && !output.completed);
      } catch (e) {
        this._state.bitBuffer = stream.bitBuffer;
        this._state.bitLength = stream.bitLength;
        if (e !== InflateNoDataError) {
          throw e; // Re-throw non data errors.
        }
      }
      this._state.bitBuffer = stream.bitBuffer;
      this._state.bitLength = stream.bitLength;
      buffer.removeHead(stream.pos);

      // push data downstream
      if (this.onData) {
        this.onData(output.data, lastAvailable, output.available);
      }
    }

    public toUint8Array(): Uint8Array {
      return this._output.data;
    }
  }

  export function inflateBlock(stream: Stream, output: CompressionOutput, state: CompressionState) {
    var header = state.header !== null ? state.header :
      (state.header = readBits(stream.bytes, stream, 3));
    switch (header >> 1) {
      case 0:
        stream.align();
        var pos = stream.pos;
        if (stream.end - pos < 4) {
          throw InflateNoDataError;
        }
        var len = stream.getUint16(pos, true);
        var nlen = stream.getUint16(pos + 2, true);
        release || assert((~nlen & 0xffff) === len, 'inflate: bad uncompressed block length');
        if (stream.end - pos < 4 + len) {
          throw InflateNoDataError;
        }
        var begin = pos + 4;
        var end = stream.pos = begin + len;
        var sbytes = stream.bytes, dbytes = output.data;
        dbytes.set(sbytes.subarray(begin, end), output.available);
        output.available += len;
        break;
      case 1:
        inflate(stream, output, fixedLiteralTable, fixedDistanceTable, state);
        break;
      case 2:
        var distanceTable: HuffmanTable, literalTable: HuffmanTable;
        if (state.distanceTable !== null) {
          distanceTable = state.distanceTable;
          literalTable = state.literalTable;
        } else {
          var sbytes = stream.bytes;
          var savedBufferPos = stream.pos;
          var savedBitBuffer = stream.bitBuffer;
          var savedBitLength = stream.bitLength;
          var bitLengths = [];
          var numLiteralCodes, numDistanceCodes;
          try {
            numLiteralCodes = readBits(sbytes, stream, 5) + 257;
            numDistanceCodes = readBits(sbytes, stream, 5) + 1;
            var numCodes = numLiteralCodes + numDistanceCodes;
            var numLengthCodes = readBits(sbytes, stream, 4) + 4;
            for (var i = 0; i < 19; ++i)
              bitLengths[codeLengthOrder[i]] = i < numLengthCodes ? readBits(sbytes, stream, 3) : 0;
            var codeLengthTable = makeHuffmanTable(bitLengths);
            bitLengths = [];
            var i = 0;
            var prev = 0;
            while (i < numCodes) {
              var j = 1;
              var sym = readCode(sbytes, stream, codeLengthTable);
              switch (sym) {
                case 16:
                  j = readBits(sbytes, stream, 2) + 3;
                  sym = prev;
                  break;
                case 17:
                  j = readBits(sbytes, stream, 3) + 3;
                  sym = 0;
                  break;
                case 18:
                  j = readBits(sbytes, stream, 7) + 11;
                  sym = 0;
                  break;
                default:
                  prev = sym;
              }
              while (j--)
                bitLengths[i++] = sym;
            }
          } catch (e) {
            stream.pos = savedBufferPos;
            stream.bitBuffer = savedBitBuffer;
            stream.bitLength = savedBitLength;
            throw e;
          }
          distanceTable = state.distanceTable = makeHuffmanTable(bitLengths.splice(numLiteralCodes, numDistanceCodes));
          literalTable = state.literalTable = makeHuffmanTable(bitLengths);
        }
        inflate(stream, output, literalTable, distanceTable, state);
        state.distanceTable = null;
        state.literalTable = null;
        break;
      default:
        release || assertUnreachable('inflate encountered unknown block type');
    }
    state.header = null;
    output.completed = !!(header & 1);
  }

  function readBits(bytes: Uint8Array, stream: Stream, size: number): number {
    var bitBuffer = stream.bitBuffer;
    var bitLength = stream.bitLength;
    if (size > bitLength) {
      var pos = stream.pos;
      var end = stream.end;
      do {
        if (pos >= end) {
          stream.pos = pos;
          stream.bitBuffer = bitBuffer;
          stream.bitLength = bitLength;
          throw InflateNoDataError;
        }
        bitBuffer |= bytes[pos++] << bitLength;
        bitLength += 8;
      } while (size > bitLength);
      stream.pos = pos;
    }
    stream.bitBuffer = bitBuffer >>> size;
    stream.bitLength = bitLength - size;
    return bitBuffer & ((1 << size) - 1);
  }

  function inflate(stream: Stream, output: CompressionOutput,
                   literalTable, distanceTable,
                   state: CompressionState) {
    var pos = output.available;
    var dbytes = output.data;
    var sbytes = stream.bytes;
    var sym = state.sym !== null ? state.sym :
      readCode(sbytes, stream, literalTable);
    while (sym !== 256) {
      if (sym < 256) {
        dbytes[pos++] = sym;
      } else {
        state.sym = sym;
        sym -= 257;
        var len = state.len !== null ? state.len :
          (state.len = lengthCodes[sym] + readBits(sbytes, stream, lengthExtraBits[sym]));
        var sym2 = state.sym2 !== null ? state.sym2 :
          (state.sym2 = readCode(sbytes, stream, distanceTable));
        var distance = distanceCodes[sym2] + readBits(sbytes, stream, distanceExtraBits[sym2]);
        var i = pos - distance;
        while (len--)
          dbytes[pos++] = dbytes[i++];
        state.sym2 = null;
        state.len = null;
        state.sym = null;
      }
      output.available = pos;
      sym = readCode(sbytes, stream, literalTable);
    }
  }

  function readCode(bytes: Uint8Array, stream: Stream, codeTable): number {
    var bitBuffer = stream.bitBuffer;
    var bitLength = stream.bitLength;
    var maxBits = codeTable.maxBits;
    if (maxBits > bitLength) {
      var pos = stream.pos;
      var end = stream.end;
      do {
        if (pos >= end) {
          stream.pos = pos;
          stream.bitBuffer = bitBuffer;
          stream.bitLength = bitLength;
          throw InflateNoDataError;
        }
        bitBuffer |= bytes[pos++] << bitLength;
        bitLength += 8;
      } while (maxBits > bitLength);
      stream.pos = pos;
    }
    var code = codeTable.codes[bitBuffer & ((1 << maxBits) - 1)];
    var len = code >> 16;
    release || assert(len, 'inflate: bad encoding');
    stream.bitBuffer = bitBuffer >>> len;
    stream.bitLength = bitLength - len;
    return code & 0xffff;
  }
}
