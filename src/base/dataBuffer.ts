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

///<reference path='references.ts' />
module Shumway.ArrayUtilities {
  import notImplemented = Shumway.Debug.notImplemented;

  import utf8decode = Shumway.StringUtilities.utf8decode;
  import utf8encode = Shumway.StringUtilities.utf8encode;
  import clamp = Shumway.NumberUtilities.clamp;
  import swap16 = Shumway.IntegerUtilities.swap16;
  import swap32 = Shumway.IntegerUtilities.swap32;
  import floatToInt32 = Shumway.IntegerUtilities.floatToInt32;
  import int32ToFloat = Shumway.IntegerUtilities.int32ToFloat;

  function throwEOFError() {
    notImplemented("throwEOFError");
    // Runtime.throwErrorFromVM(AVM2.currentDomain(), "flash.errors.EOFError", "End of file was encountered.");
  }

  function throwRangeError() {
    notImplemented("throwRangeError");
    // var error = Errors.ParamRangeError;
    // Runtime.throwErrorFromVM("RangeError", getErrorMessage(error.code), error.code);
  }

  function throwCompressedDataError() {
    notImplemented("throwCompressedDataError");
//    var error = Errors.CompressedDataError;
//    Runtime.throwErrorFromVM("CompressedDataError", getErrorMessage(error.code), error.code);
  }

  function checkRange(x: number, min: number, max: number) {
    if (x !== clamp(x, min, max)) {
      throwRangeError();
    }
  }

  function asCoerceString(x): string {
    if (typeof x === "string") {
      return x;
    } else if (x == undefined) {
      return null;
    }
    return x + '';
  }

  export interface IDataInput {
    readBytes: (bytes: DataBuffer, offset?: number /*uint*/, length?: number /*uint*/) => void;
    readBoolean: () => boolean;
    readByte: () => number /*int*/;
    readUnsignedByte: () => number /*uint*/;
    readShort: () => number /*int*/;
    readUnsignedShort: () => number /*uint*/;
    readInt: () => number /*int*/;
    readUnsignedInt: () => number /*uint*/;
    readFloat: () => number;
    readDouble: () => number;
    readMultiByte: (length: number /*uint*/, charSet: string) => string;
    readUTF: () => string;
    readUTFBytes: (length: number /*uint*/) => string;
    bytesAvailable: number /*uint*/;
    objectEncoding: number /*uint*/;
    endian: string;
  }

  export interface IDataOutput {
    writeBytes: (bytes: DataBuffer, offset?: number /*uint*/, length?: number /*uint*/) => void;
    writeBoolean: (value: boolean) => void;
    writeByte: (value: number /*int*/) => void;
    writeShort: (value: number /*int*/) => void;
    writeInt: (value: number /*int*/) => void;
    writeUnsignedInt: (value: number /*uint*/) => void;
    writeFloat: (value: number) => void;
    writeDouble: (value: number) => void;
    writeMultiByte: (value: string, charSet: string) => void;
    writeUTF: (value: string) => void;
    writeUTFBytes: (value: string) => void;
    objectEncoding: number /*uint*/;
    endian: string;
  }

  export class PlainObjectDataBuffer {
    constructor(public buffer: ArrayBuffer, public length: number, public littleEndian: boolean) {
    }
  }

  var bitMasks = new Uint32Array(33);
  for (var i = 1, mask = 0; i <= 32; i++) {
    bitMasks[i] = mask = (mask << 1) | 1;
  }

  export class DataBuffer implements IDataInput, IDataOutput {
    private static _nativeLittleEndian = new Int8Array(new Int32Array([1]).buffer)[0] === 1;

    /* The initial size of the backing, in bytes. Doubled every OOM. */
    private static INITIAL_SIZE = 128;

    private _buffer: ArrayBuffer;
    private _length: number;
    private _position: number;
    private _littleEndian: boolean;
    private _objectEncoding: number;
    private _i8View: Int8Array;
    private _u8View: Uint8Array;
    private _i32View: Int32Array;
    private _dataView: DataView;

    private _bitBuffer: number;
    private _bitLength: number;

    private static _arrayBufferPool = new ArrayBufferPool();
    
