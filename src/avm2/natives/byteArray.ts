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
///<reference path='../references.ts' />

module Shumway.AVM2.AS {
  import assertNotImplemented = Shumway.Debug.assertNotImplemented;
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
  import Namespace = Shumway.AVM2.ABC.Namespace;
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import throwError = Shumway.AVM2.Runtime.throwError;

  import utf8decode = Shumway.StringUtilities.utf8decode;
  import utf8encode = Shumway.StringUtilities.utf8encode;
  import clamp = Shumway.NumberUtilities.clamp;

  function throwEOFError() {
    notImplemented("throwEOFError");
    // Runtime.throwErrorFromVM(AVM2.currentDomain(), "flash.errors.EOFError", "End of file was encountered.");
  }

  function throwRangeError() {
    notImplemented("throwEOFError");
    // var error = Errors.ParamRangeError;
    // Runtime.throwErrorFromVM("RangeError", getErrorMessage(error.code), error.code);
  }

  function throwCompressedDataError() {
    notImplemented("throwEOFError");
//    var error = Errors.CompressedDataError;
//    Runtime.throwErrorFromVM("CompressedDataError", getErrorMessage(error.code), error.code);
  }

  function checkRange(x: number, min: number, max: number) {
    if (x !== clamp(x, min, max)) {
      throwRangeError();
    }
  }


  declare var AMFUtils;

  export module flash.net {
    export class ObjectEncoding extends ASNative {
      public static AMF0 = 0;
      public static AMF3 = 3;
      public static DEFAULT = ObjectEncoding.AMF3;
    }
  }

  export module flash.utils {
    var _asGetProperty = Object.prototype.asGetProperty;
    var _asSetProperty = Object.prototype.asSetProperty;
    var _asCallProperty = Object.prototype.asCallProperty;
    var _asHasProperty = Object.prototype.asHasProperty;
    var _asHasOwnProperty = Object.prototype.asHasOwnProperty;
    var _asHasTraitProperty = Object.prototype.asHasTraitProperty;
    var _asDeleteProperty = Object.prototype.asDeleteProperty;


    export class ByteArray extends ASNative {

      static instanceConstructor = ByteArray;
      static protocol: IProtocol = ByteArray.prototype;

      /* The initial size of the backing, in bytes. Doubled every OOM. */
      private static INITIAL_SIZE = 128;

      private static _defaultObjectEncoding: number = flash.net.ObjectEncoding.DEFAULT;

      static get defaultObjectEncoding(): number /*uint*/ {
        return this._defaultObjectEncoding;
      }

      static set defaultObjectEncoding(version: number /*uint*/) {
        version = version >>> 0;
        this._defaultObjectEncoding = version;
      }

      private static _nativeLittleEndian = new Int8Array(new Int32Array([]).buffer)[0] === 1;

      private _buffer: ArrayBuffer;
      private _length: number;
      private _position: number;
      private _nativeLittleEndian: boolean;
      private _littleEndian: boolean;
      private _objectEncoding: number;
      private _i8View: Int8Array;
      private _u8View: Uint8Array;
      private _dataView: DataView;

      private _bitBuffer: number;
      private _bitLength: number;

      constructor() {
        false && super();
        this._buffer = new ArrayBuffer(ByteArray.INITIAL_SIZE);
        this._length = 0;
        this._position = 0;
        this.cacheViews();
        this._nativeLittleEndian = ByteArray._nativeLittleEndian;
        this._objectEncoding = ByteArray.defaultObjectEncoding;
        
        this._bitBuffer = 0;
        this._bitLength = 0;
      }

      private _get(m: string, size: number) {
        if (this.position + size > this._length) {
          throwEOFError();
        }
        var v = this._dataView[m](this.position, this._littleEndian);
        this.position += size;
        return v;
      }

      private _set(m: string, size: number, v: any) {
        var len = this.position + size;
        this.ensureCapacity(len);
        this._dataView[m](this.position, v, this._littleEndian);
        this.position = len;
        if (len > this._length) {
          this._length = len;
        }
      }

