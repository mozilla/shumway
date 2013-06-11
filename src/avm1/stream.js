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

function ActionsDataStream(array, swfVersion) {
  this.array = array;
  this.position = 0;
  this.end = array.length;

  if (swfVersion >= 6) {
    this.readString = this.readUTF8String;
  } else {
    // TODO use system locale to determine if the shift-JIS
    // decoding is necessary
    this.readString = this.readANSIString;
  }

  // endianess sanity check
  var buffer = new ArrayBuffer(4);
  (new Int32Array(buffer))[0] = 1;
  if (!(new Uint8Array(buffer))[0]) {
    throw new Error("big-endian platform");
  }
}
ActionsDataStream.prototype = {
  readUI8: function ActionsDataStream_readUI8() {
    return this.array[this.position++];
  },
  readUI16: function ActionsDataStream_readUI16() {
    var position = this.position, array = this.array;
    var value = (array[position + 1] << 8) | array[position];
    this.position = position + 2;
    return value;
  },
  readSI16: function ActionsDataStream_readSI16() {
    var position = this.position, array = this.array;
    var value = (array[position + 1] << 8) | array[position];
    this.position = position + 2;
    return value < 0x8000 ? value : (value - 0x10000);
  },
  readInteger: function ActionsDataStream_readInteger() {
    var position = this.position, array = this.array;
    var value = array[position] | (array[position + 1] << 8) |
      (array[position + 2] << 16) | (array[position + 3] << 24);
    this.position = position + 4;
    return value;
  },
  readFloat: function ActionsDataStream_readFloat() {
    var position = this.position;
    var array = this.array;
    var buffer = new ArrayBuffer(4);
    var bytes = new Uint8Array(buffer);
    bytes[0] = array[position];
    bytes[1] = array[position + 1];
    bytes[2] = array[position + 2];
    bytes[3] = array[position + 3];
    this.position = position + 4;
    return (new Float32Array(buffer))[0];
  },
  readDouble: function ActionsDataStream_readDouble() {
    var position = this.position;
    var array = this.array;
    var buffer = new ArrayBuffer(8);
    var bytes = new Uint8Array(buffer);
    bytes[4] = array[position];
    bytes[5] = array[position + 1];
    bytes[6] = array[position + 2];
    bytes[7] = array[position + 3];
    bytes[0] = array[position + 4];
    bytes[1] = array[position + 5];
    bytes[2] = array[position + 6];
    bytes[3] = array[position + 7];
    this.position = position + 8;
    return (new Float64Array(buffer))[0];
  },
  readBoolean: function ActionsDataStream_readBoolean() {
    return !!this.readUI8();
  },
  readANSIString: function ActionsDataStream_readANSIString() {
    var value = '';
    var ch;
    while ((ch = this.readUI8())) {
      value += String.fromCharCode(ch);
    }
    return value;
  },
  readUTF8String: function ActionsDataStream_readUTF8String() {
    var value = '';
    var ch;
    while ((ch = this.readUI8())) {
      if (ch < 0x80) {
        value += String.fromCharCode(ch);
        continue;
      }

      if ((ch & 0xC0) === 0x80) {
        throw new Error('Invalid UTF8 encoding');
      }

      var currentPrefix = 0xC0;
      var validBits = 5;
      do {
        var mask = (currentPrefix >> 1) | 0x80;
        if ((ch & mask) === currentPrefix) {
          break;
        }
        currentPrefix = mask;
        --validBits;
      } while (validBits >= 0);

      var code = (ch & ((1 << validBits) - 1));
      for (var i = 5; i >= validBits; --i) {
        ch = this.readUI8();
        if ((ch & 0xC0) !== 0x80) {
          throw new Error('Invalid UTF8 encoding');
        }
        code = (code << 6) | (ch & 0x3F);
      }

      if (code >= 0x10000) {
        value += String.fromCharCode((((code - 0x10000) >> 10) & 0x3FF) |
          0xD800, (code & 0x3FF) | 0xDC00);
      } else {
        value += String.fromCharCode(code);
      }
    }
    return value;
  },
  readBytes: function ActionsDataStream_readBytes(length) {
    var position = this.position;
    var remaining = Math.max(this.end - position, 0);
    if (remaining < length) {
      length = remaining;
    }
    var subarray = this.array.subarray(position, position + length);
    this.position = position + length;
    return subarray;
  }
};

// exports for testing
if (typeof GLOBAL !== 'undefined') {
  GLOBAL.ActionsDataStream = ActionsDataStream;
}