    constructor(initialSize: number = DataBuffer.INITIAL_SIZE) {
      this._buffer = new ArrayBuffer(initialSize);
      this._length = 0;
      this._position = 0;
      this._updateViews();
      this._littleEndian = false; // AS3 is bigEndian by default.
      this._bitBuffer = 0;
      this._bitLength = 0;
    }

    static FromArrayBuffer(buffer: ArrayBuffer, length: number = -1) : DataBuffer {
      var dataBuffer: DataBuffer = Object.create(DataBuffer.prototype);
      dataBuffer._buffer = buffer;
      dataBuffer._length = length === -1 ? buffer.byteLength : length;
      dataBuffer._position = 0;
      dataBuffer._updateViews();
      dataBuffer._littleEndian = false; // AS3 is bigEndian by default.
      dataBuffer._bitBuffer = 0;
      dataBuffer._bitLength = 0;
      return dataBuffer;
    }

    static FromPlainObject(source: PlainObjectDataBuffer): DataBuffer {
      var dataBuffer = DataBuffer.FromArrayBuffer(source.buffer, source.length);
      dataBuffer._littleEndian = source.littleEndian;
      return dataBuffer;
    }

    toPlainObject(): PlainObjectDataBuffer {
      return new PlainObjectDataBuffer(this._buffer, this._length, this._littleEndian);
    }

    private _get(m: string, size: number) {
      if (this._position + size > this._length) {
        throwEOFError();
      }
      var v = this._dataView[m](this._position, this._littleEndian);
      this._position += size;
      return v;
    }

    private _set(m: string, size: number, v: any) {
      var length = this._position + size;
      this._ensureCapacity(length);
      this._dataView[m](this._position, v, this._littleEndian);
      this._position = length;
      if (length > this._length) {
        this._length = length;
      }
    }

    private _updateViews() {
      this._i8View = new Int8Array(this._buffer);
      this._u8View = new Uint8Array(this._buffer);
      if ((this._buffer.byteLength & 0x3) === 0) {
        this._i32View = new Int32Array(this._buffer);
      }
      this._dataView = new DataView(this._buffer);
    }

    getBytes(): Uint8Array {
      return new Uint8Array(this._buffer, 0, this._length);
    }

    private _ensureCapacity(length: number) {
      var currentBuffer = this._buffer;
      if (currentBuffer.byteLength < length) {
        var newLength = Math.max(currentBuffer.byteLength, 1);
        while (newLength < length) {
          newLength *= 2;
        }
        var newBuffer = DataBuffer._arrayBufferPool.acquire(newLength);
        var curentView = this._i8View;
        this._buffer = newBuffer;
        this._updateViews();
        this._i8View.set(curentView);
        DataBuffer._arrayBufferPool.release(currentBuffer);
      }
    }

    clear() {
      this._length = 0;
      this._position = 0;
    }

    /**
     * For byte-sized reads and writes we can just go through the |Uint8Array| and not
     * the slower DataView.
     */

    readBoolean(): boolean {
      if (this._position + 1 > this._length) {
        throwEOFError();
      }
      return this._i8View[this._position++] !== 0;
    }

    readByte(): number /*int*/ {
      if (this._position + 1 > this._length) {
        throwEOFError();
      }
      return this._i8View[this._position++];
    }

    readUnsignedByte(): number /*uint*/ {
      if (this._position + 1 > this._length) {
        throwEOFError();
      }
      return this._u8View[this._position++];
    }

    readBytes(bytes: DataBuffer, offset: number /*uint*/ = 0, length: number /*uint*/ = 0): void {
      var pos = this._position;
      if (!offset) {
        offset = 0;
      }
      if (!length) {
        length = this._length - pos;
      }
      if (pos + length > this._length) {
        throwEOFError();
      }
      if (bytes.length < offset + length) {
        bytes._ensureCapacity(offset + length);
        bytes.length = offset + length;
      }
      bytes._i8View.set(new Int8Array(this._buffer, pos, length), offset);
      this._position += length;
    }

    readShort(): number /*int*/ {
      return this._get('getInt16', 2);
    }

    readUnsignedShort(): number /*uint*/ {
      return this._get('getUint16', 2);
    }