      cacheViews() {
        this._i8View  = new Int8Array(this._buffer);
        this._u8View = new Uint8Array(this._buffer);
        this._dataView   = new DataView(this._buffer);
      }

      getBytes(): Uint8Array {
        return new Uint8Array(this._buffer, 0, this._length);
      }

      ensureCapacity(size) {
        var origa = this._buffer;
        if (origa.byteLength < size) {
          var newSize = origa.byteLength;
          while (newSize < size) {
            newSize *= 2;
          }
          var copya = new ArrayBuffer(newSize);
          var origv = this._i8View;
          this._buffer = copya;
          this.cacheViews();
          this._i8View.set(origv);
        }
      }

      clear() {
        this._length = 0;
        this.position = 0;
      }

      /**
       * For byte-sized reads and writes we can just go through the |Uint8Array| and not
       * the slower DataView.
       */

      readBoolean(): boolean {
        if (this.position + 1 > this._length) {
          throwEOFError();
        }
        return this._i8View[this.position++] !== 0;
      }

      readByte(): number /*int*/ {
        if (this.position + 1 > this._length) {
          throwEOFError();
        }
        return this._i8View[this.position++];
      }

      readUnsignedByte(): number /*uint*/ {
        if (this.position + 1 > this._length) {
          throwEOFError();
        }
        return this._u8View[this.position++];
      }

      readBytes(bytes: flash.utils.ByteArray, offset: number /*uint*/ = 0, length: number /*uint*/ = 0): void {
        var pos = this.position;
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
          bytes.ensureCapacity(offset + length);
          bytes.length = offset + length;
        }
        bytes._i8View.set(new Int8Array(this._buffer, pos, length), offset);
        this.position += length;
      }

      readDouble(): number {
        return this._get('getFloat64', 8);
      }

      readFloat(): number {
        return this._get('getFloat32', 4);
      }

      readInt(): number /*int*/ {
        return this._get('getInt32', 4);
      }

      readUnsignedInt(): number /*uint*/ {
        return this._get('getUint32', 4);
      }

      readShort(): number /*int*/ {
        return this._get('getInt16', 2);
      }

      readUnsignedShort(): number /*uint*/ {
        return this._get('getUint16', 2);
      }

      writeBoolean(value: boolean): void {
        var len = this.position + 1;
        this.ensureCapacity(len);
        this._i8View[this.position++] = value ? 1 : 0;
        if (len > this._length) {
          this._length = len;
        }
      }

      writeByte(value: number /*int*/): void {
        var len = this.position + 1;
        this.ensureCapacity(len);
        this._i8View[this.position++] = value;
        if (len > this._length) {
          this._length = len;
        }
      }

      writeUnsignedByte(value: number /*uint*/): void {
        var len = this.position + 1;
        this.ensureCapacity(len);
        this._u8View[this.position++] = value;
        if (len > this._length) {
          this._length = len;
        }
      }

      writeRawBytes(bytes: Uint8Array): void {
        var len = this.position + bytes.length;
        this.ensureCapacity(len);
        this._i8View.set(bytes, this.position);
        this.position = len;
        if (len > this._length) {
          this._length = len;
        }
      }

      readRawBytes() {
        return new Int8Array(this._buffer, 0, this._length);
      }

      writeBytes(bytes: flash.utils.ByteArray, offset: number /*uint*/ = 0, length: number /*uint*/ = 0): void {
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

      writeDouble(value: number): void {
        this._set('setFloat64', 8, value);
      }

      writeFloat(value: number): void {
        this._set('setFloat32', 4, value);
      }

      writeInt(value: number /*int*/): void {
        this._set('setInt32', 4, value);
      }

      writeShort(value: number /*int*/): void {
        this._set('setInt16', 2, value);
      }

      writeUnsignedInt(value: number /*uint*/): void {
        this._set('setUint32', 4, value);
      }

      writeUnsignedShort(value: number /*uint*/): void {
        this._set('setUint16', 2, value);
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
        var pos = this.position;
        if (pos + length > this._length) {
          throwEOFError();
        }
        this.position += length;
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
          this.ensureCapacity(value);
        }
        this._length = value;
        this.position = clamp(this.position, 0, this._length);
      }

