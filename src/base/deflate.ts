/*
 * Copyright 2014 Mozilla Foundation
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

module Shumway.ArrayUtilities {
  enum InflateState {
    INIT = 0,
    BLOCK_0 = 1,
    BLOCK_1 = 2,
    BLOCK_2_PRE = 3,
    BLOCK_2 = 4,
    DONE = 5,
    ERROR = 6,
    VERIFY_HEADER = 7
  }

  var WINDOW_SIZE = 32768;
  var WINDOW_SHIFT_POSITION = 65536;
  var MAX_WINDOW_SIZE = WINDOW_SHIFT_POSITION + 258; /* plus max copy len */

  interface HuffmanTable {
    codes: Uint32Array;
    maxBits: number;
  }

  interface DeflateCopyState {
    state: number;
    len: number;
    lenBits: number;
    dist: number;
    distBits: number;
  }

  interface DeflateBlock2State {
    numLiteralCodes: number;
    numDistanceCodes: number;
    codeLengthTable: HuffmanTable;
    bitLengths: Uint8Array;
    codesRead: number;
    dupBits: number;
  }

  export class Inflate {
    public onData: (buffer: Uint8Array) => void;

    private _buffer: Uint8Array;
    private _bufferSize: number;
    private _bufferPosition: number;
    private _bitBuffer: number;
    private _bitLength: number;
    private _window: Uint8Array;
    private _windowPosition: number;
    private _state: InflateState;
    private _isFinalBlock: boolean;
    private _literalTable: HuffmanTable;
    private _distanceTable: HuffmanTable;
    private _block0Read: number;
    private _block2State: DeflateBlock2State;
    private _copyState: DeflateCopyState;
    private _error: any;

    public get error() {
      return this._error;
    }

    constructor(verifyHeader: boolean) {
      this._buffer = null;
      this._bufferSize = 0;
      this._bufferPosition = 0;
      this._bitBuffer = 0;
      this._bitLength = 0;
      this._window = new Uint8Array(MAX_WINDOW_SIZE);
      this._windowPosition = 0;
      this._state = verifyHeader ? InflateState.VERIFY_HEADER : InflateState.INIT;
      this._isFinalBlock = false;
      this._literalTable = null;
      this._distanceTable = null;
      this._block0Read = 0;
      this._block2State = null;
      this._copyState = {
        state: 0,
        len: 0,
        lenBits: 0,
        dist: 0,
        distBits: 0
      };
      this._error = undefined;

      if (!areTablesInitialized) {
        initializeTables();
        areTablesInitialized = true;
      }
    }
    public push(data: Uint8Array, takeOwnership: boolean = false) {
      if (takeOwnership && this._bufferSize === 0) {
        this._buffer = data;
      } else {
        if (!this._buffer || this._buffer.length < this._bufferSize + data.length) {
          var newBuffer = new Uint8Array(this._bufferSize + data.length);
          if (this._buffer) {
            newBuffer.set(this._buffer);
          }
          this._buffer = newBuffer;
        }
        this._buffer.set(data, this._bufferSize);
      }
      this._bufferSize += data.length;
      this._bufferPosition = 0;

      var incomplete = false;
      do {
        var lastPosition = this._windowPosition;
        if (this._state === InflateState.INIT) {
          incomplete = this._decodeInitState();
          if (incomplete) {
            break;
          }
        }

        switch (this._state) {
          case InflateState.BLOCK_0:
            incomplete = this._decodeBlock0();
            break;
          case InflateState.BLOCK_2_PRE:
            incomplete = this._decodeBlock2Pre();
            if (incomplete) {
              break;
            }
          /* fall through */
          case InflateState.BLOCK_1:
          case InflateState.BLOCK_2:
            incomplete = this._decodeBlock();
            break;
          case InflateState.ERROR:
          case InflateState.DONE:
            // skipping all data
            this._bufferPosition = this._bufferSize;
            break;
          case InflateState.VERIFY_HEADER:
            incomplete = this._verifyZlibHeader();
            break;
        }

        var decoded = this._windowPosition - lastPosition;
        if (decoded > 0) {
          this.onData(this._window.subarray(lastPosition, this._windowPosition));
        }
        if (this._windowPosition >= WINDOW_SHIFT_POSITION) {
          // shift window
          if ('copyWithin' in this._buffer) {
            this._window['copyWithin'](0, this._windowPosition - WINDOW_SIZE, this._windowPosition);
          } else {
            this._window.set(this._window.subarray(this._windowPosition - WINDOW_SIZE,
                                                   this._windowPosition));
          }
          this._windowPosition = WINDOW_SIZE;
        }
      } while (!incomplete && this._bufferPosition < this._bufferSize);

      if (this._bufferPosition < this._bufferSize) {
        // shift buffer
        if ('copyWithin' in this._buffer) {
          this._buffer['copyWithin'](0, this._bufferPosition, this._bufferSize);
        } else {
          this._buffer.set(this._buffer.subarray(this._bufferPosition, this._bufferSize));
        }
        this._bufferSize -= this._bufferPosition;
      } else {
        this._bufferSize = 0;
      }
    }
    private _verifyZlibHeader(): boolean {
      var position = this._bufferPosition;
      if (position + 2 > this._bufferSize) {
        return true;
      }
      var buffer = this._buffer;
      var header = (buffer[position] << 8) | buffer[position + 1];
      this._bufferPosition = position + 2;
      var error: string = null;
      if ((header & 0x0f00) !== 0x0800) {
        error = 'inflate: unknown compression method';
      } else if ((header % 31) !== 0) {
        error = 'inflate: bad FCHECK';
      } else if ((header & 0x20) !== 0) {
        error = 'inflate: FDICT bit set';
      }
      if (error) {
        this._error = error;
        this._state = InflateState.ERROR;
      } else {
        this._state = InflateState.INIT;
      }
      return false;
    }
    private _decodeInitState(): boolean {
      if (this._isFinalBlock) {
        this._state = InflateState.DONE;
        return false;
      }

      var buffer = this._buffer, bufferSize = this._bufferSize;
      var bitBuffer = this._bitBuffer, bitLength = this._bitLength;
      var state;
      var position = this._bufferPosition;
      if (((bufferSize - position) << 3) + bitLength < 3) {
        return true;
      }
      if (bitLength < 3) {
        bitBuffer |= buffer[position++] << bitLength;
        bitLength += 8;
      }
      var type = bitBuffer & 7;
      bitBuffer >>= 3;
      bitLength -= 3;
      switch (type >> 1) {
        case 0:
          bitBuffer = 0;
          bitLength = 0;
          if (bufferSize - position < 4) {
            return true;
          }

          var length = buffer[position] | (buffer[position + 1] << 8);
          var length2 = buffer[position + 2] | (buffer[position + 3] << 8);
          position += 4;
          if ((length ^ length2) !== 0xFFFF) {
            this._error = 'inflate: invalid block 0 length';
            state = InflateState.ERROR;
            break;
          }

          if (length === 0) {
            state = InflateState.INIT;
          } else {
            this._block0Read = length;
            state = InflateState.BLOCK_0;
          }
          break;
        case 1:
          state = InflateState.BLOCK_1;
          this._literalTable = fixedLiteralTable;
          this._distanceTable = fixedDistanceTable;
          break;
        case 2:
          if (((bufferSize - position) << 3) + bitLength < 14 + 3 * 4) {
            return true;
          }
          while (bitLength < 14) {
            bitBuffer |= buffer[position++] << bitLength;
            bitLength += 8;
          }
          var numLengthCodes = ((bitBuffer >> 10) & 15) + 4;
          if (((bufferSize - position) << 3) + bitLength < 14 + 3 * numLengthCodes) {
            return true;
          }
          var block2State: DeflateBlock2State = {
            numLiteralCodes: (bitBuffer & 31) + 257,
            numDistanceCodes: ((bitBuffer >> 5) & 31) + 1,
            codeLengthTable: undefined,
            bitLengths: undefined,
            codesRead: 0,
            dupBits: 0
          };
          bitBuffer >>= 14;
          bitLength -= 14;
          var codeLengths = new Uint8Array(19);
          for (var i = 0; i < numLengthCodes; ++i) {
            if (bitLength < 3) {
              bitBuffer |= buffer[position++] << bitLength;
              bitLength += 8;
            }
            codeLengths[codeLengthOrder[i]] = bitBuffer & 7;
            bitBuffer >>= 3;
            bitLength -= 3;
          }
          for (; i < 19; i++) {
            codeLengths[codeLengthOrder[i]] = 0;
          }
          block2State.bitLengths =
            new Uint8Array(block2State.numLiteralCodes + block2State.numDistanceCodes);
          block2State.codeLengthTable = makeHuffmanTable(codeLengths);
          this._block2State = block2State;
          state = InflateState.BLOCK_2_PRE;
          break;
        default:
          this._error = 'inflate: unsupported block type';
          state = InflateState.ERROR;
          return false;
      }
      this._isFinalBlock = !!(type & 1);
      this._state = state;
      this._bufferPosition = position;
      this._bitBuffer = bitBuffer;
      this._bitLength = bitLength;
      return false;
    }
    private _decodeBlock0() {
      var position = this._bufferPosition;
      var windowPosition = this._windowPosition;
      var toRead = this._block0Read;
      var leftInWindow = MAX_WINDOW_SIZE - windowPosition;
      var leftInBuffer = this._bufferSize - position;
      var incomplete = leftInBuffer < toRead;
      var canFit = Math.min(leftInWindow, leftInBuffer, toRead);
      this._window.set(this._buffer.subarray(position, position + canFit),
        windowPosition);
      this._windowPosition = windowPosition + canFit;
      this._bufferPosition = position + canFit;
      this._block0Read = toRead - canFit;

      if (toRead === canFit) {
        this._state = InflateState.INIT;
        return false;
      }

      return incomplete && leftInWindow < leftInBuffer;
    }
    private _readBits(size) {
      var bitBuffer = this._bitBuffer;
      var bitLength = this._bitLength;
      if (size > bitLength) {
        var pos = this._bufferPosition;
        var end = this._bufferSize;
        do {
          if (pos >= end) {
            this._bufferPosition = pos;
            this._bitBuffer = bitBuffer;
            this._bitLength = bitLength;
            return -1;
          }
          bitBuffer |= this._buffer[pos++] << bitLength;
          bitLength += 8;
        } while (size > bitLength);
        this._bufferPosition = pos;
      }
      this._bitBuffer = bitBuffer >> size;
      this._bitLength = bitLength - size;
      return bitBuffer & ((1 << size) - 1);
    }
    private _readCode(codeTable) {
      var bitBuffer = this._bitBuffer;
      var bitLength = this._bitLength;
      var maxBits = codeTable.maxBits;
      if (maxBits > bitLength) {
        var pos = this._bufferPosition;
        var end = this._bufferSize;
        do {
          if (pos >= end) {
            this._bufferPosition = pos;
            this._bitBuffer = bitBuffer;
            this._bitLength = bitLength;
            return -1;
          }
          bitBuffer |= this._buffer[pos++] << bitLength;
          bitLength += 8;
        } while (maxBits > bitLength);
        this._bufferPosition = pos;
      }

      var code = codeTable.codes[bitBuffer & ((1 << maxBits) - 1)];
      var len = code >> 16;
      if ((code & 0x8000)) {
        this._error = 'inflate: invalid encoding';
        this._state = InflateState.ERROR;
        return -1;
      }

      this._bitBuffer = bitBuffer >> len;
      this._bitLength = bitLength - len;
      return code & 0xffff;
    }
    private _decodeBlock2Pre() {
      var block2State = this._block2State;
      var numCodes = block2State.numLiteralCodes + block2State.numDistanceCodes;
      var bitLengths = block2State.bitLengths;
      var i = block2State.codesRead;
      var prev = i > 0 ? bitLengths[i - 1] : 0;
      var codeLengthTable = block2State.codeLengthTable;
      var j;
      if (block2State.dupBits > 0) {
        j = this._readBits(block2State.dupBits);
        if (j < 0) {
          return true;
        }
        while (j--) {
          bitLengths[i++] = prev;
        }
        block2State.dupBits = 0;
      }
      while (i < numCodes) {
        var sym = this._readCode(codeLengthTable);
        if (sym < 0) {
          block2State.codesRead = i;
          return true;
        } else if (sym < 16) {
          bitLengths[i++] = (prev = sym);
          continue;
        }
        var j, dupBits;
        switch (sym) {
          case 16:
            dupBits = 2;
            j = 3;
            sym = prev;
            break;
          case 17:
            dupBits = 3;
            j = 3;
            sym = 0;
            break;
          case 18:
            dupBits = 7;
            j = 11;
            sym = 0;
            break;
        }
        while (j--) {
          bitLengths[i++] = sym;
        }
        j = this._readBits(dupBits);
        if (j < 0) {
          block2State.codesRead = i;
          block2State.dupBits = dupBits;
          return true;
        }
        while (j--) {
          bitLengths[i++] = sym;
        }
        prev = sym;
      }
      this._literalTable = makeHuffmanTable(bitLengths.subarray(0, block2State.numLiteralCodes));
      this._distanceTable = makeHuffmanTable(bitLengths.subarray(block2State.numLiteralCodes));
      this._state = InflateState.BLOCK_2;
      this._block2State = null;
      return false;
    }
    private _decodeBlock(): boolean {
      var literalTable = this._literalTable, distanceTable = this._distanceTable;
      var output = this._window, pos = this._windowPosition;
      var copyState = this._copyState;
      var i: number, j: number, sym: number;
      var len: number, lenBits: number, dist: number, distBits: number;

      if (copyState.state !== 0) {
        // continuing len/distance operation
        switch (copyState.state) {
          case 1:
            j = 0;
            if ((j = this._readBits(copyState.lenBits)) < 0) {
              return true;
            }
            copyState.len += j;
            copyState.state = 2;
          /* fall through */
          case 2:
            if ((sym = this._readCode(distanceTable)) < 0) {
              return true;
            }
            copyState.distBits = distanceExtraBits[sym];
            copyState.dist = distanceCodes[sym];
            copyState.state = 3;
          /* fall through */
          case 3:
            j = 0;
            if (copyState.distBits > 0 && (j = this._readBits(copyState.distBits)) < 0) {
              return true;
            }
            dist = copyState.dist + j;
            len = copyState.len;
            i = pos - dist;
            while (len--) {
              output[pos++] = output[i++];
            }
            copyState.state = 0;
            if (pos >= WINDOW_SHIFT_POSITION) {
              this._windowPosition = pos;
              return false;
            }
            break;
        }
      }

      do {
        sym = this._readCode(literalTable);
        if (sym < 0) {
          this._windowPosition = pos;
          return true;
        } else if (sym < 256) {
          output[pos++] = sym;
        } else if (sym > 256) {
          this._windowPosition = pos;
          sym -= 257;
          lenBits = lengthExtraBits[sym];
          len = lengthCodes[sym];
          j = lenBits === 0 ? 0 : this._readBits(lenBits);
          if (j < 0) {
            copyState.state = 1;
            copyState.len = len;
            copyState.lenBits = lenBits;
            return true;
          }
          len += j;
          sym = this._readCode(distanceTable);
          if (sym < 0) {
            copyState.state = 2;
            copyState.len = len;
            return true;
          }
          distBits = distanceExtraBits[sym];
          dist = distanceCodes[sym];
          j = distBits === 0 ? 0 : this._readBits(distBits);
          if (j < 0) {
            copyState.state = 3;
            copyState.len = len;
            copyState.dist = dist;
            copyState.distBits = distBits;
            return true;
          }
          dist += j;
          i = pos - dist;
          while (len--) {
            output[pos++] = output[i++];
          }
        } else {
          this._state = InflateState.INIT;
          break; // end of block
        }
      } while (pos < WINDOW_SHIFT_POSITION);
      this._windowPosition = pos;
      return false;
    }

    public static inflate(data: Uint8Array, expectedLength: number, zlibHeader: boolean): Uint8Array {
      var output = new Uint8Array(expectedLength);
      var position = 0;
      var inflate = new Inflate(zlibHeader);
      inflate.onData = function (data) {
        output.set(data, position);
        position += data.length;
      };
      inflate.push(data);
      return output;
    }
  }

  var codeLengthOrder: Uint8Array;
  var distanceCodes: Uint16Array;
  var distanceExtraBits: Uint8Array;
  var fixedDistanceTable: HuffmanTable;
  var lengthCodes: Uint16Array;
  var lengthExtraBits: Uint8Array;
  var fixedLiteralTable: HuffmanTable;

  var areTablesInitialized: boolean = false;

  function initializeTables() {
    codeLengthOrder = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);

    distanceCodes = new Uint16Array(30);
    distanceExtraBits = new Uint8Array(30);
    for (var i = 0, j = 0, code = 1; i < 30; ++i) {
      distanceCodes[i] = code;
      code += 1 << (distanceExtraBits[i] = ~~((j += (i > 2 ? 1 : 0)) / 2));
    }

    var bitLengths = new Uint8Array(288);
    for (var i = 0; i < 32; ++i) {
      bitLengths[i] = 5;
    }
    fixedDistanceTable = makeHuffmanTable(bitLengths.subarray(0, 32));

    lengthCodes = new Uint16Array(29);
    lengthExtraBits = new Uint8Array(29);
    for (var i = 0, j = 0, code = 3; i < 29; ++i) {
      lengthCodes[i] = code - (i == 28 ? 1 : 0);
      code += 1 << (lengthExtraBits[i] = ~~(((j += (i > 4 ? 1 : 0)) / 4) % 6));
    }
    for (var i = 0; i < 288; ++i) {
      bitLengths[i] = i < 144 || i > 279 ? 8 : (i < 256 ? 9 : 7);
    }
    fixedLiteralTable = makeHuffmanTable(bitLengths);
  }

  function makeHuffmanTable(bitLengths: Uint8Array): HuffmanTable {
    var maxBits = Math.max.apply(null, bitLengths);
    var numLengths = bitLengths.length;
    var size = 1 << maxBits;
    var codes = new Uint32Array(size);
    // avoiding len == 0: using max number of bits
    var dummyCode = (maxBits << 16) | 0xFFFF;
    for (var j = 0; j < size; j++) {
      codes[j] = dummyCode;
    }
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

  enum DeflateState {
    WRITE = 0,
    DONE = 1,
    ZLIB_HEADER = 2,
  }

  export class Adler32 {
    private a: number;
    private b: number;

    constructor() {
      this.a = 1;
      this.b = 0;
    }

    public update(data: Uint8Array, start: number, end: number) {
      var a = this.a;
      var b = this.b;
      for (var i = start; i < end; ++i) {
        a = (a + (data[i] & 0xff)) % 65521;
        b = (b + a) % 65521;
      }
      this.a = a;
      this.b = b;
    }

    public getChecksum() : number {
      return (this.b << 16) | this.a;
    }
  }

  export class Deflate {
    public onData: (data: Uint8Array) => void;

    private _writeZlibHeader: boolean;
    private _state: DeflateState;
    private _adler32: Adler32;

    constructor(writeZlibHeader: boolean) {
      this._writeZlibHeader = writeZlibHeader;
      this._state = writeZlibHeader ? DeflateState.ZLIB_HEADER : DeflateState.WRITE;
      this._adler32 = writeZlibHeader ? new Adler32() : null;
    }

    public push(data: Uint8Array) {
      if (this._state === DeflateState.ZLIB_HEADER) {
        this.onData(new Uint8Array([0x78, 0x9C]));
        this._state = DeflateState.WRITE;
      }
      // simple non-compressing algorithm for now
      var len = data.length;
      var outputSize = len + Math.ceil(len / 0xFFFF) * 5;
      var output = new Uint8Array(outputSize);
      var outputPos = 0;
      var pos = 0;
      while (len > 0xFFFF) {
        output.set(new Uint8Array([
          0x00,
          0xFF, 0xFF,
          0x00, 0x00
        ]), outputPos);
        outputPos += 5;
        output.set(data.subarray(pos, pos + 0xFFFF), outputPos);
        pos += 0xFFFF;
        outputPos += 0xFFFF;
        len -= 0xFFFF;
      }

      output.set(new Uint8Array([
        0x00,
        (len & 0xff), ((len >> 8) & 0xff),
        ((~len) & 0xff), (((~len) >> 8) & 0xff)
      ]), outputPos);
      outputPos += 5;
      output.set(data.subarray(pos, len), outputPos);

      this.onData(output);

      if (this._adler32) {
        this._adler32.update(data, 0, len);
      }
    }

    public finish() {
      this._state = DeflateState.DONE;
      this.onData(new Uint8Array([
        0x01,
        0x00, 0x00,
        0xFF, 0xFF
      ]));
      if (this._adler32) {
        var checksum = this._adler32.getChecksum();
        this.onData(new Uint8Array([
          checksum & 0xff, (checksum >> 8) & 0xff,
          (checksum >> 16) & 0xff, (checksum >>> 24) & 0xff
        ]));
      }
    }
  }
}
