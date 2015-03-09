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

module Shumway.AVMX.AS {
  import notImplemented = Shumway.Debug.notImplemented;
  import unexpected = Shumway.Debug.unexpected;
  import Namespace = Shumway.AVMX.Namespace;
  import Multiname = Shumway.AVMX.Multiname;

  import utf8decode = Shumway.StringUtilities.utf8decode;
  import utf8encode = Shumway.StringUtilities.utf8encode;
  import clamp = Shumway.NumberUtilities.clamp;
  import swap16 = Shumway.IntegerUtilities.swap16;
  import swap32 = Shumway.IntegerUtilities.swap32;
  import floatToInt32 = Shumway.IntegerUtilities.floatToInt32;
  import int32ToFloat = Shumway.IntegerUtilities.int32ToFloat;

  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import assert = Shumway.Debug.assert;

  export module flash.net {
    export class ObjectEncoding extends ASObject {
      public static AMF0 = 0;
      public static AMF3 = 3;
      public static DEFAULT = ObjectEncoding.AMF3;

      static get dynamicPropertyWriter(): any /* flash.net.IDynamicPropertyWriter */ {
        notImplemented("public flash.net.ObjectEncoding::get dynamicPropertyWriter");
        return null;
      }
      static set dynamicPropertyWriter(value: any /* flash.net.IDynamicPropertyWriter */) {
        notImplemented("public flash.net.ObjectEncoding::set dynamicPropertyWriter");
      }
    }
  }

  export module flash.utils {

    export interface IDataInput {
      readBytes: (bytes: flash.utils.ByteArray, offset?: number /*uint*/, length?: number /*uint*/) => void;
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
      readObject: () => any;
      objectEncoding: number /*uint*/;
      endian: string;
    }

    export interface IDataOutput {
      writeBytes: (bytes: flash.utils.ByteArray, offset?: number /*uint*/, length?: number /*uint*/) => void;
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
      writeObject: (object: any) => void;
      objectEncoding: number /*uint*/;
      endian: string;
    }

    export class ByteArray extends ASObject implements IDataInput, IDataOutput {

      public static classNatives: any [] = [DataBuffer];
      public static instanceNatives: any [] = [DataBuffer.prototype];

      static classInitializer: any = function() {
        var proto: any = DataBuffer.prototype;
        ObjectUtilities.defineNonEnumerableProperty(proto, '$BgtoJSON', proto.toJSON);
      }

      constructor(source: any) {
        false && super();
        var self: ByteArray = this;
        DataBuffer.call(self);
        var buffer: ArrayBuffer;
        var length = 0;
        if (source) {
          if (source instanceof ArrayBuffer) {
            buffer = source.slice();
          } else if (Array.isArray(source)) {
            buffer = new Uint8Array(source).buffer;
          } else if ('buffer' in source) {
            if (source.buffer instanceof ArrayBuffer) {
              buffer = new Uint8Array(source).buffer;
            } else if (source.buffer instanceof Uint8Array) {
              var begin = source.buffer.byteOffset;
              buffer = source.buffer.buffer.slice(begin, begin + source.buffer.length);
            } else {
              release || assert(source.buffer instanceof ArrayBuffer);
              buffer = source.buffer.slice();
            }
          } else {
            Debug.unexpected("Source type.");
          }
          length = buffer.byteLength;
        } else {
          buffer = new ArrayBuffer(ByteArray.INITIAL_SIZE);
        }
        self._buffer = buffer;
        self._length = length;
        self._position = 0;
        self._resetViews();
        self._objectEncoding = ByteArray.defaultObjectEncoding;
        self._littleEndian = false; // AS3 is bigEndian by default.
        self._bitBuffer = 0;
        self._bitLength = 0;
      }

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

      toJSON() {
        return "ByteArray";
      }

      private _buffer: ArrayBuffer;
      private _length: number;
      private _position: number;
      private _littleEndian: boolean;
      private _objectEncoding: number;

      private _bitBuffer: number;
      private _bitLength: number;

      private _resetViews: () => void;

      asGetNumericProperty: (name: number) => number;
      asSetNumericProperty: (name: number, value: number) => void;

//      readBytes: (bytes: flash.utils.ByteArray, offset: number, length: number) => void = DataBuffer.prototype.readByte;
//      writeBytes: (bytes: flash.utils.ByteArray, offset: number, length: number) => void = DataBuffer.prototype.writeBytes;

      readBytes: (bytes: flash.utils.ByteArray, offset?: number /*uint*/, length?: number /*uint*/) => void;
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
      readObject(): any {
        switch (this._objectEncoding) {
          case flash.net.ObjectEncoding.AMF0:
            return AMF0.read(this);
          case flash.net.ObjectEncoding.AMF3:
            return AMF3.read(this);
          default:
            unexpected("Object Encoding");
        }
      }

      writeBytes: (bytes: flash.utils.ByteArray, offset?: number /*uint*/, length?: number /*uint*/) => void;
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
      writeObject(object: any) {
        switch (this._objectEncoding) {
          case flash.net.ObjectEncoding.AMF0:
            return AMF0.write(this, object);
          case flash.net.ObjectEncoding.AMF3:
            return AMF3.write(this, object);
          default:
            unexpected("Object Encoding");
        }
      }

      objectEncoding: number /*uint*/;
      endian: string;

      readRawBytes: () => Int8Array;
      writeRawBytes: (bytes: Uint8Array) => void;
      position: number;
      length: number;

      axGetProperty(mn: Multiname): any {
        if (isNumeric(mn.name)) {
          var self = <any>this;
          return self.getValue(mn.name);
        }
        var t = this.traits.getTrait(mn, -1);
        if (t) {
          return this[t.getName().getMangledName()];
        }
      }

      axSetProperty(mn: Multiname, value: any): void {
        if (isNumeric(mn.name)) {
          var self = <any>this;
          self.setValue(mn.name, value);
          return;
        }
        var t = this.traits.getTrait(mn, -1);
        if (t) {
          this[t.getName().getMangledName()] = value;
        }
      }
    }
  }
}