      writeObject(object: any): void {
        return AMFUtils.encodings[this.objectEncoding].write(this, object);
      }

      readObject(): any {
        return AMFUtils.encodings[this.objectEncoding].read(this);
      }

      get bytesAvailable(): number /*uint*/ {
        return this._length - this.position;
      }

      get position(): number /*uint*/ {
        return this._position;
      }

      set position(offset: number /*uint*/) {
        offset = offset >>> 0;
        this._position = offset;
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
        this._littleEndian = type === "littleEndian" ;
      }

      toString(): string {
        log("HERE");
        return utf8encode(new Int8Array(this._buffer, 0, this._length));
      }

      writeMultiByte(value: string, charSet: string): void {
        value = asCoerceString(value); charSet = asCoerceString(charSet);
        notImplemented("packageInternal flash.utils.ObjectOutput::writeMultiByte"); return;
      }

      readMultiByte(length: number /*uint*/, charSet: string): string {
        length = length >>> 0; charSet = asCoerceString(charSet);
        notImplemented("packageInternal flash.utils.ObjectInput::readMultiByte"); return;
      }

      asGetNumericProperty(name): any {
        name = name | 0;
        if (name >= this._length) {
          return undefined;
        }
        return this._u8View[name];
      }

      asSetNumericProperty(name: number, value: any) {
        name = name | 0;
        var length = name + 1;
        this.ensureCapacity(length);
        this._u8View[name] = value;
        if (length > this._length) {
          this._length = length;
        }
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
        if (ByteArray._codeLengthOrder) {
          return;
        }

        ByteArray._codeLengthOrder = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
        ByteArray._distanceCodes = [];
        ByteArray._distanceExtraBits = [];

        for (var i = 0, j = 0, code = 1; i < 30; ++i) {
          ByteArray._distanceCodes[i] = code;
          code += 1 << (ByteArray._distanceExtraBits[i] = ~~((j += (i > 2 ? 1 : 0)) / 2));
        }

        var bitLengths = [];
        for (var i = 0; i < 32; ++i) {
          bitLengths[i] = 5;
        }

        ByteArray._fixedDistanceTable = ByteArray._makeHuffmanTable(bitLengths);

        ByteArray._lengthCodes = [];
        ByteArray._lengthExtraBits = [];
        for (var i = 0, j = 0, code = 3; i < 29; ++i) {
          ByteArray._lengthCodes[i] = code - (i == 28 ? 1 : 0);
          code += 1 << (ByteArray._lengthExtraBits[i] = ~~(((j += (i > 4 ? 1 : 0)) / 4) % 6));
        }

        for (var i = 0; i < 288; ++i) {
          bitLengths[i] = i < 144 || i > 279 ? 8 : (i < 256 ? 9 : 7);
        }

        ByteArray._fixedLiteralTable = ByteArray._makeHuffmanTable(bitLengths);
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

      private static readBits(input: ByteArray, size: number) {
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

      private static inflateBlock(input: ByteArray, output: ByteArray) {
        var readBits = ByteArray.readBits;
        var header = readBits(input, 3);
        switch (header >> 1) {
          case 0:
            input._bitBuffer = input._bitLength = 0;
            var len = input.readUnsignedShort();
            var nlen = input.readUnsignedShort();
            // assert((~nlen & 0xffff) === len, 'bad uncompressed block length', 'inflate');
            if ((~nlen & 0xffff) !== len) {
              throwCompressedDataError();
            }
            output.writeBytes(input, input.position, len);
            input.position += len;
            break;
          case 1:
            ByteArray.inflate(input, output, ByteArray._fixedLiteralTable, ByteArray._fixedDistanceTable);
            break;
          case 2:
            var bitLength = [];
            var numLiteralCodes = readBits(input, 5) + 257;
            var numDistanceCodes = readBits(input, 5) + 1;
            var numCodes = numLiteralCodes + numDistanceCodes;
            var numLengthCodes = readBits(input, 4) + 4;
            for (var i = 0; i < 19; ++i) {
              bitLength[ByteArray._codeLengthOrder[i]] = i < numLengthCodes ?
                readBits(input, 3) : 0;
            }
            var codeLengthTable = ByteArray._makeHuffmanTable(bitLength);
            bitLength = [];
            var i = 0;
            var prev = 0;
            while (i < numCodes) {
              var j = 1;
              var sym = ByteArray.readCode(input, codeLengthTable);
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
            var distanceTable = ByteArray._makeHuffmanTable(bitLength.splice(numLiteralCodes,
              numDistanceCodes));
            var literalTable = ByteArray._makeHuffmanTable(bitLength);
            ByteArray.inflate(input, output, literalTable, distanceTable);
            break;
          default:
            Shumway.Debug.unexpected('unknown block type: inflate');
        }
      }

      static inflate(input: ByteArray, output: ByteArray, literalTable, distanceTable) {
        var readBits = ByteArray.readBits;
        var readCode = ByteArray.readCode;
        var lengthCodes = ByteArray._lengthCodes;
        var lengthExtraBits = ByteArray._lengthExtraBits;
        var distanceCodes = ByteArray._distanceCodes;
        var distanceExtraBits = ByteArray._distanceExtraBits;

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

      static readCode(input: ByteArray, codeTable): number {
        var buffer = input._bitBuffer;
        var bitlen = input._bitLength;
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
        ByteArray._initializeTables();

        this.position = 0;
        var output = new ByteArray();
        switch (algorithm) {
          case 'zlib':
            output.writeUnsignedByte(0x78);
            output.writeUnsignedByte(0x9C);
          case 'deflate':
            output._littleEndian = true;

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
              output.writeUnsignedInt(ByteArray.adler32(this._u8View, 0, this.length));
            }
            break;
          default:
            return;
        }

        this.ensureCapacity(output._u8View.length);
        this._u8View.set(output._u8View);
        this.length = output.length;
        this.position = 0;
      }

      private _uncompress(algorithm: string): void {
        algorithm = asCoerceString(algorithm);
        ByteArray._initializeTables();

        var output = new ByteArray();
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
            while (this.position < this.length - 6) {
              ByteArray.inflateBlock(this, output);
            }
            this._littleEndian = littleEndian;
            break;
          default:
            return;
        }

        this.ensureCapacity(output._u8View.length);
        this._u8View.set(output._u8View);
        this.length = output.length;
        this.position = 0;
      }


//      Maybe Someday
//      atomicCompareAndSwapIntAt(byteIndex: number /*int*/, expectedValue: number /*int*/, newValue: number /*int*/): number /*int*/ {
//        byteIndex = byteIndex | 0; expectedValue = expectedValue | 0; newValue = newValue | 0;
//        notImplemented("public flash.utils.ByteArray::atomicCompareAndSwapIntAt"); return;
//      }
//      atomicCompareAndSwapLength(expectedLength: number /*int*/, newLength: number /*int*/): number /*int*/ {
//        expectedLength = expectedLength | 0; newLength = newLength | 0;
//        notImplemented("public flash.utils.ByteArray::atomicCompareAndSwapLength"); return;
//      }
//      get shareable(): boolean {
//        notImplemented("public flash.utils.ByteArray::get shareable"); return;
//      }
//      set shareable(newValue: boolean) {
//        newValue = !!newValue;
//        notImplemented("public flash.utils.ByteArray::set shareable"); return;
//      }

    }
  }
}