    readInt(): number /*int*/ {
      if ((this._position & 0x3) === 0 && this._i32View) {
        if (this._position + 4 > this._length) {
          throwEOFError();
        }
        var value = this._i32View[this._position >> 2];
        this._position += 4;
        if (this._littleEndian !== DataBuffer._nativeLittleEndian) {
          value = swap32(value);
        }
        return value;
      } else {
        return this._get('getInt32', 4);
      }
    }

    readUnsignedInt(): number /*uint*/ {
      return this._get('getUint32', 4);
    }

    readFloat(): number {
      if ((this._position & 0x3) === 0 && this._i32View) {
        if (this._position + 4 > this._length) {
          throwEOFError();
        }
        var bytes = this._i32View[this._position >> 2];
        if (this._littleEndian !== DataBuffer._nativeLittleEndian) {
          bytes = swap32(bytes);
        }
        var value = int32ToFloat(bytes);
        this._position += 4;
        return value;
      } else {
        return this._get('getFloat32', 4);
      }
    }

    readDouble(): number {
      return this._get('getFloat64', 8);
    }

    writeBoolean(value: boolean): void {
      value = !!value;
      var length = this._position + 1;
      this._ensureCapacity(length);
      this._i8View[this._position++] = value ? 1 : 0;
      if (length > this._length) {
        this._length = length;
      }
    }

    writeByte(value: number /*int*/): void {
      var length = this._position + 1;
      this._ensureCapacity(length);
      this._i8View[this._position++] = value;
      if (length > this._length) {
        this._length = length;
      }
    }

    writeUnsignedByte(value: number /*uint*/): void {
      var length = this._position + 1;
      this._ensureCapacity(length);
      this._u8View[this._position++] = value;
      if (length > this._length) {
        this._length = length;
      }
    }

    writeRawBytes(bytes: Uint8Array): void {
      var length = this._position + bytes.length;
      this._ensureCapacity(length);
      this._i8View.set(bytes, this._position);
      this._position = length;
      if (length > this._length) {
        this._length = length;
      }
    }

    writeBytes(bytes: DataBuffer, offset: number /*uint*/ = 0, length: number /*uint*/ = 0): void {
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
      this.writeRawBytes(new Int8Array(bytes._buffer, offset, length));
    }

    writeShort(value: number /*int*/): void {
      this._set('setInt16', 2, value);
    }

    writeUnsignedShort(value: number /*uint*/): void {
      this._set('setUint16', 2, value);
    }

    writeInt(value: number /*int*/): void {
      if ((this._position & 0x3) === 0 && this._i32View) {
        if (this._littleEndian !== DataBuffer._nativeLittleEndian) {
          value = swap32(value);
        }
        var length = this._position + 4;
        this._ensureCapacity(length);
        this._i32View[this._position >> 2] = value;
        this._position += 4;
        if (length > this._length) {
          this._length = length;
        }
      } else {
        this._set('setInt32', 4, value);
      }
    }

    writeUnsignedInt(value: number /*uint*/): void {
      this._set('setUint32', 4, value);
    }

    writeFloat(value: number): void {
      if ((this._position & 0x3) === 0 && this._i32View) {
        var length = this._position + 4;
        this._ensureCapacity(length);
        var bytes = floatToInt32(value);
        if (this._littleEndian !== DataBuffer._nativeLittleEndian) {
          bytes = swap32(bytes);
        }
        this._i32View[this._position >> 2] = bytes;
        this._position += 4;
        if (length > this._length) {
          this._length = length;
        }
      } else {
        this._set('setFloat32', 4, value);
      }
    }

    writeDouble(value: number): void {
      this._set('setFloat64', 8, value);
    }

    readRawBytes(): Int8Array {
      return new Int8Array(this._buffer, 0, this._length);
    }

    writeUTF(value: string): void {
      value = asCoerceString(value);
      var bytes = utf8decode(value);
      this.writeShort(bytes.length);
      this.writeRawBytes(bytes);
    }

    writeUTFBytes(value: string): void {
      value = asCoerceString(value);
      var bytes = utf8decode(value);
      this.writeRawBytes(bytes);
    }

    readUTF(): string {
      return this.readUTFBytes(this.readShort());
    }

    readUTFBytes(length: number /*uint*/): string {
      length = length >>> 0;
      var pos = this._position;
      if (pos + length > this._length) {
        throwEOFError();
      }
      this._position += length;
      return utf8encode(new Int8Array(this._buffer, pos, length));
    }

