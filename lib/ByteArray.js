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

;var ByteArray = ByteArray || (function (undefined) {
  /* The initial size of the backing, in bytes. Doubled every OOM. */
  ByteArrayClass.INITIAL_SIZE = 128;

  ByteArrayClass.DEFAULT_OBJECT_ENCODING = 3;

  function ByteArrayClass(bytes) {
    if (bytes instanceof ByteArray) {
      // HACK coercion to ByteArray (constructor is called as function from byte code)
      return bytes;
    }

    var initData = bytes || (this.symbol && this.symbol.data);
    if (initData) {
      this.a = new ArrayBuffer(initData.length);
      this.length = initData.length;
      new Uint8Array(this.a).set(initData);
    } else {
      this.a = new ArrayBuffer(ByteArrayClass.INITIAL_SIZE);
      this.length = 0;
    }
    this.position = 0;
    this.cacheViews();
    this.nativele = new Int8Array(new Int32Array([]).buffer)[0] === 1;
    this.le = this.nativele;
    this.objectEncoding = ByteArrayClass.DEFAULT_OBJECT_ENCODING;

    this.bitBuffer = 0;
    this.bitLength = 0;
  };

  function throwEOFError() {
    runtime.throwErrorFromVM("flash.errors.EOFError", "End of file was encountered.");
  }

  function throwRangeError() {
    var error = Errors.ParamRangeError;
    runtime.throwErrorFromVM("RangeError", getErrorMessage(error.code), error.code);
  }

  function throwCompressedDataError() {
    var error = Errors.CompressedDataError;
    runtime.throwErrorFromVM("CompressedDataError", getErrorMessage(error.code), error.code);
  }

  function checkRange(x, min, max) {
    if (x !== clamp(x, min, max)) {
      throwRangeError();
    }
  }

  function get(b, m, size) {
    if (b.position + size > b.length) {
      throwEOFError();
    }
    var v = b.view[m](b.position, b.le);
    b.position += size;
    return v;
  }

  function set(b, m, size, v) {
    var len = b.position + size;
    b.ensureCapacity(len);
    b.view[m](b.position, v, b.le);
    b.position = len;
    if (len > b.length) {
      b.length = len;
    }
  }

  var BAp = ByteArrayClass.prototype;

  BAp.cacheViews = function cacheViews() {
    var a = this.a;
    this.int8v  = new Int8Array(a);
    this.uint8v = new Uint8Array(a);
    this.view   = new DataView(a);
  };

  BAp.getBytes = function getBytes() {
    return new Uint8Array(this.a, 0, this.length);
  };

  BAp.ensureCapacity = function ensureCapacity(size) {
    var origa = this.a;
    if (origa.byteLength < size) {
      var newSize = origa.byteLength;
      while (newSize < size) {
        newSize *= 2;
      }
      var copya = new ArrayBuffer(newSize);
      var origv = this.int8v;
      this.a = copya;
      this.cacheViews();
      this.int8v.set(origv);
    }
  };

  BAp.clear = function clear() {
    this.length = 0;
    this.position = 0;
  };

  /**
   * For byte-sized reads and writes we can just go through the |Uint8Array| and not
   * the slower DataView.
   */
  BAp.readBoolean = function readBoolean() {
    if (this.position + 1 > this.length) {
      throwEOFError();
    }
    return this.int8v[this.position++] !== 0;
  };

  BAp.readByte = function readByte() {
    if (this.position + 1 > this.length) {
      throwEOFError();
    }
    return this.int8v[this.position++];
  };

  BAp.readUnsignedByte = function readUnsignedByte() {
    if (this.position + 1 > this.length) {
      throwEOFError();
    }
    return this.uint8v[this.position++];
  };

  BAp.readBytes = function readBytes(bytes, offset, length) {
    var pos = this.position;
    if (!offset) {
      offset = 0;
    }
    if (!length) {
      length = this.length - pos;
    }
    if (pos + length > this.length) {
      throwEOFError();
    }
    if (bytes.length < offset + length) {
      bytes.ensureCapacity(offset + length);
      bytes.length = offset + length;
    }
    bytes.int8v.set(new Int8Array(this.a, pos, length), offset);
    this.position += length;
  };

  BAp.writeBoolean = function writeBoolean(v) {
    var len = this.position + 1;
    this.ensureCapacity(len);
    this.int8v[this.position++] = v ? 1 : 0;
    if (len > this.length) {
      this.length = len;
    }
  };

  BAp.writeByte = function writeByte(v) {
    var len = this.position + 1;
    this.ensureCapacity(len);
    this.int8v[this.position++] = v;
    if (len > this.length) {
      this.length = len;
    }
  };

  BAp.writeUnsignedByte = function writeUnsignedByte(v) {
    var len = this.position + 1;
    this.ensureCapacity(len);
    this.uint8v[this.position++] = v;
    if (len > this.length) {
      this.length = len;
    }
  };

  BAp.writeRawBytes = function writeRawBytes(bytes) {
    var len = this.position + bytes.length;
    this.ensureCapacity(len);
    this.int8v.set(bytes, this.position);
    this.position = len;
    if (len > this.length) {
      this.length = len;
    }
  };

  BAp.readRawBytes = function readRawBytes() {
    return new Int8Array(this.a, 0, this.length);
  };

  BAp.writeBytes = function writeBytes(bytes, offset, length) {
    if (arguments.length < 2) {
      offset = 0;
    }
    if (arguments.length < 3) {
      length = 0;
    }
    checkRange(offset, 0, bytes.length);
    checkRange(offset + length, 0, bytes.length);
    if (length === 0) {
      length = bytes.length - offset;
    }
    this.writeRawBytes(new Int8Array(bytes.a, offset, length));
  };

  BAp.readDouble = function readDouble() { return get(this, 'getFloat64', 8); };
  BAp.readFloat = function readFloat() { return get(this, 'getFloat32', 4); };
  BAp.readInt = function readInt() { return get(this, 'getInt32', 4); };
  BAp.readShort = function readShort() { return get(this, 'getInt16', 2); };
  BAp.readUnsignedInt = function readUnsignedInt() { return get(this, 'getUint32', 4); };
  BAp.readUnsignedShort = function readUnsignedShort() { return get(this, 'getUint16', 2); };

  BAp.writeDouble = function writeDouble(v) { set(this, 'setFloat64', 8, v); };
  BAp.writeFloat = function writeFloat(v) { set(this, 'setFloat32', 4, v); };
  BAp.writeInt = function writeInt(v) { set(this, 'setInt32', 4, v); };
  BAp.writeShort = function writeShort(v) { set(this, 'setInt16', 2, v); };
  BAp.writeUnsignedInt = function writeUnsignedInt(v) { set(this, 'setUint32', 4, v); };
  BAp.writeUnsignedShort = function writeUnsignedShort(v) { set(this, 'setUint16', 2, v); };

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

  function makeHuffmanTable(bitLengths) {
    var maxBits = Math.max.apply(null, bitLengths);
    var numLengths = bitLengths.length;
    var size = 1 << maxBits;
    var codes = new Uint32Array(size);
    for (var code = 0, len = 1, skip = 2;
         len <= maxBits;
         code <<= 1, ++len, skip <<= 1)
    {
      for (var val = 0; val < numLengths; ++val) {
        if (bitLengths[val] === len) {
          var lsb = 0;
          for (var i = 0; i < len; ++i) {
            lsb = (lsb * 2) + ((code >> i) & 1);
          }
          for (var i = lsb; i < size; i += skip) {
            codes[i] = (len << 16) | val;
          }
          ++code;
        }
      }
    }
    return { codes: codes, maxBits: maxBits };
  }
  function inflateBlock(input, output) {
    var header = readBits(input, 3);
    switch (header >> 1) {
    case 0:
      input.bitBuffer = input.bitLength = 0;
      var len = input.readUnsignedShort();
      var nlen = input.readUnsignedShort();
      //assert((~nlen & 0xffff) === len, 'bad uncompressed block length', 'inflate');
      if ((~nlen & 0xffff) !== len) {
        throwCompressedDataError();
      }
      output.writeBytes(input, input.position, len);
      input.position += len;
      break;
    case 1:
      inflate(input, output, fixedLiteralTable, fixedDistanceTable);
      break;
    case 2:
      var bitLengths = [];
      var numLiteralCodes = readBits(input, 5) + 257;
      var numDistanceCodes = readBits(input, 5) + 1;
      var numCodes = numLiteralCodes + numDistanceCodes;
      var numLengthCodes = readBits(input, 4) + 4;
      for (var i = 0; i < 19; ++i) {
        bitLengths[codeLengthOrder[i]] = i < numLengthCodes ?
                                           readBits(input, 3) : 0;
      }
      var codeLengthTable = makeHuffmanTable(bitLengths);
      bitLengths = [];
      var i = 0;
      var prev = 0;
      while (i < numCodes) {
        var j = 1;
        var sym = readCode(input, codeLengthTable);
        switch(sym){
        case 16:
          j = readBits(input, 2) + 3;
          sym = prev;
          break;
        case 17:
          j = readBits(input, 3) + 3;
          sym = 0;
          break;
        case 18:
          j = readBits(input, 7) + 11;
          sym = 0;
          break;
        default:
          prev = sym;
        }
        while (j--) {
          bitLengths[i++] = sym;
        }
      }
      var distanceTable = makeHuffmanTable(bitLengths.splice(numLiteralCodes,
                                                             numDistanceCodes));
      var literalTable = makeHuffmanTable(bitLengths);
      inflate(input, output, literalTable, distanceTable);
      break;
    default:
       fail('unknown block type', 'inflate');
    }
  }
  function readBits(input, size) {
    var buffer = input.bitBuffer;
    var bufflen = input.bitLength;
    while (size > bufflen) {
      buffer |= input.readUnsignedByte() << bufflen;
      bufflen += 8;
    }
    input.bitBuffer = buffer >>> size;
    input.bitLength = bufflen - size;
    return buffer & ((1 << size) - 1);
  }
  function inflate(input, output, literalTable, distanceTable) {
    var sym;
    while ((sym = readCode(input, literalTable)) !== 256) {
      if (sym < 256) {
        output.writeUnsignedByte(sym);
      } else {
        sym -= 257;
        var len = lengthCodes[sym] + readBits(input, lengthExtraBits[sym]);
        sym = readCode(input, distanceTable);
        var distance = distanceCodes[sym] + readBits(input, distanceExtraBits[sym]);
        output.writeBytes(output, output.position - distance, len);
      }
    }
  }
  function readCode(input, codeTable) {
    var buffer = input.bitBuffer;
    var bitlen = input.bitLength;
    var maxBits = codeTable.maxBits;
    while (maxBits > bitlen) {
      buffer |= input.readUnsignedByte() << bitlen;
      bitlen += 8;
    }
    var code = codeTable.codes[buffer & ((1 << maxBits) - 1)];
    var len = code >> 16;
    //assert(len, 'bad encoding', 'inflate');
    if (!len) {
      throwCompressedDataError();
    }
    input.bitBuffer = buffer >>> len;
    input.bitLength = bitlen - len;
    return code & 0xffff;
  }

  function adler32(data, start, end) {
    var a = 1;
    var b = 0;
    for (var i = start; i < end; ++i) {
      a = (a + (data[i] & 0xff)) % 65521;
      b = (b + a) % 65521;
    }
    return (b << 16) | a;
  }

  BAp.compress = function (algorithm) {
    this.position = 0;

    var output = new ByteArray();
    switch (algorithm) {
      case 'zlib':
        output.writeUnsignedByte(0x78);
        output.writeUnsignedByte(0x9C);
      case 'deflate':
        output.le = true;

        var len = this.length;

        output.ensureCapacity(len + Math.ceil(len / 0xFFFF) * 5 + 4);

        while (len > 0xFFFF) {
          output.writeUnsignedByte(0x00);
          output.writeUnsignedShort(0xFFFF);
          output.writeUnsignedShort(0x0000);

          output.writeBytes(this, this.position, 0xFFFF);
          this.position += 0xFFFF;

          len -= 0xFFFF;
        }

        output.writeUnsignedByte(0x00);
        output.writeUnsignedShort(len);
        output.writeUnsignedShort(~len & 0xffff);

        output.writeBytes(this, this.position, len);

        if (algorithm === 'zlib') {
          output.writeUnsignedInt(adler32(this.uint8v, 0, this.length));
        }
        break;
      default:
        return;
    }

    this.ensureCapacity(output.uint8v.length);
    this.uint8v.set(output.uint8v);
    this.length = output.length;
    this.position = 0;
  };
  BAp.uncompress = function (algorithm) {
    var output = new ByteArray();
    switch (algorithm) {
      case 'zlib':
        var header = this.readUnsignedShort();
        if ((header & 0x0f00) !== 0x0800 ||
            (header % 31) !== 0 ||
            (header & 0x20)
        ) {
          throwCompressedDataError();
        }
      case 'deflate':
        var le = this.le;
        this.le = true;
        while (this.position < this.length - 6) {
          inflateBlock(this, output);
        }
        this.le = le;
        break;
      default:
        return;
    }

    this.ensureCapacity(output.uint8v.length);
    this.uint8v.set(output.uint8v);
    this.length = output.length;
    this.position = 0;
  };

  return ByteArrayClass;
}());
