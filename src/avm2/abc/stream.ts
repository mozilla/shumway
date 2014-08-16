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

module Shumway.AVM2.ABC {
  import isString = Shumway.isString;
  import isNumber = Shumway.isNumber;
  import isNumeric = Shumway.isNumeric;
  import isObject = Shumway.isObject;
  import assert = Shumway.Debug.assert;

  declare var TextDecoder;

  var textDecoder: any = null;
  if (typeof TextDecoder !== "undefined") {
    textDecoder = new TextDecoder();
  }

  export class AbcStream {
    private static _resultBuffer = new Int32Array(256);
    private _bytes: Uint8Array;
    private _view: DataView;
    private _position: number;

    constructor (bytes: Uint8Array) {
      this._bytes = bytes;
      this._view = new DataView(bytes.buffer, bytes.byteOffset);
      this._position = 0;
    }

    private static _getResultBuffer(length: number) {
      if (!AbcStream._resultBuffer || AbcStream._resultBuffer.length < length) {
        AbcStream._resultBuffer = new Int32Array(length * 2);
      }
      return AbcStream._resultBuffer;
    }

    get position(): number {
      return this._position;
    }

    remaining(): number  {
      return this._bytes.length - this._position;
    }

    seek(position: number) {
      this._position = position;
    }

    readU8(): number {
      return this._bytes[this._position++];
    }

    readU8s(count: number) {
      var b = new Uint8Array(count);
      b.set(this._bytes.subarray(this._position, this._position + count), 0);
      this._position += count;
      return b;
    }

    readS8(): number {
      return this._bytes[this._position++] << 24 >> 24;
    }

    readU32(): number {
      return this.readS32() >>> 0;
    }

    readU30(): number {
      var result = this.readU32();
      if (result & 0xc0000000) {
        // TODO: Spec says this is a corrupt ABC file, but it seems that some content
        // has this, e.g. 1000-0.abc
        // error("Corrupt ABC File");
        return result;
      }
      return result;
    }

    readU30Unsafe(): number {
      return this.readU32();
    }

    readS16(): number {
      return (this.readU30Unsafe() << 16) >> 16;
    }

    /**
     * Read a variable-length encoded 32-bit signed integer. The value may use one to five bytes (little endian),
     * each contributing 7 bits. The most significant bit of each byte indicates that the next byte is part of
     * the value. The spec indicates that the most significant bit of the last byte to be read is sign extended
     * but this turns out not to be the case in the real implementation, for instance 0x7f should technically be
     * -1, but instead it's 127. Moreover, what happens to the remaining 4 high bits of the fifth byte that is
     * read? Who knows, here we'll just stay true to the Tamarin implementation.
     */
      readS32(): number {
      var result = this.readU8();
      if (result & 0x80) {
        result = result & 0x7f | this.readU8() << 7;
        if (result & 0x4000) {
          result = result & 0x3fff | this.readU8() << 14;
          if (result & 0x200000) {
            result = result & 0x1fffff | this.readU8() << 21;
            if (result & 0x10000000) {
              result = result & 0x0fffffff | this.readU8() << 28;
              result = result & 0xffffffff;
            }
          }
        }
      }
      return result;
    }

    readWord(): number {
      var result = this._view.getUint32(this._position, true);
      this._position += 4;
      return result;
    }

    readS24(): number {
      var u = this.readU8() | (this.readU8() << 8) | (this.readU8() << 16);
      return (u << 8) >> 8;
    }

    readDouble(): number {
      var result = this._view.getFloat64(this._position, true);
      this._position += 8;
      return result;
    }

    readUTFString(length): string {
      /**
       * Use the TextDecoder API whenever available.
       * http://encoding.spec.whatwg.org/#concept-encoding-get
       */
      if (textDecoder) {
        var position = this._position;
        this._position += length;
        return textDecoder.decode(this._bytes.subarray(position, position + length));
      }

      var pos = this._position;
      var end = pos + length;
      var bytes = this._bytes;
      var i = 0;
      var result = AbcStream._getResultBuffer(length * 2);
      while (pos < end) {
        var c = bytes[pos++];
        if (c <= 0x7f) {
          result[i++] = c;
        } else if (c >= 0xc0) { // multibyte
          var code = 0;
          if (c < 0xe0) { // 2 bytes
            code = ((c & 0x1f) << 6) | (bytes[pos++] & 0x3f);
          } else if (c < 0xf0) { // 3 bytes
            code = ((c & 0x0f) << 12) | ((bytes[pos++] & 0x3f) << 6) | (bytes[pos++] & 0x3f);
          } else { // 4 bytes
            // turned into two characters in JS as surrogate pair
            code = (((c & 0x07) << 18) | ((bytes[pos++] & 0x3f) << 12) | ((bytes[pos++] & 0x3f) << 6) | (bytes[pos++] & 0x3f)) - 0x10000;
            // High surrogate
            result[i++] = ((code & 0xffc00) >>> 10) + 0xd800;
            // Low surrogate
            code = (code & 0x3ff) + 0xdc00;
          }
          result[i++] = code;
        } // Otherwise it's an invalid UTF8, skipped.
      }
      this._position = pos;
      return Shumway.StringUtilities.fromCharCodeArray(result.subarray(0, i));
    }
  }
}