    get length(): number /*uint*/ {
      return this._length;
    }

    set length(value: number /*uint*/) {
      value = value >>> 0;
      var capacity = this._buffer.byteLength;
      /* XXX: Do we need to zero the difference if length <= cap? */
      if (value > capacity) {
        this._ensureCapacity(value);
      }
      this._length = value;
      this._position = clamp(this._position, 0, this._length);
    }

    get bytesAvailable(): number /*uint*/ {
      return this._length - this._position;
    }

    get position(): number /*uint*/ {
      return this._position;
    }

    get buffer(): ArrayBuffer {
      return this._buffer;
    }

    get bytes(): Uint8Array {
      return this._u8View;
    }

    get ints(): Int32Array {
      return this._i32View;
    }

    set position(position: number /*uint*/) {
      this._position = position >>> 0;
    }

    get objectEncoding(): number /*uint*/ {
      return this._objectEncoding;
    }

    set objectEncoding(version: number /*uint*/) {
      version = version >>> 0;
      this._objectEncoding = version;
    }

    get endian(): string {
      return this._littleEndian ? "littleEndian" : "bigEndian";
    }

    set endian(type: string) {
      type = asCoerceString(type);
      if (type === "auto") {
        this._littleEndian = DataBuffer._nativeLittleEndian;
      } else {
        this._littleEndian = type === "littleEndian";
      }
    }

    toString(): string {
      return utf8encode(new Int8Array(this._buffer, 0, this._length));
    }

    toBlob(): Blob {
      return new Blob([new Int8Array(this._buffer, this._position, this._length)]);
    }

    writeMultiByte(value: string, charSet: string): void {
      value = asCoerceString(value); charSet = asCoerceString(charSet);
      notImplemented("packageInternal flash.utils.ObjectOutput::writeMultiByte"); return;
    }

    readMultiByte(length: number /*uint*/, charSet: string): string {
      length = length >>> 0; charSet = asCoerceString(charSet);
      notImplemented("packageInternal flash.utils.ObjectInput::readMultiByte"); return;
    }

    getValue(name: number): any {
      name = name | 0;
      if (name >= this._length) {
        return undefined;
      }
      return this._u8View[name];
    }

    setValue(name: number, value: any) {
      name = name | 0;
      var length = name + 1;
      this._ensureCapacity(length);
      this._u8View[name] = value;
      if (length > this._length) {
        this._length = length;
      }
    }

    readFixed(): number {
      return this.readInt() / 65536;
    }

    readFixed8(): number {
      return this.readShort() / 256;
    }

    readFloat16(): number {
      var uint16 = this.readUnsignedShort();
      var sign = uint16 >> 15 ? -1 : 1;
      var exponent = (uint16 & 0x7c00) >> 10;
      var fraction = uint16 & 0x03ff;
      if (!exponent) {
        return sign * Math.pow(2, -14) * (fraction / 1024);
      }
      if (exponent === 0x1f) {
        return fraction ? NaN : sign * Infinity;
      }
      return sign * Math.pow(2, exponent - 15) * (1 + (fraction / 1024));
    }

    readEncodedU32(): number {
      var value = this.readUnsignedByte();
      if (!(value & 0x080)) {
        return value;
      }
      value |= this.readUnsignedByte() << 7;
      if (!(value & 0x4000)) {
        return value;
      }
      value |= this.readUnsignedByte() << 14;
      if (!(value & 0x200000)) {
        return value;
      }
      value |= this.readUnsignedByte() << 21;
      if (!(value & 0x10000000)) {
        return value;
      }
      return value | (this.readUnsignedByte() << 28);
    }

    readBits(size: number): number {
      return (this.readUnsignedBits(size) << (32 - size)) >> (32 - size);
    }

    readUnsignedBits(size: number): number {
      var buffer = this._bitBuffer;
      var length = this._bitLength;
      while (size > length) {
        buffer = (buffer << 8) | this.readUnsignedByte();
        length += 8;
      }
      length -= size;
      var value = (buffer >>> length) & bitMasks[size];
      this._bitBuffer = buffer;
      this._bitLength = length;
      return value;
    }

    readFixedBits(size: number): number {
      return this.readBits(size) / 65536;
    }

