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
  export var StreamNoDataError = {};
  
  var masks = new Uint32Array(33);
  for (var i = 1, mask = 0; i <= 32; ++i) {
    masks[i] = mask = (mask << 1) | 1;
  }
  
  export class Stream {
    bytes: Uint8Array;
    view: DataView;
    pos: number;
    end: number;

    bitBuffer: number;
    bitLength: number;

    constructor(buffer, offset?: number, length?: number, maxLength?: number) {
      if (offset === undefined)
        offset = 0;
      if (buffer.buffer instanceof ArrayBuffer) {
        offset += buffer.byteOffset;
        buffer = buffer.buffer;
      }
      if (length === undefined)
        length = buffer.byteLength - offset;
      if (maxLength === undefined)
        maxLength = length;

      this.bytes = new Uint8Array(buffer, offset, maxLength);
      this.view = new DataView(buffer, offset, maxLength);
      this.pos = 0;
      this.end = length;
      
      this.bitBuffer = 0;
      this.bitLength = 0;
    }
    
    align() {
      this.bitBuffer = this.bitLength = 0;
    }

    ensure(size: number) {
      if (this.pos + size > this.end) {
        throw StreamNoDataError;
      }
    }

    remaining(): number {
      return this.end - this.pos;
    }

    substream(begin: number, end: number): Stream {
      var stream = new Stream(this.bytes);
      stream.pos = begin;
      stream.end = end;
      return stream;
    }

    push(data) {
      var bytes = this.bytes;
      var newBytesLength = this.end + data.length;
      if (newBytesLength > bytes.length) {
        throw 'stream buffer overfow';
      }
      bytes.set(data, this.end);
      this.end = newBytesLength;
    }

    readSi8(): number {
      return this.view.getInt8(this.pos++);
    }

    readSi16(): number {
      var r = this.view.getInt16(this.pos, true);
      this.pos += 2;
      return r;
    }

    readSi32(): number {
      var r = this.view.getInt32(this.pos, true);
      this.pos += 4;
      return r;
    }

    readUi8(): number {
      return this.bytes[this.pos++];
    }

    readUi16(): number {
      var r = this.view.getUint16(this.pos, true);
      this.pos += 2;
      return r;
    }

    readUi32(): number {
      var r = this.view.getUint32(this.pos, true);
      this.pos += 4;
      return r;
    }

    readFixed(): number {
      var r = this.view.getInt32(this.pos, true) / 65536;
      this.pos += 4;
      return r;
    }

    readFixed8(): number {
      var r = this.view.getInt16(this.pos, true) / 256;
      this.pos += 2;
      return r;
    }

    readFloat16(): number {
      var ui16 = this.view.getUint16(this.pos, false);
      this.pos += 2;
      var sign = ui16 >> 15 ? -1 : 1;
      var exponent = (ui16 & 0x7c00) >> 10;
      var fraction = ui16 & 0x03ff;
      if (!exponent)
        return sign * Math.pow(2, -14) * (fraction / 1024);
      if (exponent === 0x1f)
        return fraction ? NaN : sign * Infinity;
      return sign * Math.pow(2, exponent - 15) * (1 + (fraction / 1024));
    }

    readFloat(): number {
      var r = this.view.getFloat32(this.pos, true);
      this.pos += 4;
      return r;
    }

    readDouble(): number {
      var r = this.view.getFloat64(this.pos, true);
      this.pos += 8;
      return r;
    }

    readEncodedU32(): number {
      var bytes = this.bytes;
      var val = bytes[this.pos++];
      if (!(val & 0x080))
        return val;
      val = (val & 0x7f) | bytes[this.pos++] << 7;
      if (!(val & 0x4000))
        return val;
      val = (val & 0x3fff) | bytes[this.pos++] << 14;
      if (!(val & 0x200000))
        return val;
      val = (val & 0x1FFFFF) | bytes[this.pos++] << 21;
      if (!(val & 0x10000000))
        return val;
      return (val & 0xFFFFFFF) | (bytes[this.pos++] << 28);
    }

    readBool(): boolean {
      return !!this.bytes[this.pos++];
    }

    readSb(size: number): number {
      return (this.readUb(size) << (32 - size)) >> (32 - size);
    }

    readUb(size: number): number {
      var buffer = this.bitBuffer;
      var bitlen = this.bitLength;
      var val = 0;
      while (size > bitlen) {
        if (bitlen > 24) {
          // Avoid overflow. Save current buffer in val and add remaining bits later.
          size -= bitlen;
          val = buffer << size;
          bitlen = 0;
        }
        buffer = (buffer << 8) | this.bytes[this.pos++];
        bitlen += 8;
      }
      bitlen -= size;
      val |= (buffer >>> bitlen) & masks[size];
      this.bitBuffer = buffer;
      this.bitLength = bitlen;
      return val;
    }

    readFb(size: number): number {
      return this.readSb(size) / 65536;
    }

    readString(length: number): string {
      var bytes = this.bytes;
      var codes: Uint8Array;
      var pos = this.pos;
      if (length > -1) {
        codes = bytes.subarray(pos, pos += length);
      } else {
        length = 0;
        for (var i = pos; bytes[i]; i++) {
          length++;
        }
        codes = bytes.subarray(pos, pos += length);
        pos++;
      }
      this.pos = pos;
      var str = Shumway.StringUtilities.utf8encode(codes);
      if (str.indexOf('\0') >= 0) {
        str = str.split('\0').join('');
      }
      return str;
    }
  } 
}