    readString(length?: number): string {
      var position = this._position;
      if (length) {
        if (position + length > this._length) {
          throwEOFError();
        }
        this._position += length;
      } else {
        length = 0;
        for (var i = position; i < this._length && this._u8View[i]; i++) {
          length++;
        }
        this._position += length + 1;
      }
      return utf8encode(new Int8Array(this._buffer, position, length));
    }

    align() {
      this._bitBuffer = 0;
      this._bitLength = 0;
    }

    /*
     * Inflate / Deflate Support
     *
     * TODO: Perhaps this code should be moved outside of this class in the future. I couldn't take it out
     * easily because it is tightly coupled with ByteArrays.
     */

    private static _codeLengthOrder = null;
    private static _distanceCodes = null;
    private static _distanceExtraBits = null;

    private static _fixedLiteralTable = null;
    private static _fixedDistanceTable = null;

    private static _lengthCodes = null;
    private static _lengthExtraBits = null;

    /**
     * Construct tables lazily only if needed in order to avoid startup cost.
     */
    private static _initializeTables() {
      if (DataBuffer._codeLengthOrder) {
        return;
      }

      DataBuffer._codeLengthOrder = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
      DataBuffer._distanceCodes = [];
      DataBuffer._distanceExtraBits = [];

      for (var i = 0, j = 0, code = 1; i < 30; ++i) {
        DataBuffer._distanceCodes[i] = code;
        code += 1 << (DataBuffer._distanceExtraBits[i] = ~~((j += (i > 2 ? 1 : 0)) / 2));
      }

      var bitLengths = [];
      for (var i = 0; i < 32; ++i) {
        bitLengths[i] = 5;
      }

      DataBuffer._fixedDistanceTable = DataBuffer._makeHuffmanTable(bitLengths);

      DataBuffer._lengthCodes = [];
      DataBuffer._lengthExtraBits = [];
      for (var i = 0, j = 0, code = 3; i < 29; ++i) {
        DataBuffer._lengthCodes[i] = code - (i == 28 ? 1 : 0);
        code += 1 << (DataBuffer._lengthExtraBits[i] = ~~(((j += (i > 4 ? 1 : 0)) / 4) % 6));
      }

      for (var i = 0; i < 288; ++i) {
        bitLengths[i] = i < 144 || i > 279 ? 8 : (i < 256 ? 9 : 7);
      }

      DataBuffer._fixedLiteralTable = DataBuffer._makeHuffmanTable(bitLengths);
    }

    private static _makeHuffmanTable(bitLengths: number []) {
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

    private static readBitsMSB(input: DataBuffer, size: number) {
      var buffer = input._bitBuffer;
      var bufflen = input._bitLength;
      while (size > bufflen) {
        buffer |= input.readUnsignedByte() << bufflen;
        bufflen += 8;
      }
      input._bitBuffer = buffer >>> size;
      input._bitLength = bufflen - size;
      return buffer & ((1 << size) - 1);
    }

    private static inflateBlock(input: DataBuffer, output: DataBuffer) {
      var readBits = DataBuffer.readBitsMSB;
      var header = readBits(input, 3);
      switch (header >> 1) {
        case 0:
          input._bitBuffer = input._bitLength = 0;
          var len = input.readUnsignedShort();
          var nlen = input.readUnsignedShort();
          // release || assert((~nlen & 0xffff) === len, 'bad uncompressed block length', 'inflate');
          if ((~nlen & 0xffff) !== len) {
            throwCompressedDataError();
          }
          output.writeBytes(input, input.position, len);
          input.position += len;
          break;
        case 1:
          DataBuffer.inflate(input, output, DataBuffer._fixedLiteralTable, DataBuffer._fixedDistanceTable);
          break;
        case 2:
          var bitLength = [];
          var numLiteralCodes = readBits(input, 5) + 257;
          var numDistanceCodes = readBits(input, 5) + 1;
          var numCodes = numLiteralCodes + numDistanceCodes;
          var numLengthCodes = readBits(input, 4) + 4;
          for (var i = 0; i < 19; ++i) {
            bitLength[DataBuffer._codeLengthOrder[i]] = i < numLengthCodes ?
              readBits(input, 3) : 0;
          }
          var codeLengthTable = DataBuffer._makeHuffmanTable(bitLength);
          bitLength = [];
          var i = 0;
          var prev = 0;
          while (i < numCodes) {
            var j = 1;
            var sym = DataBuffer.readCode(input, codeLengthTable);
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
              bitLength[i++] = sym;
            }
          }
          var distanceTable = DataBuffer._makeHuffmanTable(bitLength.splice(numLiteralCodes,
            numDistanceCodes));
          var literalTable = DataBuffer._makeHuffmanTable(bitLength);
          DataBuffer.inflate(input, output, literalTable, distanceTable);
          break;
        default:
          Shumway.Debug.unexpected('unknown block type: inflate');
      }
    }

    static inflate(input: DataBuffer, output: DataBuffer, literalTable, distanceTable) {
      var readBits = DataBuffer.readBitsMSB;
      var readCode = DataBuffer.readCode;
      var lengthCodes = DataBuffer._lengthCodes;
      var lengthExtraBits = DataBuffer._lengthExtraBits;
      var distanceCodes = DataBuffer._distanceCodes;
      var distanceExtraBits = DataBuffer._distanceExtraBits;

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

    static readCode(input: DataBuffer, codeTable): number {
      var buffer = input._bitBuffer;
      var bitlen = input._bitLength;
      var maxBits = codeTable.maxBits;
      while (maxBits > bitlen) {
        buffer |= input.readUnsignedByte() << bitlen;
        bitlen += 8;
      }
      var code = codeTable.codes[buffer & ((1 << maxBits) - 1)];
      var len = code >> 16;
      //release || assert(len, 'bad encoding', 'inflate');
      if (!len) {
        throwCompressedDataError();
      }
      input._bitBuffer = buffer >>> len;
      input._bitLength = bitlen - len;
      return code & 0xffff;
    }

    static adler32(data, start, end): number {
      var a = 1;
      var b = 0;
      for (var i = start; i < end; ++i) {
        a = (a + (data[i] & 0xff)) % 65521;
        b = (b + a) % 65521;
      }
      return (b << 16) | a;
    }

    private _compress(algorithm: string): void {
      algorithm = asCoerceString(algorithm);
      DataBuffer._initializeTables();

      this._position = 0;
      var output = new DataBuffer();
      switch (algorithm) {
        case 'zlib':
          output.writeUnsignedByte(0x78);
          output.writeUnsignedByte(0x9C);
        case 'deflate':
          output._littleEndian = true;

          var len = this.length;

          output._ensureCapacity(len + Math.ceil(len / 0xFFFF) * 5 + 4);

          while (len > 0xFFFF) {
            output.writeUnsignedByte(0x00);
            output.writeUnsignedShort(0xFFFF);
            output.writeUnsignedShort(0x0000);

            output.writeBytes(this, this._position, 0xFFFF);
            this._position += 0xFFFF;

            len -= 0xFFFF;
          }

          output.writeUnsignedByte(0x00);
          output.writeUnsignedShort(len);
          output.writeUnsignedShort(~len & 0xffff);

          output.writeBytes(this, this._position, len);

          if (algorithm === 'zlib') {
            output.writeUnsignedInt(DataBuffer.adler32(this._u8View, 0, this.length));
          }
          break;
        default:
          return;
      }

      this._ensureCapacity(output._u8View.length);
      this._u8View.set(output._u8View);
      this.length = output.length;
      this._position = 0;
    }

    private _uncompress(algorithm: string): void {
      algorithm = asCoerceString(algorithm);
      DataBuffer._initializeTables();

      var output = new DataBuffer();
      switch (algorithm) {
        case 'zlib':
          var header = this.readUnsignedShort();
          if ((header & 0x0f00) !== 0x0800 ||
            (header % 31) !== 0 ||
            (header & 0x20)) {
            throwCompressedDataError();
          }
        case 'deflate':
          var littleEndian = this._littleEndian;
          this._littleEndian = true;
          while (this._position < this.length - 6) {
            DataBuffer.inflateBlock(this, output);
          }
          this._littleEndian = littleEndian;
          break;
        default:
          return;
      }

      this._ensureCapacity(output._u8View.length);
      this._u8View.set(output._u8View);
      this.length = output.length;
      this._position = 0;
    }

  }
}
